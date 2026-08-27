import { API_URL } from "@/lib/apiConfig";
import { authFetch } from "@/lib/authFetch";

export const USE_MOCK_AGENT = true;

export interface RecoveryMessage {
  message_id?: string;
  role: "user" | "agent";
  content: string;
  created_at?: string;
  session_id?: string;
}

export interface AgentMessageResponse {
  session_id: string;
  response: string;
  is_mock?: boolean;
}

export interface CaseMessagesResponse {
  case_id: string;
  messages: RecoveryMessage[];
}

export class AgentApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AgentApiError";
    this.status = status;
  }
}

export async function sendAgentMessage(
  message: string,
  sessionId?: string | null,
  caseId?: string | null
): Promise<AgentMessageResponse> {
  if (USE_MOCK_AGENT) {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return mockAgentResponse(message);
  }

  const response = await authFetch(`${API_URL}/api/agent/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      session_id: sessionId ?? null,
      case_id: caseId ?? null,
    }),
  });

  if (!response.ok) {
    throw new AgentApiError(
      await getErrorMessage(response, "Failed to send message to RePath."),
      response.status
    );
  }

  return response.json();
}

export async function getCaseMessages(
  caseId: string
): Promise<CaseMessagesResponse> {
  const response = await authFetch(
    `${API_URL}/api/cases/${caseId}/messages`
  );

  if (!response.ok) {
    throw new AgentApiError(
      await getErrorMessage(response, "Failed to load case messages."),
      response.status
    );
  }

  return response.json();
}

function mockAgentResponse(
  _message: string
): AgentMessageResponse {
  return {
    session_id: "mock-session-local-only",
    is_mock: true,
    response: `
### Recovery Analysis

I can help you review this recovery, understand the next steps, or prepare wording for resubmission.
    `.trim(),
  };
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
