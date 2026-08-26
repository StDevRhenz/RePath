export interface RecoveryCase {
  case_id: string;
  title: string;
  status: string;
  requirements: string[];
  submitted_documents: string[];
  missing_documents: string[];
  recovery_steps: string[];
}

const API_URL = "http://127.0.0.1:8000";

export async function getCase(caseId: string): Promise<RecoveryCase> {
  const response = await fetch(`${API_URL}/api/cases/${caseId}`);

  if (!response.ok) {
    throw new Error("Failed to load recovery case");
  }

  return response.json();
}