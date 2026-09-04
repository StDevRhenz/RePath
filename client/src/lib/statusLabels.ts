export const caseStatusLabels: Record<string, string> = {
  recovering: "Recovery in progress",
  waiting_for_documents: "Documents needed",
  ready_for_review: "Ready for review",
  ready_to_resubmit: "Ready for resubmission",
};

export function getCaseStatusLabel(status: string) {
  return caseStatusLabels[status] ?? "Recovery in progress";
}

export function getRecoveryProgress(status: string) {
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
