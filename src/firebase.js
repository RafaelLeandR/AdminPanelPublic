import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyANroWwXGfRdG1LtVFHGomFUyBxwWt93Jc",
  authDomain: "loja-admin-458b5.firebaseapp.com",
  projectId: "loja-admin-458b5",
  storageBucket: "loja-admin-458b5.firebasestorage.app",
  messagingSenderId: "154894503061",
  appId: "1:154894503061:web:42c87304555e26cd8d5f9c",
  measurementId: "G-0JCV74YKHN"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;