import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

let authInitializationPromise: Promise<void> | null = null;

function waitForAuthInitialization() {
  if (authInitializationPromise) {
    return authInitializationPromise;
  }

  authInitializationPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });

  return authInitializationPromise;
}

export async function getAuthHeaders() {
  if (!auth.currentUser) {
    await waitForAuthInitialization();
  }

  const user = auth.currentUser;

  if (!user) {
    return {};
  }

  const token = await user.getIdToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const authHeaders = await getAuthHeaders();
  const headers = new Headers(init.headers);

  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return fetch(input, {
    ...init,
    headers,
  });
}
