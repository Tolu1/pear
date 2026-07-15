import { Joystick } from "lucide-react";
import { RunControls } from "./_components/run-controls";
import EventFeed from "./_components/event-feed";
import ReportBugButton from "./_components/report-bug-button";
import { AccessWall } from "./_components/access-wall";

function Page() {
  return (
    <AccessWall>
      <div className="flex h-full flex-col gap-4 p-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold tracking-[-0.06em] text-[#0E140E]">
              Pear AI
            </h1>
            <div className="flex h-[19px] shrink-0 items-center gap-0.5 rounded-[14px] border border-[#0E140E] bg-[#FFED9B] px-1.5">
              <Joystick className="size-3 shrink-0 fill-[#FBBA22] text-[#BE910B]" />
              <span className="font-mono text-xs leading-[13px] font-bold tracking-[-0.08em] whitespace-nowrap text-[#0E140E]/70">
                Playground Mode
              </span>
            </div>
            <div className="ml-auto">
              <ReportBugButton />
            </div>
          </div>

          <p className="text-[12px] leading-[15px] tracking-[-0.04em] text-black/68">
            In playground mode you can run Pear's browser agent on any site. Pick
            a scenario or write your own custom goal, and watch the live signals
            stream in below as it reasons and acts in real time.
          </p>
        </header>
        <RunControls />
        <EventFeed />
      </div>
    </AccessWall>
  );
}

export default Page;
