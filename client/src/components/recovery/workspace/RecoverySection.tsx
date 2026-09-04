import { Check, Circle } from "lucide-react";

import type { RecoveryCase } from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import { getRecoveryProgress } from "@/lib/statusLabels";

type RecoverySectionProps = {
  recoveryCase: RecoveryCase;
};

export function RecoverySection({
  recoveryCase,
}: RecoverySectionProps) {
  const progress = getRecoveryProgress(recoveryCase.status);
  const currentStepIndex = getCurrentStepIndex(
    recoveryCase.recovery_steps.length,
    progress,
    recoveryCase.status
  );

  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Recovery"
        description={`${progress}% toward ready for resubmission.`}
      />

      {recoveryCase.status === "ready_to_resubmit" && (
        <div className="mt-8 border-y border-zinc-200 py-5">
          <div className="flex items-center gap-3">
            <Check
              className="size-4 text-emerald-600"
              strokeWidth={1.5}
            />

            <p className="text-sm font-light text-zinc-600">
              This recovery is ready for resubmission based on the documents
              currently in this case.
            </p>
          </div>
        </div>
      )}

      {recoveryCase.status !== "ready_to_resubmit" && (
        <div className="mt-8 border-y border-zinc-200 py-5">
          <div className="flex items-center gap-3">
            <Circle
              className="size-4 text-zinc-300"
              strokeWidth={1.5}
            />

            <div>
              <p className="text-sm font-normal text-zinc-700">
                Destination: Ready for resubmission
              </p>
              <p className="mt-1 text-sm font-light text-zinc-500">
                Keep working through the current recovery steps before
                resubmitting.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        {recoveryCase.recovery_steps.length > 0 ? (
          <ol>
            {recoveryCase.recovery_steps.map((step, index) => {
              const isLast =
                index === recoveryCase.recovery_steps.length - 1;

              return (
                <li
                  key={`${step}-${index}`}
                  className="relative flex gap-4"
                >
                  {!isLast && (
                    <div className="absolute left-3 top-7 h-[calc(100%-0.25rem)] w-px bg-zinc-200" />
                  )}

                  <div
                    className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-[#fafafa] ${getStepMarkerClassName(
                      index,
                      currentStepIndex,
                      recoveryCase.status
                    )}`}
                  >
                    {recoveryCase.status === "ready_to_resubmit" ||
                    index < currentStepIndex ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="text-[11px] font-light">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className={isLast ? "pb-0" : "pb-8"}>
                    <p
                      className={`text-sm font-normal ${getStepTitleClassName(
                        index,
                        currentStepIndex,
                        recoveryCase.status
                      )}`}
                    >
                      Step {index + 1}
                    </p>

                    <p
                      className={`mt-1 max-w-2xl text-sm font-light leading-6 ${getStepBodyClassName(
                        index,
                        currentStepIndex,
                        recoveryCase.status
                      )}`}
                    >
                      {step}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="border-y border-zinc-200 py-6">
            <div className="flex items-center gap-3">
              <Circle
                className="size-4 text-zinc-300"
                strokeWidth={1.5}
              />

              <p className="text-sm font-light text-zinc-500">
                Recovery steps have not been generated yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCurrentStepIndex(
  stepCount: number,
  progress: number,
  status: string
) {
  if (stepCount === 0 || status === "ready_to_resubmit") {
    return stepCount;
  }

  return Math.min(
    Math.floor((progress / 100) * stepCount),
    stepCount - 1
  );
}

function getStepMarkerClassName(
  index: number,
  currentStepIndex: number,
  status: string
) {
  if (status === "ready_to_resubmit" || index < currentStepIndex) {
    return "border-emerald-200 text-emerald-600";
  }

  if (index === currentStepIndex) {
    return "border-indigo-200 text-indigo-700";
  }

  return "border-zinc-200 text-zinc-400";
}

function getStepTitleClassName(
  index: number,
  currentStepIndex: number,
  status: string
) {
  if (status === "ready_to_resubmit" || index < currentStepIndex) {
    return "text-zinc-500";
  }

  if (index === currentStepIndex) {
    return "text-zinc-950";
  }

  return "text-zinc-400";
}

function getStepBodyClassName(
  index: number,
  currentStepIndex: number,
  status: string
) {
  if (status === "ready_to_resubmit" || index < currentStepIndex) {
    return "text-zinc-500";
  }

  if (index === currentStepIndex) {
    return "text-zinc-700";
  }

  return "text-zinc-400";
}
