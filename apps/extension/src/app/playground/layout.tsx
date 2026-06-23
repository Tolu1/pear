import { Outlet } from "@tanstack/react-router";
import { ReactQueryProvider } from "@/providers/react-query-provider";

function PlaygroundLayout() {
  return (
    <ReactQueryProvider>
      <div className="font-astra flex h-dvh w-full flex-col bg-[#FFFDF5]">
        <Outlet />
      </div>
    </ReactQueryProvider>
  );
}

export default PlaygroundLayout;
