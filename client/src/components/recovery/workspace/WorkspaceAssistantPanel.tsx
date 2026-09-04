import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecoveryConversation } from "@/components/recovery/RecoveryConversation";
import {
  AgentApiError,
  getCaseMessages,
  type RecoveryMessage,
  USE_MOCK_AGENT,
} from "@/services/agentApi";
import type { RecoveryCase } from "@/services/caseApi";

type WorkspaceAssistantPanelProps = {
  recoveryCase: RecoveryCase;
  onCaseUpdated: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WorkspaceAssistantPanel({
  recoveryCase,
  onCaseUpdated,
  open,
  onOpenChange,
}: WorkspaceAssistantPanelProps) {
  const [messages, setMessages] = useState<RecoveryMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(
    !USE_MOCK_AGENT
  );
  const [messagesError, setMessagesError] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
        launcherRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  function handleClose() {
    onOpenChange(false);
    launcherRef.current?.focus();
  }

  return (
    <>
      <Button
        ref={launcherRef}
        onClick={() => onOpenChange(true)}
        aria-label="Ask RePath"
        className={`fixed bottom-4 right-4 z-40 h-10 px-4 font-normal shadow-sm sm:bottom-6 sm:right-6 ${
          open ? "hidden" : ""
        }`}
      >
        <MessageSquare className="size-4" />
        Ask RePath
      </Button>

      <aside
        role="dialog"
        aria-modal={open}
        aria-labelledby="workspace-assistant-title"
        aria-hidden={!open}
        inert={open ? undefined : true}
        className={`fixed bottom-0 right-0 top-16 z-40 flex w-full flex-col border-l border-zinc-200 bg-[#fafafa] transition-transform sm:w-[28rem] xl:sticky xl:bottom-auto xl:right-auto xl:z-auto xl:h-[calc(100vh-4rem)] xl:w-auto ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="workspace-assistant-title"
              className="text-sm font-normal text-zinc-900"
            >
              Ask RePath
            </h2>
            <p className="mt-1 truncate text-sm font-light text-zinc-500">
              About: {recoveryCase.title}
            </p>
          </div>

          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close Ask RePath"
            className="size-9 rounded-md"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
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
                helperText="Messages in this conversation stay connected to this recovery."
                onSessionUpdated={onCaseUpdated}
              />
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function getMessagesError(error: unknown) {
  if (error instanceof AgentApiError && error.status === 404) {
    return "This recovery case could not be found.";
  }

  return "RePath couldn't load this conversation history.";
}
