import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

import {
  AgentApiError,
  type RecoveryMessage,
  sendAgentMessage,
} from "@/services/agentApi";

type RecoveryConversationProps = {
  initialMessages?: RecoveryMessage[];
  initialUserMessage?: string;
  initialAgentMessage?: string;
  initialSessionId?: string | null;
  caseId?: string | null;
  placeholder?: string;
  helperText?: string;
  onSessionUpdated?: () => Promise<void>;
};

export function RecoveryConversation({
  initialMessages,
  initialUserMessage,
  initialAgentMessage,
  initialSessionId,
  caseId,
  placeholder = "Reply to RePath...",
  helperText = "RePath may ask for additional information before building your recovery plan.",
  onSessionUpdated,
}: RecoveryConversationProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string | null>(
      initialSessionId ?? null
    );

  const [messages, setMessages] = useState<RecoveryMessage[]>(() => {
    if (initialMessages) {
      return initialMessages;
    }

    const conversationMessages: RecoveryMessage[] = [];

    if (initialUserMessage) {
      conversationMessages.push({
        message_id: crypto.randomUUID(),
        role: "user",
        content: initialUserMessage,
      });
    }

    if (initialAgentMessage) {
      conversationMessages.push({
        message_id: crypto.randomUUID(),
        role: "agent",
        content: initialAgentMessage,
      });
    }

    return conversationMessages;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage: RecoveryMessage = {
      message_id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const result = await sendAgentMessage(
        message,
        sessionId,
        caseId
      );

      setSessionId(result.session_id);

      if (!result.is_mock) {
        await onSessionUpdated?.();
      }

      const agentMessage: RecoveryMessage = {
        message_id: crypto.randomUUID(),
        role: "agent",
        content: result.response,
      };

      setMessages((current) => [...current, agentMessage]);
    } catch (error) {
    console.error(error);

    if (error instanceof AgentApiError && error.status === 429) {
        setError(
        "RePath is temporarily at its AI usage limit. Please try again shortly."
        );
    } else if (error instanceof AgentApiError) {
        setError(error.message);
    } else {
        setError(
        "RePath couldn't process your message. Please try again."
        );
    }
    } finally {
    setLoading(false);
    }
  }

    useEffect(() => {
    bottomRef.current?.scrollIntoView({
        behavior: "smooth",
    });
    }, [messages, loading]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Conversation */}
      <div className="space-y-10 pb-8">
        {messages.map((message) => (
          <div key={message.message_id}>
            <p className="mb-2 text-xs font-normal uppercase tracking-[0.12em] text-zinc-400">
              {message.role === "user" ? "You" : "RePath"}
            </p>

            <div
            className={
                message.role === "user"
                ? "max-w-2xl text-sm font-light leading-7 text-zinc-600"
                : "max-w-2xl text-sm font-light leading-7 text-zinc-900"
            }
            >
            {message.role === "agent" ? (
                <ReactMarkdown
                components={{
                    h1: ({ children }) => (
                    <h1 className="mb-3 mt-6 text-xl font-normal">
                        {children}
                    </h1>
                    ),

                    h2: ({ children }) => (
                    <h2 className="mb-3 mt-6 text-lg font-normal">
                        {children}
                    </h2>
                    ),

                    h3: ({ children }) => (
                    <h3 className="mb-2 mt-5 text-base font-normal">
                        {children}
                    </h3>
                    ),

                    p: ({ children }) => (
                    <p className="my-3 leading-7">
                        {children}
                    </p>
                    ),

                    ul: ({ children }) => (
                    <ul className="my-3 list-disc space-y-1 pl-5">
                        {children}
                    </ul>
                    ),

                    ol: ({ children }) => (
                    <ol className="my-3 list-decimal space-y-1 pl-5">
                        {children}
                    </ol>
                    ),

                    strong: ({ children }) => (
                    <strong className="font-medium text-zinc-950">
                        {children}
                    </strong>
                    ),

                    hr: () => (
                    <hr className="my-6 border-zinc-200" />
                    ),

                    code: ({ children }) => (
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em]">
                        {children}
                    </code>
                    ),
                }}
                >
                {message.content}
                </ReactMarkdown>
            ) : (
                message.content
            )}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div>
            <p className="mb-2 text-xs font-normal uppercase tracking-[0.12em] text-zinc-400">
              RePath
            </p>

            <p className="max-w-2xl text-sm font-light leading-7 text-zinc-600">
              Ask me about this recovery case, the remaining steps, or
              what ready to resubmit means.
            </p>
          </div>
        )}

        {loading && (
        <div>
            <p className="mb-3 text-xs font-normal uppercase tracking-[0.12em] text-zinc-400">
            RePath
            </p>

            <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
                <motion.span
                key={index}
                className="size-1.5 rounded-full bg-zinc-400"
                animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -3, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.15,
                }}
                />
            ))}
            </div>
        </div>
        )}

        {error && (
          <p className="text-sm font-light text-red-600">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
        <div
          className="sticky bottom-0 z-50 -mx-4 border-t border-zinc-200/80 bg-[#fafafa]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 sm:py-5"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}>
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
                }
            }}
            placeholder={placeholder}
            disabled={loading}
            className="min-h-24 resize-none bg-white pr-14 font-light leading-6"
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute bottom-3 right-3 size-9 rounded-md"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>

          <p className="mt-2 text-xs font-light text-zinc-400">
            {helperText}
          </p>
        </div>
      </div>
    </div>
  );
}
