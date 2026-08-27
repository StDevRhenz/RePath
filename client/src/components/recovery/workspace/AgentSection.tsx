import { RecoveryConversation } from "@/components/recovery/RecoveryConversation";
import { SectionHeading } from "@/components/recovery/workspace/SectionHeading";
import type { RecoveryCase } from "@/services/caseApi";

type AgentSectionProps = {
  recoveryCase: RecoveryCase;
  onCaseUpdated: () => Promise<void>;
};

export function AgentSection({
  recoveryCase,
  onCaseUpdated,
}: AgentSectionProps) {
  return (
    <div className="mt-12 max-w-4xl">
      <SectionHeading
        title="Recovery Agent"
        description="Ask RePath about this recovery case."
      />

      <div className="mt-8">
        <RecoveryConversation
          initialSessionId={recoveryCase.agent_session_id ?? null}
          caseId={recoveryCase.case_id}
          placeholder="Ask about this recovery case..."
          helperText="Messages are linked to this recovery case when the real agent API is enabled."
          onSessionUpdated={onCaseUpdated}
        />
      </div>
    </div>
  );
}
