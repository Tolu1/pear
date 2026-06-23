import RunControls from "./_components/run-controls";
import EventFeed from "./_components/event-feed";

function Page() {
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-[-0.04em] text-[#0E140E]">
            Pear Studio
          </h1>
          <span className="rounded-full bg-[#151504] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#FFFFFD] uppercase">
            Playground mode
          </span>
        </div>
        <p className="text-[12px] leading-[16px] text-[#0E140E]/70">
          In playground mode you can run Pear's browser agent on any site. Pick
          a scenario or write your own custom goal, and watch the live signals
          stream in below as it reasons and acts in real time.
        </p>
      </header>
      <RunControls />
      <EventFeed />
    </div>
  );
}

export default Page;
