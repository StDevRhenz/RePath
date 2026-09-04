import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthenticatedTopNav } from "@/components/navigation/AuthenticatedTopNav";

import { OverviewSection } from "@/components/recovery/workspace/OverviewSection";
import { DocumentsSection } from "@/components/recovery/workspace/DocumentsSection";
import { RecoverySection } from "@/components/recovery/workspace/RecoverySection";
import { WorkspaceAssistantPanel } from "@/components/recovery/workspace/WorkspaceAssistantPanel";

import {
  WorkspaceNavigation,
  type WorkspaceSection,
} from "@/components/recovery/workspace/WorkspaceNavigation";

import {
  getCase,
  type RecoveryCase,
} from "@/services/caseApi";
import {
  getCaseStatusLabel,
  getRecoveryProgress,
} from "@/lib/statusLabels";

export function RecoveryWorkspacePage() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [recoveryCase, setRecoveryCase] =
    useState<RecoveryCase | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState<WorkspaceSection>("overview");
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setError("We couldn't load this recovery.");
      setLoading(false);
      return;
    }

    getCase(caseId)
      .then(setRecoveryCase)
      .catch(() => {
        setError("We couldn't load this recovery. Return to My Recoveries and try again.");
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
            onClick={() => navigate("/recoveries")}
            className="mt-5 font-normal"
          >
            <ArrowLeft className="size-4" />
            Back to recoveries
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-950">
      {/* Header */}
      <AuthenticatedTopNav />

      <div
        className={`mx-auto grid w-full max-w-7xl overflow-x-clip lg:grid-cols-[210px_minmax(0,1fr)] ${
          assistantOpen
            ? "xl:max-w-[100rem] xl:grid-cols-[210px_minmax(0,1fr)_clamp(360px,28vw,420px)]"
            : "xl:grid-cols-[210px_minmax(0,1fr)_0px]"
        }`}
      >
        {/* Desktop Navigation */}
        <aside className="hidden min-h-[calc(100vh-4rem)] self-start border-r border-zinc-200/80 px-5 py-8 lg:sticky lg:top-16 lg:block">
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
              <Button
                variant="ghost"
                onClick={() => navigate("/recoveries")}
                aria-label="Back to Home"
                className="-ml-2 mb-6 h-10 px-2 font-normal text-zinc-500 hover:text-zinc-900"
              >
                <ArrowLeft className="size-4" />
                Back to Home
              </Button>

              <p className="text-xs font-normal uppercase tracking-[0.14em] text-zinc-400">
                Recovery case
              </p>

              <h1 className="mt-3 text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                {recoveryCase.title}
              </h1>

              <div className="mt-5 max-w-2xl border-y border-zinc-200 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-normal text-zinc-900">
                      {getCaseStatusLabel(recoveryCase.status)}
                    </p>
                    <p className="mt-1 text-sm font-light text-zinc-500">
                      {getRecoveryProgress(recoveryCase.status)}% toward ready for resubmission
                    </p>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 sm:w-40">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${getRecoveryProgress(recoveryCase.status)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {activeSection === "overview" && (
              <OverviewSection
                recoveryCase={recoveryCase}
                onCaseUpdated={refreshRecoveryCase}
                onSectionChange={setActiveSection}
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

          </motion.section>
        </div>

        <WorkspaceAssistantPanel
          recoveryCase={recoveryCase}
          onCaseUpdated={refreshRecoveryCase}
          open={assistantOpen}
          onOpenChange={setAssistantOpen}
        />
      </div>
    </main>
  );
}
