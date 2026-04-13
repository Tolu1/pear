import { Outlet } from "@tanstack/react-router";
import Header from "@/components/header";

function Layout() {
  return (
    <div className="flex flex-col gap-2.5 h-dvh">
      <Header />
      <div className="flex font-astra flex-col flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
