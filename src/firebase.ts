import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAWHlSGuUl7jMJHum1x01m9pmLi5fGqcjk",
    authDomain: "chess-openings-teacher.firebaseapp.com",
    projectId: "chess-openings-teacher",
    storageBucket: "chess-openings-teacher.firebasestorage.app",
    messagingSenderId: "827252316524",
    appId: "1:827252316524:web:6a3394e6b20a1b54b4fb49"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const database = getDatabase(app);
export default db;
export const auth = getAuth(app);