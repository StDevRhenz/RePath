const API_URL = "http://127.0.0.1:8000";

const USE_MOCK_AGENT = true;

export interface AgentMessageResponse {
  session_id: string;
  response: string;
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
  sessionId?: string
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
    }),
  });

  if (!response.ok) {
    throw new AgentApiError(
      "Failed to send message to RePath.",
      response.status
    );
  }

  return response.json();
}

function mockAgentResponse(
  _message: string
): AgentMessageResponse {
  return {
    session_id: "mock-session-001",
    response: `
### Recovery Analysis

Your application appears to be incomplete.

### Missing Documents

1. **Recommendation Letter**
2. **Enrollment Certificate**

### Recovery Plan

1. Obtain a signed recommendation letter.
2. Request an enrollment certificate from your registrar.
3. Revalidate the complete application package.

Your recovery case is currently **waiting for documents**.
    `.trim(),
  };
}