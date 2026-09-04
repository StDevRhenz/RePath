import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthWithStateReady = typeof auth & {
  authStateReady?: () => Promise<void>;
};

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthRequiredError";
  }
}

async function waitForAuthStateReady() {
  const authWithStateReady = auth as AuthWithStateReady;

  if (typeof authWithStateReady.authStateReady === "function") {
    await authWithStateReady.authStateReady();
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
}

async function getAuthenticatedUser(): Promise<User> {
  await waitForAuthStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

export async function getAuthHeaders() {
  const user = await getAuthenticatedUser();
  const token = await user.getIdToken();

  if (!token.trim()) {
    throw new AuthRequiredError();
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
