const API_URL = "http://127.0.0.1:8000";

export const USE_MOCK_AGENT = false;

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

  const response = await fetch(`${API_URL}/api/agent/message`, {
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
  const response = await fetch(
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

Mock mode is active, so this response did not call FastAPI or Gemini.

I can help you reason through the current recovery case, review next steps, or prepare wording for resubmission once the real agent connection is enabled.
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
