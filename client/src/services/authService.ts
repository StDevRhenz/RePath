import {
  deleteUser,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, googleProvider } from "@/lib/firebase";

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function deleteCurrentFirebaseUser(user: User): Promise<void> {
  try {
    await deleteUser(user);
  } catch (error) {
    if (!isRecentLoginRequiredError(error)) {
      throw error;
    }

    const result = await reauthenticateWithPopup(user, googleProvider);
    await deleteUser(result.user);
  }
}

function isRecentLoginRequiredError(error: unknown) {
  return error instanceof FirebaseError
    && error.code === "auth/requires-recent-login";
}
