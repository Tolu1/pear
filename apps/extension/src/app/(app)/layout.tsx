import { Outlet } from "@tanstack/react-router";
import Header from "@/components/header";
import { WalletWall } from "./_components/wallet-wall";

function Layout() {
  return (
    <div
      data-vaul-drawer-wrapper=""
      className="bg-background flex h-dvh flex-col gap-2.5"
    >
      <WalletWall>
        <Header />
        <div className="font-astra flex flex-1 flex-col">
          <Outlet />
        </div>
      </WalletWall>
    </div>
  );
}

export default Layout;
