import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useViewportReady } from "@/hooks/use-viewport-ready";
import { useConnectWallet } from "@/hooks/use-connect-wallet";
import youreEarly from "@/assets/images/youre-early.png";
import { NetworkMarquee } from "./network-marquee";

const REVIEW_CREDIT_FORM = "https://forms.gle/4YmdCJ5kjQWbDb7Q9";

export function WalletWall({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { mutate: connect, isPending } = useConnectWallet();

  // Vaul reads window.innerWidth when the drawer opens to scale the background.
  // The side panel reports 0 on its first frame, which makes that scale -Infinity.
  const viewportReady = useViewportReady();

  const open = !isConnected && viewportReady;

  return (
    <>
      {isConnected ? children : null}

      <Drawer
        open={open}
        dismissible={false}
        shouldScaleBackground
        repositionInputs={false}
      >
        <DrawerContent
          className={cn(
            "h-[96.57%] rounded-t-[20px] [&_[data-slot=drawer-handle]]:hidden",
            "data-[vaul-drawer-direction=bottom]:mt-0",
            "data-[vaul-drawer-direction=bottom]:max-h-none",
            "data-[vaul-drawer-direction=bottom]:h-[96.57%]",
            "data-[vaul-drawer-direction=bottom]:border-t-0",
          )}
        >
          <DrawerTitle className="sr-only">Welcome to Pear</DrawerTitle>
          <DrawerDescription className="sr-only">
            Connect your wallet to continue.
          </DrawerDescription>

          <div className="flex h-full flex-col justify-between p-5 select-text">
            <header className="flex items-center justify-between">
              <span className="font-astra text-[16px] leading-[normal] font-bold tracking-[-0.08em] text-[#0E140E]/80">
                Pear
              </span>
              <span className="font-mono text-[12px] leading-[normal] font-bold tracking-[-0.08em] text-[#0E140E]/50">
                BETA
              </span>
            </header>

            <main className="flex flex-col items-center gap-4 text-center">
              <img
                src={youreEarly}
                alt="A pear standing beside a 'You're early' sign"
                draggable={false}
                className="size-[250px] max-w-full select-none"
              />
              <div className="flex flex-col items-center gap-1">
                <h1 className="font-astra text-[32px] leading-[normal] font-bold tracking-[-0.08em] text-[#0E140E]">
                  Welcome to Pear
                </h1>
                <p className="font-astra max-w-[280px] text-[11px] leading-[normal] text-[#0E140E]/80">
                  A crypto checkout for every nook and cranny of the internet.
                  No switching apps. No cashing out first. Just pay.
                </p>
              </div>
            </main>

            <div className="flex w-full flex-col gap-4">
              <div className="flex min-h-[52px] items-center justify-center">
                <NetworkMarquee />
              </div>
              <Button
                onClick={() => connect()}
                disabled={isPending}
                size="lg"
                className="w-full"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Connect with MetaMask"
                )}
              </Button>
              <a
                href={REVIEW_CREDIT_FORM}
                target="_blank"
                rel="noreferrer"
                className="font-astra cursor-pointer text-center text-[14px] leading-[normal] tracking-[-0.06em] text-[#0E140E]/68 underline"
              >
                Arc reviewer? Get $1
              </a>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
