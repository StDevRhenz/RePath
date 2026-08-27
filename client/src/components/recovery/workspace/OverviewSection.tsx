import { useState } from "react";
import { Check, FileText, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  finalizeRecoveryCase,
  type RecoveryCase,
} from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import type { WorkspaceSection } from "@/components/recovery/workspace/WorkspaceNavigation";
import {
  getCaseStatusLabel,
  getRecoveryProgress,
} from "@/lib/statusLabels";

type OverviewSectionProps = {
  recoveryCase: RecoveryCase;
  onCaseUpdated: () => Promise<void>;
  onSectionChange: (section: WorkspaceSection) => void;
};

export function OverviewSection({
  recoveryCase,
  onCaseUpdated,
  onSectionChange,
}: OverviewSectionProps) {
  const progress = getRecoveryProgress(recoveryCase.status);
  const missingCount = recoveryCase.missing_documents.length;
  const documentsNeedingFix = recoveryCase.documents.filter(
    (document) => document.status === "needs_attention"
  ).length;
  const documentsNeedingCheck = recoveryCase.documents.filter(
    (document) =>
      document.status === "uploaded" ||
      document.status === "validating"
  ).length;
  const attentionCount =
    missingCount + documentsNeedingFix + documentsNeedingCheck;
  const [finalReviewLoading, setFinalReviewLoading] =
    useState(false);
  const [finalReviewError, setFinalReviewError] = useState("");

  async function handleFinalReview() {
    if (finalReviewLoading) {
      return;
    }

    setFinalReviewError("");
    setFinalReviewLoading(true);

    try {
      await finalizeRecoveryCase(recoveryCase.case_id);
      await onCaseUpdated();
    } catch (error) {
      setFinalReviewError(getRequestErrorMessage(error));
    } finally {
      setFinalReviewLoading(false);
    }
  }

  return (
    <div className="mt-12 max-w-4xl space-y-10">
      <section className="border-y border-zinc-200 py-5">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-normal uppercase tracking-[0.14em] text-zinc-400">
              Current situation
            </p>
            <p className="mt-2 text-sm font-normal text-zinc-900">
              {getCaseStatusLabel(recoveryCase.status)}
            </p>
            <p className="mt-1 text-sm font-light leading-6 text-zinc-500">
              {getSituationSummary(recoveryCase.status, attentionCount)}
            </p>
          </div>

          <Route
            className="size-5 shrink-0 text-zinc-400"
            strokeWidth={1.5}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          title="Progress snapshot"
          description={`${progress}% toward ready for resubmission.`}
        />

        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          title="What needs attention"
          description={getAttentionSummary(
            missingCount,
            documentsNeedingFix,
            documentsNeedingCheck
          )}
        />
      </section>

      <section>
        <SectionHeading
          title="What to do next"
          description={getNextActionDescription(
            recoveryCase.status,
            attentionCount
          )}
        />

        {missingCount > 0 || documentsNeedingFix > 0 ? (
          <Button
            onClick={() => onSectionChange("documents")}
            className="mt-5 h-10 px-4 font-normal"
          >
            Review documents
            <FileText className="size-4" />
          </Button>
        ) : recoveryCase.status === "ready_for_review" ? (
          <Button
            onClick={handleFinalReview}
            disabled={finalReviewLoading}
            className="mt-5 h-10 px-4 font-normal"
          >
            {finalReviewLoading ? (
              "Reviewing..."
            ) : (
              <>
                Check readiness
                <Check className="size-4" />
              </>
            )}
          </Button>
        ) : recoveryCase.status !== "ready_to_resubmit" ? (
          <Button
            onClick={() => onSectionChange("recovery")}
            className="mt-5 h-10 px-4 font-normal"
          >
            Review recovery path
            <Route className="size-4" />
          </Button>
        ) : null}

        {finalReviewError && (
          <p className="mt-4 text-sm font-light text-red-600">
            {finalReviewError}
          </p>
        )}
      </section>

      <section>
        <SectionHeading
          title="Recovery path summary"
          description={getRecoveryPathSummary(
            recoveryCase.recovery_steps.length
          )}
        />
      </section>
    </div>
  );
}

function getSituationSummary(status: string, attentionCount: number) {
  if (status === "ready_to_resubmit") {
    return "This recovery is ready for resubmission.";
  }

  if (status === "ready_for_review") {
    return "This recovery is ready for a final readiness check.";
  }

  if (attentionCount > 0) {
    return "Some items still need attention before resubmission.";
  }

  return "Review the recovery path to continue preparing this application.";
}

function getAttentionSummary(
  missingCount: number,
  documentsNeedingFix: number,
  documentsNeedingCheck: number
) {
  const items = [];

  if (missingCount > 0) {
    items.push(
      `${missingCount} missing ${
        missingCount === 1 ? "document" : "documents"
      }`
    );
  }

  if (documentsNeedingFix > 0) {
    items.push(
      `${documentsNeedingFix} ${
        documentsNeedingFix === 1 ? "document needs" : "documents need"
      } a fix`
    );
  }

  if (documentsNeedingCheck > 0) {
    items.push(
      `${documentsNeedingCheck} ${
        documentsNeedingCheck === 1 ? "document needs" : "documents need"
      } a check`
    );
  }

  if (items.length === 0) {
    return "No documents need attention right now.";
  }

  return `${items.join(", ")}.`;
}

function getNextActionDescription(status: string, attentionCount: number) {
  if (status === "ready_to_resubmit") {
    return "No further workspace action is needed right now.";
  }

  if (attentionCount > 0) {
    return "Start with the documents that need attention.";
  }

  if (status === "ready_for_review") {
    return "Check readiness before marking this recovery ready for resubmission.";
  }

  return "Review the prepared steps for this recovery.";
}

function getRecoveryPathSummary(stepCount: number) {
  if (stepCount === 0) {
    return "No recovery steps are available yet.";
  }

  return `${stepCount} ${
    stepCount === 1 ? "step is" : "steps are"
  } prepared. Open Recovery for the full path.`;
}

function getRequestErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Final review failed.";
}
