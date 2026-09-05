import type { RecoveryMessage } from "@/services/agentApi";
import type {
  CaseDocument,
  FinalReviewResponse,
  RecoveryCase,
} from "@/services/caseApi";

export const DEMO_CASE_ID = "demo-rg-brew-corner";
export const DEMO_INPUT =
  "I’m trying to register my small business, but my application was returned. I received a notice and I’m not sure what I need to fix first. It mentions inconsistent business address information, incomplete proof of occupancy, and an outdated business clearance. Can you help me understand what went wrong and what I need to do next?";

const originalDocuments: CaseDocument[] = [
  {
    document_name: "Application Form",
    original_file_name: "Application_Form.pdf",
    stored_file_name: "Application_Form.pdf",
    content_type: "application/pdf",
    status: "needs_attention",
    validation_message: "Address format inconsistency",
    validated_at: "2026-09-06T09:00:00Z",
  },
  {
    document_name: "Proof of Occupancy",
    original_file_name: "Lease_Agreement.pdf",
    stored_file_name: "Lease_Agreement.pdf",
    content_type: "application/pdf",
    status: "needs_attention",
    validation_message: "Missing pages/signatures",
    validated_at: "2026-09-06T09:00:00Z",
  },
  {
    document_name: "Business Clearance",
    original_file_name: "Business_Clearance_2025.pdf",
    stored_file_name: "Business_Clearance_2025.pdf",
    content_type: "application/pdf",
    status: "needs_attention",
    validation_message: "Current clearance required",
    validated_at: "2026-09-06T09:00:00Z",
  },
];

const correctedNames: Record<string, string> = {
  "Application Form": "Application_Form_Corrected.pdf",
  "Proof of Occupancy": "Lease_Agreement_Complete.pdf",
  "Business Clearance": "Business_Clearance_2026.pdf",
};

function createCase(ready = false): RecoveryCase {
  return {
    case_id: DEMO_CASE_ID,
    title: "RG Brew Corner · Small Business Registration",
    status: ready ? "ready_to_resubmit" : "action_required",
    updated_at: "2026-09-06T09:00:00Z",
    requirements: [
      "Consistent business address across the application and supporting documents",
      "Complete signed proof of occupancy",
      "Current valid business clearance",
    ],
    submitted_documents: originalDocuments.map((document) => document.document_name),
    missing_documents: [],
    recovery_steps: [
      "Resolve business address inconsistency — Use one consistent business address format across the application and supporting documents.",
      "Upload complete proof of occupancy — Replace the incomplete lease agreement with a complete signed copy.",
      "Replace outdated business clearance — Upload the current valid clearance.",
      "Final readiness review — RePath reviews the corrected documents and identifies any remaining inconsistencies before resubmission.",
    ],
    documents: ready
      ? originalDocuments.map((document) => ({
          ...document,
          original_file_name: correctedNames[document.document_name],
          stored_file_name: correctedNames[document.document_name],
          status: "valid" as const,
          validation_message: "Verified by RePath checks",
        }))
      : originalDocuments.map((document) => ({ ...document })),
    agent_session_id: "demo-session-rg-brew-corner",
    applicant_name: "Rhenz Ganotice",
    business_name: "RG Brew Corner",
    application_type: "Small Business Registration",
    issues_count: ready ? 0 : 3,
    replacement_count: ready ? 0 : 2,
    submitted_at: "September 2, 2026",
    last_reviewed_at: "September 6, 2026",
  };
}

let demoCase = loadCase() ?? createCase();

export function getDemoCase() {
  return clone(demoCase);
}

export function getDemoCases() {
  return { cases: [getDemoCase()] };
}

export function updateDemoDocument(
  documentName: string,
  fileName: string,
  contentType = "application/pdf"
) {
  demoCase = {
    ...demoCase,
    updated_at: new Date().toISOString(),
    documents: demoCase.documents.map((document) =>
      document.document_name === documentName
        ? {
            ...document,
            original_file_name: fileName,
            stored_file_name: fileName,
            content_type: contentType,
            status: "valid",
            validation_message: "Verified by RePath checks",
            validated_at: new Date().toISOString(),
          }
        : document
    ),
  };
  if (demoCase.documents.length === 3 && demoCase.documents.every((document) => document.status === "valid")) {
    demoCase.status = "ready_for_review";
  }
  persistCase();
}

export function removeDemoDocument(documentName: string) {
  demoCase = {
    ...demoCase,
    documents: demoCase.documents.filter((document) => document.document_name !== documentName),
    status: "recovering",
  };
  persistCase();
}

export function finalizeDemoCase(): FinalReviewResponse {
  demoCase = { ...demoCase, status: "ready_to_resubmit", updated_at: new Date().toISOString() };
  persistCase();
  return {
    case_id: DEMO_CASE_ID,
    status: "ready_to_resubmit",
    message: "Based on the documents currently provided, RePath did not detect any remaining issues from the original return notice. Review the information once more before submitting it to the appropriate agency.",
  };
}

export function getDemoMessages(): RecoveryMessage[] {
  return [
    { message_id: "demo-user-message", role: "user", content: DEMO_INPUT },
    {
      message_id: "demo-agent-message",
      role: "agent",
      content: `Your application appears to have been returned because three supporting details need attention. The main issue is consistency between your submitted business address and your supporting documents. Your proof of occupancy also appears incomplete, and the submitted business clearance needs to be replaced with a current copy.\n\n## What to do next\n\n1. Make the business address consistent across all documents.\n2. Upload the complete signed proof of occupancy.\n3. Replace the outdated business clearance.\n4. Run a final RePath readiness review.\n\nRePath can analyze the information provided and indicate readiness for resubmission. It does not approve or submit applications to an agency.`,
    },
  ];
}

export function getDemoAgentResponse(message: string): string {
  if (message.toLowerCase().includes("returned") || message.toLowerCase().includes("outdated")) {
    return getDemoMessages()[1].content;
  }
  if (message.toLowerCase().includes("address")) {
    return "Use one consistent format everywhere: Unit 4B, 128 Sampaguita St., Makati City. The two addresses appear to refer to the same location, but matching the formatting can help avoid another return notice.";
  }
  return "The next best step is to replace the incomplete lease agreement and outdated clearance, then run a final RePath readiness review. RePath only assesses the information and documents provided here.";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadCase(): RecoveryCase | null {
  try {
    const stored = localStorage.getItem("repath-demo-case");
    return stored ? (JSON.parse(stored) as RecoveryCase) : null;
  } catch {
    return null;
  }
}

function persistCase() {
  try {
    localStorage.setItem("repath-demo-case", JSON.stringify(demoCase));
  } catch {
    // Demo state still works for the current session if storage is unavailable.
  }
}
