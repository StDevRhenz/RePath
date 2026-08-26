import { motion } from "motion/react";
import {
  Check,
  Circle,
  FileText,
  Route,
} from "lucide-react";

import type { RecoveryCase } from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";

type OverviewSectionProps = {
  recoveryCase: RecoveryCase;
};

export function OverviewSection({
  recoveryCase,
}: OverviewSectionProps) {
  const progress = getRecoveryProgress(recoveryCase.status);

  return (
    <div className="mt-12 max-w-4xl space-y-12">
      {/* Progress */}
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
              delay: 0.1,
              ease: "easeOut",
            }}
            className="h-full rounded-full bg-indigo-500"
          />
        </div>
      </section>

      {/* Current Status */}
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
                RePath will keep this case available so you can
                continue where you left off.
              </p>
            </div>

            <Route
              className="size-5 shrink-0 text-zinc-400"
              strokeWidth={1.5}
            />
          </div>
        </div>
      </section>

      {/* Missing Requirements */}
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
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText
                    className="size-4 shrink-0 text-zinc-400"
                    strokeWidth={1.5}
                  />

                  <span className="truncate text-sm font-light">
                    {document}
                  </span>
                </div>

                <span className="shrink-0 text-xs text-zinc-400">
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

      {/* Recovery Path */}
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