import { useEffect, useRef } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { keyframes } from "@emotion/react";
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
  goal: "font-semibold text-[#0E140E]",
  thought: "text-[#6E8B98]/80",
  action: "text-[#1B5E20]",
  usage: "text-[#0E140E]/40",
  outcome:
    "inline-block rounded-[6px] bg-[#D6D58B]/30 px-2 py-0.5 text-[#0E140E]",
  error: "font-semibold text-[#B3261E]",
};

const progressSweep = keyframes({
  "0%": { left: "-35%", right: "100%" },
  "100%": { left: "100%", right: "-90%" },
});

const classByStatus: Record<ScenarioRunStatus, string> = {
  idle: "border-[#0E140E]/22 bg-[#0E140E]/7 text-[#0E140E]/60",
  running: "border-[#7D4016]/45 bg-[#FFED9B] text-[#7D4016]",
  done: "border-[#1B5E20]/45 bg-[#1B5E20]/12 text-[#1B5E20]",
  failed: "border-[#B3261E]/45 bg-[#B3261E]/12 text-[#B3261E]",
};

function EventFeed() {
  const feed = usePlaygroundStore((state) => state.feed);
  const status = usePlaygroundStore((state) => state.status);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      stickyRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (status === "running") stickyRef.current = true;
    const el = scrollRef.current;
    if (!el || !stickyRef.current) return;
    let raf = 0;
    const step = () => {
      if (!stickyRef.current) return;
      const target = el.scrollHeight - el.clientHeight;
      const diff = target - el.scrollTop;
      if (diff < 1) {
        el.scrollTop = target;
        return;
      }
      el.scrollTop += Math.max(diff * 0.18, 0.5);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [feed, status]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] bg-white/72 shadow-[0_1px_1.5px_0_rgba(0,0,0,0.04)]">
      <div className="relative flex items-center justify-between border-b border-[#D6D58B] px-4 py-2.5">
        <span className="text-[11px] font-bold tracking-[-0.04em] text-[#0E140E]/50 uppercase">
          Live signals
        </span>
        <StatusBadge status={status} />
        {status === "running" && (
          <LinearProgress
            sx={{
              position: "absolute",
              insetInline: 0,
              bottom: "-1px",
              height: "1px",
              backgroundColor: "transparent",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "rgba(125, 64, 22, 0.4)",
              },
              "& .MuiLinearProgress-bar2Indeterminate": { display: "none" },
              "& .MuiLinearProgress-bar1Indeterminate": {
                animationName: `${progressSweep}`,
                animationDuration: "2.4s",
                animationTimingFunction: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                animationIterationCount: "infinite",
              },
            }}
          />
        )}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto scroll-auto p-4"
      >
        {feed.length === 0 ? (
          <p className="pt-6 text-center text-[12px] text-[#0E140E]/40">
            Run a scenario to watch the agent's thoughts and actions stream in.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {feed.map((entry) => (
              <li
                key={entry.id}
                className="animate-in fade-in flex gap-2.5 duration-500 motion-reduce:animate-none"
              >
                <span className="mt-[1px] w-[52px] shrink-0 font-mono text-[9px] tracking-wide text-[#0E140E]/60 uppercase">
                  {labelByType[entry.type]}
                </span>
                <span
                  className={cn(
                    "min-w-0 font-mono text-[11px] leading-[16px] tracking-[-0.04em] break-words",
                    classByType[entry.type],
                  )}
                >
                  {entry.text}
                </span>
              </li>
            ))}
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
        "inline-flex h-[19px] items-center gap-1 rounded-[14px] border px-2 font-mono text-[10px] font-bold tracking-[-0.04em] uppercase",
        classByStatus[status],
      )}
    >
      <StatusIndicator status={status} />
      {status}
    </span>
  );
}

function StatusIndicator({ status }: { status: ScenarioRunStatus }) {
  if (status !== "running") return null;
  return <span className="size-1.5 animate-pulse rounded-full bg-current" />;
}

export default EventFeed;
