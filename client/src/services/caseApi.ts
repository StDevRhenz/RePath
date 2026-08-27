export type CaseDocumentStatus =
  | "uploaded"
  | "validating"
  | "valid"
  | "needs_attention";

export interface CaseDocument {
  document_name: string;
  original_file_name: string;
  stored_file_name: string;
  content_type: string;
  status: CaseDocumentStatus;
  validation_message?: string;
  validated_at?: string | null;
}

export interface RecoveryCase {
  case_id: string;
  title: string;
  status: string;
  requirements: string[];
  submitted_documents: string[];
  missing_documents: string[];
  recovery_steps: string[];
  documents: CaseDocument[];
}

export interface FinalReviewResponse {
  case_id: string;
  status: "ready_to_resubmit";
  message: string;
}

const API_URL = "http://127.0.0.1:8000";

export async function getCase(caseId: string): Promise<RecoveryCase> {
  const response = await fetch(`${API_URL}/api/cases/${caseId}`);

  if (!response.ok) {
    throw new Error("Failed to load recovery case");
  }

  return response.json();
}

export async function finalizeRecoveryCase(
  caseId: string
): Promise<FinalReviewResponse> {
  const response = await fetch(
    `${API_URL}/api/cases/${caseId}/final-review`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to complete final review.")
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
