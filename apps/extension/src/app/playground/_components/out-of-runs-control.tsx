import { ArrowRight } from "lucide-react";
import { useBetaAccessStore } from "@/stores/beta-access.store";

const RUNS_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSdzaqtcg5aB1knhZGUXMJ8NNXXJlFFUBTO6fjQJk1UquzPFCQ/viewform?usp=pp_url";

export function OutOfRunsControl() {
  const code = useBetaAccessStore((s) => s.code);
  const href = code
    ? `${RUNS_FORM}&entry.1221428113=${encodeURIComponent(code)}`
    : RUNS_FORM;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-[34px] w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#151504] px-4 text-[13px] font-bold text-[#FFFFFD] transition-colors hover:bg-[#151504]/90"
    >
      Get more runs
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}
