import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { DEMO_MODE } from "@/lib/demoMode";

const env = (name: string) => import.meta.env[name] ?? (DEMO_MODE ? `demo-${name.toLowerCase()}` : undefined);

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();