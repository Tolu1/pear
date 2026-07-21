import { Outlet } from "@tanstack/react-router";
import { ReactQueryProvider } from "@/providers/react-query-provider";

function PlaygroundLayout() {
  return (
    <ReactQueryProvider>
      <div
        data-vaul-drawer-wrapper=""
        className="font-astra flex h-dvh w-full flex-col bg-background"
      >
        <Outlet />
      </div>
    </ReactQueryProvider>
  );
}

export default PlaygroundLayout;
