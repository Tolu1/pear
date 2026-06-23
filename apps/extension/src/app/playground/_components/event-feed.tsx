import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  usePlaygroundStore,
  type FeedEntryType,
  type ScenarioRunStatus,
} from "@/stores/playground.store";

const labelByType: Record<FeedEntryType, string> = {
  goal: "goal",
  thought: "thinking",
  action: "action",
  usage: "usage",
  outcome: "outcome",
  error: "error",
};

const classByType: Record<FeedEntryType, string> = {
  goal: "text-[#0E140E]",
  thought: "text-[#0E140E]/55 italic",
  action: "text-[#1B5E20]",
  usage: "text-[#0E140E]/45",
  outcome: "text-[#7D4016] font-semibold",
  error: "text-[#B3261E] font-semibold",
};

const classByStatus: Record<ScenarioRunStatus, string> = {
  idle: "bg-[#0E140E]/10 text-[#0E140E]/60",
  running: "bg-[#FFF2B3] text-[#7D4016]",
  done: "bg-[#1B5E20]/15 text-[#1B5E20]",
  failed: "bg-[#B3261E]/12 text-[#B3261E]",
};

function EventFeed() {
  const feed = usePlaygroundStore((state) => state.feed);
  const status = usePlaygroundStore((state) => state.status);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feed]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[16px] border border-[#0E140E]/10 bg-white/60">
      <div className="flex items-center justify-between border-b border-[#0E140E]/10 px-4 py-2.5">
        <span className="text-[11px] font-bold tracking-wide text-[#0E140E]/50 uppercase">
          Live signals
        </span>
        <StatusBadge status={status} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {feed.length === 0 ? (
          <p className="pt-6 text-center text-[12px] text-[#0E140E]/40">
            Run a scenario to watch the agent's thoughts and actions stream in.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {feed.map((entry) => (
              <li key={entry.id} className="flex gap-2.5">
                <span className="mt-[1px] w-[52px] shrink-0 font-mono text-[9px] tracking-wide text-[#0E140E]/35 uppercase">
                  {labelByType[entry.type]}
                </span>
                <span
                  className={cn(
                    "min-w-0 font-mono text-[11px] leading-[16px] break-words",
                    classByType[entry.type],
                  )}
                >
                  {entry.text}
                </span>
              </li>
            ))}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ScenarioRunStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        classByStatus[status],
      )}
    >
      {status}
    </span>
  );
}

export default EventFeed;
