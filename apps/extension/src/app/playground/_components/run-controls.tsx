import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCENARIOS } from "@/core/playground/scenarios";
import { useRunScenario } from "@/hooks/use-run-scenario";
import { useBetaAccess } from "@/hooks/use-beta-access";
import { RunMeter } from "./run-meter";
import { OutOfRunsControl } from "./out-of-runs-control";

type Mode = "preset" | "custom";

export function RunControls() {
  const { mutate: run, isPending } = useRunScenario();

  const { data } = useBetaAccess();
  const outOfTries = (data?.remaining ?? 0) === 0;

  const [mode, setMode] = useState<Mode>("preset");
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [customGoal, setCustomGoal] = useState("");

  const selected = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const inputsDisabled = isPending || outOfTries;
  const canRun =
    !isPending &&
    !outOfTries &&
    (mode === "preset" || customGoal.trim().length > 0);

  const handleRun = () => {
    const payload =
      mode === "preset"
        ? { goal: selected.goal, targetUrl: selected.targetUrl }
        : { goal: customGoal };
    run(payload);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[16px] bg-white/72 p-4 shadow-[0_1px_1.5px_0_rgba(0,0,0,0.04)]">
      <RunMeter />

      <div className="flex gap-1 rounded-[10px] bg-[#0E140E]/5 p-1">
        <TabButton active={mode === "preset"} onClick={() => setMode("preset")}>
          Scenarios
        </TabButton>
        <TabButton active={mode === "custom"} onClick={() => setMode("custom")}>
          Custom Goal
        </TabButton>
      </div>

      <div className="h-[170px]">
        {mode === "preset" ? (
          <div className="flex h-full flex-col gap-2">
            <div className="relative">
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
                disabled={inputsDisabled}
                className="h-9 w-full appearance-none rounded-[8px] border-[1.5px] border-[#0E140E]/10 bg-[#0E140E]/5 pr-9 pl-3 text-[13px] font-semibold text-[#0E140E] transition-opacity duration-300 focus-visible:outline-none disabled:opacity-60"
              >
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-[#0E140E]/40" />
            </div>

            <p className="text-[11px] text-[#0E140E]/60">
              {selected.description}
            </p>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[8px] bg-[#D6D58B]/30">
              <div
                key={scenarioId}
                className="scrollbar-hide h-full overflow-y-auto p-2.5"
              >
                <p className="mb-1 text-[10px] font-bold tracking-wide text-[#0E140E]/50 uppercase">
                  Goal sent to agent
                </p>
                <p className="font-mono text-[11px] leading-[15px] tracking-[-0.04em] text-[#0E140E]">
                  {selected.goal}
                </p>
                <p className="mt-1.5 font-mono text-[10px] tracking-[-0.04em] text-[#0E140E]/45">
                  starts on {selected.targetUrl}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <textarea
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            disabled={inputsDisabled}
            placeholder='Describe what the agent should do, e.g. "Search Amazon for a yoga mat and add the top result to the cart."'
            className="font-astra h-full w-full resize-none rounded-[9px] border-[1.5px] border-[#0E140E]/10 bg-[#0E140E]/5 p-2.5 text-[14px] leading-[16px] tracking-[-0.04em] text-[#0E140E] transition-opacity duration-300 placeholder:text-[#0E140E]/35 focus-visible:outline-none disabled:opacity-60"
          />
        )}
      </div>

      {outOfTries ? (
        <OutOfRunsControl />
      ) : (
        <Button
          onClick={handleRun}
          disabled={!canRun}
          size="lg"
          className="w-full transition-[color,background-color,opacity] duration-300"
        >
          {isPending ? "Running…" : "Run Agent"}
        </Button>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 cursor-pointer rounded-[7px] py-1.5 text-[12px] font-semibold transition-colors",
        active
          ? "bg-[#FFF8D6] text-[#0E140E] shadow-sm"
          : "text-[#0E140E]/50 hover:text-[#0E140E]/70",
      )}
    >
      {children}
    </button>
  );
}
