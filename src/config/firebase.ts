import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const config = {
	apiKey: "AIzaSyAQX2ihpFP_-nRzzoO5QijynnhSF8diyn4",
	authDomain: "face-access-1.firebaseapp.com",
	databaseURL: "https://face-access-1-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "face-access-1",
	storageBucket: "face-access-1.appspot.com",
	messagingSenderId: "179962483174",
	appId: "1:179962483174:web:6aebc188301ed6562ac627",
	measurementId: "G-1KHKWXGSYD"
};

// Initialize Firebase
export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const attendanceDb = getDatabase(app, "https://face-access-attendance.europe-west1.firebasedatabase.app");

// Async authentication function
export async function authenticateUser() {
	try {
		await signInWithEmailAndPassword(auth, "austinchrisiwu@gmail.com", "Austin321");
		console.log("Authentication successful.");
	} catch (error) {
		console.error("Authentication failed:", error);
	}
}
