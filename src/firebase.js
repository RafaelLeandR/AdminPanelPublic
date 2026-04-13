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
  appId: "1:154894503061:web:42c87304555e26cd8d5f9c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);