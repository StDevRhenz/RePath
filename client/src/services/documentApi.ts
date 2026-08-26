const API_URL = "http://127.0.0.1:8000";

export interface UploadDocumentResponse {
  case_id: string;
  document_name: string;
  original_file_name: string;
  stored_file_name: string;
  content_type: string;
  status: "uploaded";
}

export async function uploadCaseDocument(
  caseId: string,
  documentName: string,
  file: File
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  formData.append("document_name", documentName);
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/cases/${caseId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload document.");
  }

  return response.json();
}