import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCase } from "@/services/caseApi";

export function ResumeCasePage() {
  const navigate = useNavigate();

  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResume() {
    const trimmedCaseId = caseId.trim();

    if (!trimmedCaseId) {
      setError("Enter your case ID to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const recoveryCase = await getCase(trimmedCaseId);

      navigate(`/cases/${recoveryCase.case_id}`, {
        state: { recoveryCase },
      });
    } catch {
      setError("We couldn't find a recovery case with that ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
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
      </nav>

      <section className="mx-auto flex min-h-[75vh] max-w-xl items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          <p className="text-sm font-normal text-zinc-500">
            Resume recovery
          </p>

          <h1 className="mt-4 text-4xl font-light tracking-[-0.035em] sm:text-5xl">
            Continue where you left off.
          </h1>

          <p className="mt-5 max-w-md font-light leading-7 text-zinc-500">
            Enter the case ID you received when your recovery was created.
          </p>

          <div className="mt-10">
            <label
              htmlFor="caseId"
              className="mb-2 block text-sm font-normal text-zinc-700"
            >
              Case ID
            </label>

            <Input
              id="caseId"
              value={caseId}
              onChange={(event) => setCaseId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleResume();
                }
              }}
              placeholder="Enter your case ID"
              className="h-12 bg-white font-light"
            />

            {error && (
              <p className="mt-3 text-sm font-light text-red-600">
                {error}
              </p>
            )}

            <Button
              onClick={handleResume}
              disabled={loading}
              className="mt-5 h-11 px-5 font-normal"
            >
              {loading ? "Finding case..." : "Continue"}

              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}