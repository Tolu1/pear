import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useBetaAccessStore } from "@/stores/beta-access.store";
import { useRevalidateStoredCode } from "@/hooks/use-revalidate-stored-code";
import { useSubmitAccessCode } from "@/hooks/use-submit-access-code";
import { useViewportReady } from "@/hooks/use-viewport-ready";
import youreEarly from "@/assets/images/youre-early.png";

const INVITE_FORM = "https://forms.gle/iLRrvmjbQgDLj8Fi9";

export function AccessWall({ children }: { children: React.ReactNode }) {
  const code = useBetaAccessStore((s) => s.code);
  const { mutate: submit, isPending, isError, data } = useSubmitAccessCode();

  const [value, setValue] = useState("");

  useRevalidateStoredCode();

  // Vaul reads window.innerWidth when the drawer opens to scale the background.
  // The side panel reports 0 on its first frame, which makes that scale -Infinity.
  const viewportReady = useViewportReady();

  const open = !code && viewportReady;

  const errorMessage = isError
    ? "Can't connect right now. Try again."
    : data && !data.valid
      ? "That code isn't valid"
      : null;

  const canSubmit = value.trim().length > 0 && !isPending;

  const handleEnter = () => {
    if (!canSubmit) return;
    submit(value);
  };

  return (
    <>
      {code ? children : null}

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
          <DrawerTitle className="sr-only">Welcome to Pear AI</DrawerTitle>
          <DrawerDescription className="sr-only">
            Enter your beta access code to continue.
          </DrawerDescription>

          <div className="flex h-full flex-col justify-between p-5 select-text">
            <header className="flex items-center justify-between">
              <span className="font-astra text-[16px] leading-[normal] font-bold tracking-[-0.08em] text-[#0E140E]/80">
                Pear AI
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
                  Welcome to Pear AI
                </h1>
                <p className="font-astra max-w-[280px] text-[11px] leading-[normal] text-[#0E140E]/80">
                  You've been invited to test Pear's autonomous browser agent.
                  Enter the code from your email invite below.
                </p>
              </div>
            </main>

            <div className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="relative">
                  <input
                    value={value}
                    autoFocus
                    onChange={(e) => setValue(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                    placeholder="PEAR-XXXX"
                    className="w-full rounded-[8px] border border-[#0E140E]/25 bg-[#FFF2B3] px-4 py-2 text-center font-mono text-[12px] leading-[normal] font-bold text-[#0E140E] transition-colors duration-200 placeholder:text-[#0E140E]/50 focus-visible:border-[#0E140E]/40 focus-visible:outline-none"
                  />
                  {errorMessage && (
                    <div className="animate-in fade-in-0 absolute bottom-full left-0 flex w-full items-center justify-center gap-0.75 pb-2 text-[11px] font-semibold text-[#B3261E] duration-400">
                      <AlertCircle className="mt-[-0.5px] size-3.25" />
                      {errorMessage}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleEnter}
                  disabled={!canSubmit}
                  size="lg"
                  className="w-full"
                >
                  {isPending ? <Loader2 className="animate-spin" /> : "Enter"}
                </Button>
              </div>

              <a
                href={INVITE_FORM}
                target="_blank"
                rel="noreferrer"
                className="font-astra cursor-pointer text-center text-[14px] leading-[normal] tracking-[-0.06em] text-[#0E140E]/68 underline"
              >
                Request an invite code
              </a>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
