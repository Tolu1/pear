import { cn } from "@/lib/utils";
import { useBetaAccess } from "@/hooks/use-beta-access";

export function RunMeter() {
  const { data } = useBetaAccess();
  if (!data?.valid) return null;

  const { remaining, limit } = data;
  const low = remaining <= 5;
  const fill = low ? "bg-[#B3261E]" : "bg-[#0E140E]/65";

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[10px] font-bold tracking-[-0.04em] whitespace-nowrap text-[#0E140E]/40 uppercase">
        Runs left
      </span>
      <div className="flex flex-1 gap-[2px]">
        {Array.from({ length: limit }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-[1px] transition-colors duration-300",
              i < remaining ? fill : "bg-[#0E140E]/10",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-[11px] font-bold tracking-[-0.08em]",
          low ? "text-[#B3261E]" : "text-[#0E140E]/45",
        )}
      >
        {remaining}/{limit}
      </span>
    </div>
  );
}
