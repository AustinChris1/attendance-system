import "../config/face-api";
import * as faceapi from "@vladmandic/face-api";
import { db, attendanceDb, authenticateUser } from "../config/firebase";
import { ref, get, push, set, update } from "firebase/database";
import { loadImage } from "canvas";
import { Hono } from "hono";

// Authenticate user before making Firebase calls
await authenticateUser();

// Firebase Database Reference
const dbRef = ref(db);

// Function to get labels from the database
const getLabels = () =>
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      return Object.values(snapshot.val()).map((entry) => (entry as any).name);
    }
    throw new Error("Failed to load labels");
  });

const labels = await getLabels();

// Load face-api models
const loadModels = async () => {
  const modelPath = "https://ruisantosdotme.github.io/face-api.js/weights/";
  try {
    console.log("Loading face-api models...");
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    ]);
    console.log("Models loaded successfully.");
  } catch (error) {
    throw new Error(`Error loading face-api models: ${error}`);
  }
};

await loadModels();

// Function to load labeled images for face recognition
const loadLabeledImages = async () => {
  const descriptions = await Promise.all(
    labels.map(async (label) => {
      const labeledImage = await loadImage(
        `https://firebasestorage.googleapis.com/v0/b/face-access-1.firebasestorage.app/o/images%2F${label}.jpg?alt=media`
      );

      if (!labeledImage || labeledImage.width === 0 || labeledImage.height === 0) {
        console.warn(`Invalid image for ${label}`);
        return null;
      }

      const detections = await faceapi
        .detectSingleFace(labeledImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detections) {
        console.warn(`Failed to create detections for ${label}`);
        return null;
      }
      return new faceapi.LabeledFaceDescriptors(label, [detections.descriptor]);
    })
  );

  return descriptions.filter((d) => !!d);
};

const labeledFaceDescriptors = await loadLabeledImages();

const getUserId = async (name: string) => {
  try {
    const usersRef = ref(db, "/");
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return 0;

    const users = snapshot.val();
    
    return Object.values(users).find((user: any) => user.id);
  } catch (error) {
    console.error("Error fetching user:", error);
    return 0;
  }
};

// Function to log attendance in Firebase
const logAttendance = async (userId: number, userName: string) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Convert current time to UTC+1 (WAT)
  const currentTime = new Date(
    new Date().getTime() + 60 * 60 * 1000
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const attendanceRef = ref(attendanceDb, `attendance/${currentDate}/${userId}`);
  const snapshot = await get(attendanceRef);

  // If attendance already exists, skip logging
  if (snapshot.exists()) {
    console.log(`Skipping attendance for ${userName}, already logged today.`);
    return;
  }

  // Log attendance with userId as key
  await set(attendanceRef, {
    id: userId,
    name: userName,
    status: "Present",
    time: currentTime,
  });

  console.log(`Attendance logged for ${userName} at ${currentTime} (UTC+1)`);
};


// Server route to process incoming images
export const router = new Hono().post("/stream", async (c) => {
  try {
    // Check if content-type is JSON
    if (!c.req.header("content-type")?.includes("application/json")) {
      return c.json({ error: "Invalid Content-Type" }, 400);
    }

    // Parse JSON safely
    const rawBody = await c.req.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (jsonError) {
      console.error("Invalid JSON:", jsonError);
      return c.json({ error: "Invalid JSON format" }, 400);
    }

    const { image: base64Image } = parsedBody;

    if (!base64Image || typeof base64Image !== "string") {
      return c.json({ error: "Image data not provided or invalid" }, 400);
    }
    
    // Decode base64 to buffer
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Load image for face processing
    const image = await loadImage(imageBuffer);
    if (!image || image.width === 0 || image.height === 0) {
      return c.json({ error: "Invalid image size" }, 400);
    }

    // Perform face detection
    const detections = await faceapi
      .detectAllFaces(image as any)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 0) {
      return c.json({ message: "No detections found" }, 400);
    }

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.8);
    const results = detections.map((d) => faceMatcher.findBestMatch(d.descriptor));

    for (const result of results) {
      if (result.label !== "unknown") {
        const userID = await getUserId(result.label);
        if (userID) {
          await logAttendance(userID.id, result.label);
        }
      }
    }

    return c.json({ message: "Processed successfully", results: results.map((r) => r.toString()) });
  } catch (error) {
    console.error("Error processing request:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
