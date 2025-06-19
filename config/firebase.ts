import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbwyYDIQg6SmuwdQ7v-A4KJt0dDzv1OoE",
  authDomain: "community-fea1f.firebaseapp.com",
  projectId: "community-fea1f",
  storageBucket: "community-fea1f.firebasestorage.app",
  messagingSenderId: "1088652494716",
  appId: "1:1088652494716:web:aaea09b3f0a8cc70f446f9"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth
const auth = getAuth(app);

// Initialiser Firestore
const db = getFirestore(app);

// Initialiser Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
