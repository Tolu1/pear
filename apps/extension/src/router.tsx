import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Index from "@/app/page";
import ConnectWallet from "@/app/connect-wallet/page";
import Home from "@/app/home/page";
import RootLayout from "@/app/layout";

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

const HomeRoute = createRoute({
  getParentRoute: () => rootLayoutRoute,
  path: "/home",
  component: () => <Home />,
});

const routeTree = rootRoute.addChildren([
  rootLayoutRoute.addChildren([
    IndexHtmlRoute,
    RootIndexRoute,
    ConnectWalletRoute,
    HomeRoute,
  ]),
]);

export const Router = createRouter({
  routeTree,
});
