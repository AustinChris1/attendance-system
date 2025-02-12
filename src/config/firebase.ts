import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";
// import { getDatabase, ref, get, child } from "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
	apiKey: "AIzaSyAQX2ihpFP_-nRzzoO5QijynnhSF8diyn4",
	authDomain: "face-access-1.firebaseapp.com",
	databaseURL: "https://face-access-1-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "face-access-1",
	storageBucket: "face-access-1.firebasestorage.app",
	messagingSenderId: "179962483174",
	appId: "1:179962483174:web:6aebc188301ed6562ac627",
	measurementId: "G-1KHKWXGSYD"
  };

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getDatabase(app);
await signInWithEmailAndPassword(auth, "austinchrisiwu@gmail.com", "Austin321");
