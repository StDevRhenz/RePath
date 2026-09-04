import type { CaseDocument, CaseDocumentStatus } from "@/services/caseApi";
import { API_URL } from "@/lib/apiConfig";
import { authFetch, getAuthHeaders } from "@/lib/authFetch";

export interface UploadDocumentResponse {
  case_id: string;
  document_name: string;
  original_file_name: string;
  stored_file_name: string;
  content_type: string;
  status: "uploaded";
  validation_message: string;
  validated_at: null;
}

export interface ValidateDocumentsResponse {
  case_id: string;
  documents: Array<
    CaseDocument & {
      status: Extract<CaseDocumentStatus, "valid" | "needs_attention">;
    }
  >;
}

export interface RemoveDocumentResponse {
  case_id: string;
  document_name: string;
  status: "removed";
}

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export async function uploadCaseDocument(
  caseId: string,
  documentName: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadDocumentResponse> {
  if (onProgress) {
    const authHeaders = await getAuthHeaders();
    const formData = new FormData();
    formData.append("document_name", documentName);
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `${API_URL}/api/cases/${caseId}/documents`);
      request.timeout = 120_000;
      Object.entries(authHeaders).forEach(([key, value]) => request.setRequestHeader(key, value));
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      request.onerror = () => reject(new Error("The upload was interrupted. Check your connection and try again."));
      request.ontimeout = () => reject(new Error("The upload took too long. Check your connection and try again."));
      request.onabort = () => reject(new Error("The upload was cancelled. Please try again."));
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          try {
            resolve(JSON.parse(request.responseText) as UploadDocumentResponse);
          } catch {
            reject(new Error("The document uploaded, but the server returned an invalid response."));
          }
          return;
        }
        try {
          const data = JSON.parse(request.responseText) as { detail?: string };
          reject(new Error(data.detail || "We couldn't upload this document."));
        } catch {
          reject(new Error("We couldn't upload this document. Please try again."));
        }
      };
      request.send(formData);
    });
  }

  const formData = new FormData();

  formData.append("document_name", documentName);
  formData.append("file", file);

  const response = await authFetch(
    `${API_URL}/api/cases/${caseId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to upload document.")
    );
  }

  return response.json();
}

export async function getCaseDocumentFile(caseId: string, documentName: string): Promise<Blob> {
  const response = await authFetch(
    `${API_URL}/api/cases/${caseId}/documents/${encodeURIComponent(documentName)}/file`
  );
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "We couldn't open this document."));
  }
  return response.blob();
}

export async function validateCaseDocuments(
  caseId: string
): Promise<ValidateDocumentsResponse> {
  const response = await authFetch(
    `${API_URL}/api/cases/${caseId}/documents/validate`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "We couldn't check these documents. Please try again.")
    );
  }

  return response.json();
}

export async function removeCaseDocument(
  caseId: string,
  documentName: string
): Promise<RemoveDocumentResponse> {
  const response = await authFetch(
    `${API_URL}/api/cases/${caseId}/documents/${encodeURIComponent(
      documentName
    )}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to remove document.")
    );
  }

  return response.json();
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}
