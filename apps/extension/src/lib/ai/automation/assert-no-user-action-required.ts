import { ai } from "@/lib/ai";
import type { AutomationResult } from "@/lib/automation/interfaces/automation-result";

interface AssertNoUserActionRequiredBody {
  url: string;
  screenshot: string;
}

const STUB = true as boolean;

export async function assertNoUserActionRequired(
  body: AssertNoUserActionRequiredBody,
): Promise<void> {
  if (STUB) {
    void body;
    return;
  }

  const result = await fetcher(body);
  const firstAction = result.plan?.[0];
  if (firstAction && firstAction.type === "user_action_required") {
    throw new Error(
      firstAction.userMessage ||
        "Please complete the required fields before proceeding",
    );
  }
}

async function fetcher(body: AssertNoUserActionRequiredBody) {
  return ai.post<AutomationResult>(
    "/automation/assert-no-user-action-required",
    body,
  );
}
