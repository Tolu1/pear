import { Outlet, useNavigate } from "@tanstack/react-router";
import { WagmiProvider } from "@/providers/wagmi-provider";
import { useAccount } from "wagmi";
import { useEffect } from "react";

function ProtectedLayout() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
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
      <ProtectedLayout />
    </WagmiProvider>
  );
}

export default Layout;
