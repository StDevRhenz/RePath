import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Circle,
  FileText,
  Route,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCase, type RecoveryCase } from "@/services/caseApi";

export function RecoveryWorkspacePage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [recoveryCase, setRecoveryCase] =
    useState<RecoveryCase | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    if (!caseId) {
      setError("Invalid case ID.");
      setLoading(false);
      return;
    }

    getCase(caseId)
      .then(setRecoveryCase)
      .catch(() => {
        setError("We couldn't load this recovery case.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-sm font-light text-zinc-500">
          Loading recovery...
        </p>
      </main>
    );
  }

  if (error || !recoveryCase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <p className="font-light text-zinc-600">{error}</p>

          <Button
            variant="outline"
            onClick={() => navigate("/resume")}
            className="mt-5 font-normal"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      </main>
    );
  }

  const progress = getRecoveryProgress(recoveryCase.status);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-normal tracking-tight"
          >
            RePath
          </button>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            {formatStatus(recoveryCase.status)}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[210px_1fr]">
        {/* Sidebar */}
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-zinc-200/80 px-5 py-8 lg:block">
          <nav className="space-y-1">
            <SidebarItem label="Overview" active />
            <SidebarItem label="Documents" />
            <SidebarItem label="Recovery" />
            <SidebarItem label="Agent" />
          </nav>
        </aside>

        {/* Workspace */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="px-6 py-10 lg:px-12 lg:py-12"
        >
          {/* Case heading */}
          <div className="max-w-3xl">
            <p className="text-xs font-normal uppercase tracking-[0.14em] text-zinc-400">
              Recovery case
            </p>

            <h1 className="mt-3 text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              {recoveryCase.title}
            </h1>

            <p className="mt-3 font-mono text-xs text-zinc-400">
              {recoveryCase.case_id}
            </p>
          </div>

          <div className="mt-12 max-w-4xl space-y-12">
            {/* Recovery progress */}
            <section>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-sm font-normal text-zinc-900">
                    Recovery progress
                  </p>

                  <p className="mt-1 text-sm font-light text-zinc-500">
                    Your progress toward a complete resubmission.
                  </p>
                </div>

                <span className="text-sm font-light text-zinc-500">
                {progress}%
                </span>
              </div>

              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-indigo-500"
                />
              </div>
            </section>

            {/* Current status */}
            <section>
              <SectionHeading
                title="Current status"
                description="Where your recovery currently stands."
              />

              <div className="mt-5 border-y border-zinc-200 py-5">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-normal">
                      {formatStatus(recoveryCase.status)}
                    </p>

                    <p className="mt-1 text-sm font-light text-zinc-500">
                      RePath will keep this case available so you can continue
                      where you left off.
                    </p>
                  </div>

                  <Route
                    className="size-5 shrink-0 text-zinc-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </section>

            {/* Missing requirements */}
            <section>
              <SectionHeading
                title="Missing requirements"
                description="Items that still need your attention."
              />

              <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
                {recoveryCase.missing_documents.length > 0 ? (
                  recoveryCase.missing_documents.map((document) => (
                    <div
                      key={document}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText
                          className="size-4 text-zinc-400"
                          strokeWidth={1.5}
                        />

                        <span className="text-sm font-light">
                          {document}
                        </span>
                      </div>

                      <span className="text-xs text-zinc-400">
                        Missing
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 py-5">
                    <Check
                      className="size-4 text-zinc-400"
                      strokeWidth={1.5}
                    />

                    <p className="text-sm font-light text-zinc-500">
                      No missing requirements recorded.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Recovery path */}
            <section>
              <SectionHeading
                title="Recovery path"
                description="The steps RePath has prepared for this case."
              />

              <div className="mt-6 space-y-5">
                {recoveryCase.recovery_steps.length > 0 ? (
                  recoveryCase.recovery_steps.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-start gap-4"
                    >
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white">
                        <span className="text-[11px] text-zinc-500">
                          {index + 1}
                        </span>
                      </div>

                      <p className="pt-0.5 text-sm font-light leading-6 text-zinc-700">
                        {step}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3">
                    <Circle
                      className="size-4 text-zinc-300"
                      strokeWidth={1.5}
                    />

                    <p className="text-sm font-light text-zinc-500">
                      Recovery steps have not been generated yet.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function SidebarItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "bg-indigo-50 font-normal text-indigo-700"
          : "font-light text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-normal text-zinc-900">
        {title}
      </h2>

      <p className="mt-1 text-sm font-light text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRecoveryProgress(status: string) {
  switch (status) {
    case "recovering":
      return 25;

    case "waiting_for_documents":
      return 50;

    case "ready_for_review":
      return 75;

    case "ready_to_resubmit":
      return 100;

    default:
      return 0;
  }
}