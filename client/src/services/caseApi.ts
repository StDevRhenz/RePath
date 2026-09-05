import { API_URL } from "@/lib/apiConfig";
import { authFetch } from "@/lib/authFetch";
import { DEMO_MODE } from "@/lib/demoMode";
import { DEMO_CASE_ID, finalizeDemoCase, getDemoCase, getDemoCases } from "@/data/demoRecovery";

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
  updated_at?: string | null;
  requirements: string[];
  submitted_documents: string[];
  missing_documents: string[];
  recovery_steps: string[];
  documents: CaseDocument[];
  agent_session_id?: string | null;
  applicant_name?: string;
  business_name?: string;
  application_type?: string;
  issues_count?: number;
  replacement_count?: number;
  submitted_at?: string;
  last_reviewed_at?: string;
}

export interface FinalReviewResponse {
  case_id: string;
  status: "ready_to_resubmit";
  message: string;
}

export interface MyCasesResponse {
  cases: RecoveryCase[];
}

export async function getCase(caseId: string): Promise<RecoveryCase> {
  if (DEMO_MODE && caseId === DEMO_CASE_ID) return getDemoCase();
  const response = await authFetch(`${API_URL}/api/cases/${caseId}`);

  if (!response.ok) {
    throw new Error("Failed to load recovery case");
  }

  return response.json();
}

export async function getMyCases(): Promise<MyCasesResponse> {
  if (DEMO_MODE) return getDemoCases();
  const response = await authFetch(`${API_URL}/api/cases`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load recovery cases.")
    );
  }

  return response.json();
}

export async function finalizeRecoveryCase(
  caseId: string
): Promise<FinalReviewResponse> {
  if (DEMO_MODE && caseId === DEMO_CASE_ID) return finalizeDemoCase();
  const response = await authFetch(
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
