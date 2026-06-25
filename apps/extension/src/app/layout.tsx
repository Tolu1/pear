import { Outlet, useNavigate } from "@tanstack/react-router";
import { WagmiProvider } from "@/providers/wagmi-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { useAccount } from "wagmi";
import { useEffect } from "react";

function ProtectedLayout() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (__PLAYGROUND_MODE__) {
      navigate({ to: "/playground" });
    } else if (isConnected) {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/connect-wallet" });
    }
  }, [isConnected, navigate]);

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
