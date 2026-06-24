import { Bug } from "lucide-react";
import { useReportBug } from "@/hooks/use-report-bug";

function ReportBugButton() {
  const { reportBug } = useReportBug();

  return (
    <button
      type="button"
      onClick={reportBug}
      className="flex shrink-0 cursor-pointer items-center gap-1 rounded-[8px] px-2 py-1 text-[11px] font-semibold text-[#0E140E]/55 transition-colors hover:bg-[#0E140E]/5 hover:text-[#0E140E]/80"
    >
      <Bug className="size-3.5" />
      Report a bug
    </button>
  );
}

export default ReportBugButton;
