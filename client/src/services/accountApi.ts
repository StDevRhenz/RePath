import { API_URL } from "@/lib/apiConfig";
import { authFetch } from "@/lib/authFetch";

export async function deleteAccountData(): Promise<void> {
  const response = await authFetch(`${API_URL}/api/account`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete account data.");
  }
}
