import { useEffect, useState } from "react";

import { RecoveryConversation } from "@/components/recovery/RecoveryConversation";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import {
  AgentApiError,
  getCaseMessages,
  type RecoveryMessage,
  USE_MOCK_AGENT,
} from "@/services/agentApi";
import type { RecoveryCase } from "@/services/caseApi";

type AgentSectionProps = {
  recoveryCase: RecoveryCase;
  onCaseUpdated: () => Promise<void>;
};

export function AgentSection({
  recoveryCase,
  onCaseUpdated,
}: AgentSectionProps) {
  const [messages, setMessages] = useState<RecoveryMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(
    !USE_MOCK_AGENT
  );
  const [messagesError, setMessagesError] = useState("");

  useEffect(() => {
    if (USE_MOCK_AGENT) {
      return;
    }

    let ignore = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setMessagesError("");

        const result = await getCaseMessages(
          recoveryCase.case_id
        );

        if (!ignore) {
          setMessages(result.messages);
        }
      } catch (error) {
        if (!ignore) {
          setMessagesError(getMessagesError(error));
        }
      } finally {
        if (!ignore) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [recoveryCase.case_id]);

  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Recovery Agent"
        description="Ask RePath about this recovery case."
      />

      <div className="mt-8">
        {loadingMessages ? (
          <p className="text-sm font-light text-zinc-500">
            Loading conversation...
          </p>
        ) : (
          <>
            {messagesError && (
              <p className="mb-6 text-sm font-light text-red-600">
                {messagesError}
              </p>
            )}

            <RecoveryConversation
              initialMessages={USE_MOCK_AGENT ? undefined : messages}
              initialSessionId={recoveryCase.agent_session_id ?? null}
              caseId={recoveryCase.case_id}
              placeholder="Ask about this recovery case..."
              helperText="Messages are linked to this recovery case when the real agent API is enabled."
              onSessionUpdated={onCaseUpdated}
            />
          </>
        )}
      </div>
    </div>
  );
}

function getMessagesError(error: unknown) {
  if (error instanceof AgentApiError && error.status === 404) {
    return "This recovery case could not be found.";
  }

  return "RePath couldn't load this conversation history.";
}
