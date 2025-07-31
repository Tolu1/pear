import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Index from "@/app/page";
import RootLayout from "@/app/layout";
import ConnectWallet from "@/app/connect-wallet/page";
import AppLayout from "@/app/(app)/layout";
import Home from "@/app/(app)/home/page";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof Router;
  }
}

const rootRoute = createRootRoute();

const rootLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "root-layout",
  component: () => <RootLayout />,
});

const IndexHtmlRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "/index.html",
  component: () => <Index />,
});

const RootIndexRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "/",
  component: () => <Index />,
});

const ConnectWalletRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "/connect-wallet",
  component: () => <ConnectWallet />,
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  id: "app-layout",
  component: () => <AppLayout />,
});

const HomeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/home",
  component: () => <Home />,
});

const routeTree = rootRoute.addChildren([
  rootLayoutRoute.addChildren([
    IndexHtmlRoute,
    RootIndexRoute,
    ConnectWalletRoute,
    appLayoutRoute.addChildren([HomeRoute]),
  ]),
]);

export const Router = createRouter({
  routeTree,
});
