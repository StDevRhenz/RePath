import { Check, Circle } from "lucide-react";

import type { RecoveryCase } from "@/services/caseApi";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";

type RecoverySectionProps = {
  recoveryCase: RecoveryCase;
};

export function RecoverySection({
  recoveryCase,
}: RecoverySectionProps) {
  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Recovery"
        description="Follow the steps prepared for this application."
      />

      {recoveryCase.status === "ready_to_resubmit" && (
        <div className="mt-8 border-y border-zinc-200 py-5">
          <div className="flex items-center gap-3">
            <Check
              className="size-4 text-emerald-600"
              strokeWidth={1.5}
            />

            <p className="text-sm font-light text-zinc-600">
              Recovery is complete based on the current deterministic
              review rules and is ready for resubmission.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        {recoveryCase.recovery_steps.length > 0 ? (
          <div>
            {recoveryCase.recovery_steps.map((step, index) => {
              const isLast =
                index === recoveryCase.recovery_steps.length - 1;

              return (
                <div
                  key={`${step}-${index}`}
                  className="relative flex gap-4"
                >
                  {!isLast && (
                    <div className="absolute left-3 top-7 h-[calc(100%-0.25rem)] w-px bg-zinc-200" />
                  )}

                  <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-[#fafafa]">
                    <span className="text-[11px] font-light text-zinc-500">
                      {index + 1}
                    </span>
                  </div>

                  <div className={isLast ? "pb-0" : "pb-8"}>
                    <p className="text-sm font-normal text-zinc-900">
                      Step {index + 1}
                    </p>

                    <p className="mt-1 max-w-2xl text-sm font-light leading-6 text-zinc-600">
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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

