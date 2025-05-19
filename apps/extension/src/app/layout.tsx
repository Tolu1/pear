import { Outlet, useNavigate } from "@tanstack/react-router";
import { Web3Provider } from "@/providers/web3";
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
    <div className="flex flex-col h-full w-full">
      <Outlet />
    </div>
  );
}

function Layout() {
  return (
    <Web3Provider>
      <ProtectedLayout />
    </Web3Provider>
  );
}

export default Layout;
