import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCENARIOS } from "@/core/playground/scenarios";
import { useRunScenario } from "@/hooks/use-run-scenario";

type Mode = "preset" | "custom";

function RunControls() {
  const { mutate: run, isPending } = useRunScenario();

  const [mode, setMode] = useState<Mode>("preset");
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [customGoal, setCustomGoal] = useState("");

  const selected = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const canRun =
    !isPending && (mode === "preset" || customGoal.trim().length > 0);

  const handleRun = () => {
    const payload =
      mode === "preset"
        ? { goal: selected.goal, targetUrl: selected.targetUrl }
        : { goal: customGoal };
    run(payload);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#0E140E]/10 bg-white/60 p-4">
      <div className="flex gap-1 rounded-[10px] bg-[#0E140E]/5 p-1">
        <TabButton active={mode === "preset"} onClick={() => setMode("preset")}>
          Scenarios
        </TabButton>
        <TabButton active={mode === "custom"} onClick={() => setMode("custom")}>
          Custom goal
        </TabButton>
      </div>

      <div className="h-[170px]">
        {mode === "preset" ? (
          <div className="flex h-full flex-col gap-2">
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              disabled={isPending}
              className="h-9 rounded-[8px] border-[1.5px] border-[#0E140E]/30 bg-white px-3 text-[13px] font-semibold text-[#0E140E] focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-[#0E140E]/60">
              {selected.description}
            </p>

            <div
              key={scenarioId}
              className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-[8px] bg-[#0E140E]/5 p-2.5"
            >
              <p className="mb-1 text-[10px] font-bold tracking-wide text-[#0E140E]/50 uppercase">
                Goal sent to agent
              </p>
              <p className="font-mono text-[11px] leading-[15px] text-[#0E140E]/80">
                {selected.goal}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-[#0E140E]/45">
                starts on {selected.targetUrl}
              </p>
            </div>
          </div>
        ) : (
          <textarea
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            disabled={isPending}
            placeholder='Describe what the agent should do, e.g. "Search Amazon for a yoga mat and add the top result to the cart."'
            className="h-full w-full resize-none rounded-[8px] border-[1.5px] border-[#0E140E]/30 bg-white p-2.5 font-mono text-[12px] leading-[16px] text-[#0E140E] placeholder:text-[#0E140E]/35 focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
          />
        )}
      </div>

      <Button
        onClick={handleRun}
        disabled={!canRun}
        size="lg"
        className="w-full"
      >
        {isPending ? "Running…" : "Run agent"}
      </Button>
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
          ? "bg-white text-[#0E140E] shadow-sm"
          : "text-[#0E140E]/50 hover:text-[#0E140E]/70",
      )}
    >
      {children}
    </button>
  );
}

export default RunControls;
