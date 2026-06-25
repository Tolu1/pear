import { usePlaygroundStore, type FeedEntry } from "@/stores/playground.store";

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeieqNib9l4mBVF-9Pf6VZimQ1Q0hWiNLsAu54Yv92batsFeg/viewform";

const FIELD = {
  goal: "entry.1947223556",
  outcome: "entry.1361146527",
  log: "entry.1691846557",
} as const;

// Keep the prefilled URL well under browser length limits.
const MAX_LOG_CHARS = 1500;

function buildLog(feed: FeedEntry[]): string {
  const lines: string[] = [];
  let total = 0;
  for (let i = feed.length - 1; i >= 0; i--) {
    const line = `${feed[i].type.toUpperCase()}: ${feed[i].text}`;
    if (total + line.length + 1 > MAX_LOG_CHARS) break;
    lines.unshift(line);
    total += line.length + 1;
  }
  return lines.join("\n");
}

export function reportBug(): void {
  const { feed, status } = usePlaygroundStore.getState();

  const goal = feed.find((entry) => entry.type === "goal")?.text ?? "";
  const outcome = feed.find((entry) => entry.type === "outcome")?.text ?? status;
  const log = buildLog(feed);

  const params = new URLSearchParams({ usp: "pp_url" });
  if (goal) params.set(FIELD.goal, goal);
  params.set(FIELD.outcome, outcome);
  if (log) params.set(FIELD.log, log);

  window.open(`${FORM_URL}?${params}`, "_blank", "noopener,noreferrer");
}
