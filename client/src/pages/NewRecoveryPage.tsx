import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthenticatedTopNav } from "@/components/navigation/AuthenticatedTopNav";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  AgentApiError,
  sendAgentMessage,
} from "@/services/agentApi";
import { RecoveryConversation } from "@/components/recovery/RecoveryConversation";

export function NewRecoveryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState("");
  const [initialMessage, setInitialMessage] = useState("");


  async function handleContinue() {
    if (loading) {
      return;
    }

    const trimmedDescription = description.trim();

    if (!trimmedDescription) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await sendAgentMessage(trimmedDescription);

      setInitialMessage(trimmedDescription);
      setSessionId(result.session_id);
      setAgentResponse(result.response);

      console.log("SESSION:", result.session_id);
      console.log("AGENT:", result.response);
      } catch (error) {
        console.error(error);

        if (error instanceof AgentApiError && error.status === 429) {
          setError(
            "RePath is temporarily at its AI usage limit. Please try again shortly."
          );
        } else {
          setError(
            "RePath couldn't process your request. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
  }


  if (sessionId && agentResponse) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-zinc-950">
        {user ? (
          <AuthenticatedTopNav />
        ) : (
          <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafafa]/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
              <button
                onClick={() => navigate("/")}
                className="text-xl font-normal tracking-tight"
              >
                RePath
              </button>

              <span className="text-sm font-light text-zinc-500">
                Recovery Agent
              </span>
            </div>
          </header>
        )}

        <section className="px-6 py-12">
          <RecoveryConversation
            initialUserMessage={initialMessage}
            initialAgentMessage={agentResponse}
            initialSessionId={sessionId}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      {/* Navigation */}
      {user ? (
        <AuthenticatedTopNav />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafafa]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
            <button
              onClick={() => navigate("/")}
              className="text-xl font-normal tracking-tight"
            >
              RePath
            </button>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="font-normal"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        </nav>
      )}

      {/* Content */}
      <section className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/recoveries")}
            aria-label="Back to Home"
            className="-ml-2 mb-6 h-10 px-2 font-normal text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Button>

          <p className="text-sm font-normal text-zinc-500">
            New recovery
          </p>

          <h1 className="mt-4 text-4xl font-light tracking-[-0.035em] sm:text-5xl">
            What happened?
          </h1>

          <p className="mt-5 max-w-lg font-light leading-7 text-zinc-500">
            Paste the notice you received, or briefly describe what stopped
            your application.
          </p>

          <div className="mt-10">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-normal text-zinc-700"
            >
              Application issue
            </label>

            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="My scholarship application was rejected because..."
              className="min-h-40 resize-none bg-white font-light leading-6"
            />

            {error && (
              <p className="mt-4 text-sm font-light text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!description.trim() || loading}
                className="h-11 px-5 font-normal"
              >
                {loading ? "Analyzing..." : "Continue"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
