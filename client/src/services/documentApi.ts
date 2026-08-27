import type { CaseDocument, CaseDocumentStatus } from "@/services/caseApi";
import { API_URL } from "@/lib/apiConfig";
import { authFetch } from "@/lib/authFetch";

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

export async function uploadCaseDocument(
  caseId: string,
  documentName: string,
  file: File
): Promise<UploadDocumentResponse> {
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
      await getErrorMessage(response, "Failed to validate documents.")
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
