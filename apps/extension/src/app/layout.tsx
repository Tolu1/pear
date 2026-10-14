import { Outlet, useNavigate } from "@tanstack/react-router";
import { WagmiProvider } from "@/providers/wagmi-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { useEffect } from "react";

function ProtectedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: __PLAYGROUND_MODE__ ? "/playground" : "/home" });
  }, [navigate]);

  return (
    <div className="font-astra flex h-dvh w-full flex-col">
      <Outlet />
    </div>
  );
}

function Layout() {
  return (
    <WagmiProvider>
      <ReactQueryProvider>
        <ProtectedLayout />
      </ReactQueryProvider>
    </WagmiProvider>
  );
}

export default Layout;
