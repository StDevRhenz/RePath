import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";

export function AgentSection() {
  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Recovery Agent"
        description="Ask RePath about this recovery case."
      />

      <div className="mt-8 border-y border-zinc-200 py-8">
        <div className="max-w-2xl">
          <p className="text-xs font-normal uppercase tracking-[0.12em] text-zinc-400">
            RePath
          </p>

          <p className="mt-3 text-sm font-light leading-7 text-zinc-600">
            I can help you understand your missing requirements,
            recovery steps, and what to do next for this case.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <Textarea
            placeholder="Ask about this recovery case..."
            className="min-h-28 resize-none bg-white pr-14 font-light leading-6"
          />

          <Button
            size="icon"
            disabled
            className="absolute bottom-3 right-3 size-9 rounded-md"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>

        <p className="mt-2 text-xs font-light text-zinc-400">
          Agent messaging will be connected to this recovery case.
        </p>
      </div>
    </div>
  );
}

