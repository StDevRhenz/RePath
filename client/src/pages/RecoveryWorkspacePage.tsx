import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { OverviewSection } from "@/components/recovery/workspace/OverviewSection";
import { DocumentsSection } from "@/components/recovery/workspace/DocumentsSection";
import { RecoverySection } from "@/components/recovery/workspace/RecoverySection";
import { AgentSection } from "@/components/recovery/workspace/AgentSection";

import {
  WorkspaceNavigation,
  type WorkspaceSection,
} from "@/components/recovery/workspace/WorkspaceNavigation";

import {
  getCase,
  type RecoveryCase,
} from "@/services/caseApi";

export function RecoveryWorkspacePage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [recoveryCase, setRecoveryCase] =
    useState<RecoveryCase | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>("overview");

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

  async function refreshRecoveryCase() {
    if (!caseId) {
      return;
    }

    const updatedCase = await getCase(caseId);
    setRecoveryCase(updatedCase);
  }

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
          <p className="font-light text-zinc-600">
            {error}
          </p>

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

            <span className="hidden sm:inline">
              {formatStatus(recoveryCase.status)}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[210px_1fr]">
        {/* Desktop Navigation */}
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-zinc-200/80 px-5 py-8 lg:block">
          <WorkspaceNavigation
            activeSection={activeSection}
            onChange={setActiveSection}
          />
        </aside>

        {/* Main Workspace */}
        <div className="min-w-0">
          {/* Mobile Navigation */}
          <div className="border-b border-zinc-200/80 bg-[#fafafa] px-2 lg:hidden">
            <WorkspaceNavigation
              activeSection={activeSection}
              onChange={setActiveSection}
            />
          </div>

          <motion.section
            key={activeSection}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="px-6 py-10 lg:px-12 lg:py-12"
          >
            {/* Case Heading */}
            <div className="max-w-3xl">
              <p className="text-xs font-normal uppercase tracking-[0.14em] text-zinc-400">
                Recovery case
              </p>

              <h1 className="mt-3 text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                {recoveryCase.title}
              </h1>

              <p className="mt-3 break-all font-mono text-xs text-zinc-400">
                {recoveryCase.case_id}
              </p>
            </div>

            {activeSection === "overview" && (
              <OverviewSection
                recoveryCase={recoveryCase}
              />
            )}

            {activeSection === "documents" && (
              <DocumentsSection
                recoveryCase={recoveryCase}
                onCaseUpdated={refreshRecoveryCase}
              />
            )}

            {activeSection === "recovery" && (
              <RecoverySection
                recoveryCase={recoveryCase}
              />
            )}

            {activeSection === "agent" && (
              <AgentSection />
            )}
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}
