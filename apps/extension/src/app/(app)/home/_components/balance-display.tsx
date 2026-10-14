import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useSwitchWalletNetwork } from "@/hooks/use-switch-wallet-network";
import { paymentChains } from "@/lib/blockchain/config";
import { cn, formatTokenAmount } from "@/lib/utils";

function BalanceDisplay() {
  const { chain } = useAccount();
  const { data: balance, isPending } = useWalletBalance();
  const { mutate: switchNetwork, isPending: isSwitching } =
    useSwitchWalletNetwork();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-[16px] bg-[#FFF2B3] font-mono shadow-[0_1px_1.5px_0_rgba(0,0,0,0.04)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer flex-col items-center justify-center px-12 py-4"
      >
        <div className="flex items-center gap-1">
          <UsdcIcon />
          <h2 className="text-[24px] leading-[31px] font-semibold tracking-[-0.06em]">
            {balance?.symbol ?? "USDC"}
          </h2>
          <div className="flex size-[25px] items-center justify-center">
            {isSwitching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronIcon
                className={cn("transition-transform", open && "rotate-180")}
              />
            )}
          </div>
        </div>
        <p className="text-[10px] leading-[13px] font-medium tracking-[-0.06em] whitespace-nowrap opacity-[0.68]">
          {balance ? (
            <>
              <span className="font-bold">
                {formatTokenAmount(balance.amount)}
              </span>{" "}
              on {chain?.name} • Tap to change
            </>
          ) : isPending ? (
            "Checking balance…"
          ) : (
            "Tap to choose Arc or Base"
          )}
        </p>
      </button>

      {open && (
        <div className="flex flex-col border-t border-[#0E140E]/10 p-1.5">
          {paymentChains.map((paymentChain) => (
            <button
              key={paymentChain.id}
              onClick={() => {
                setOpen(false);
                switchNetwork(paymentChain.id);
              }}
              className="flex cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-[12px] font-bold hover:bg-[#0E140E]/5"
            >
              {paymentChain.name}
              {paymentChain.id === chain?.id && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UsdcIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="125 117.5 24 24"
      className="size-6"
      aria-hidden
    >
      <path
        d="M137 141.5C143.65 141.5 149 136.15 149 129.5C149 122.85 143.65 117.5 137 117.5C130.35 117.5 125 122.85 125 129.5C125 136.15 130.35 141.5 137 141.5Z"
        fill="#2775CA"
      />
      <path
        d="M140.3 131.4C140.3 129.65 139.25 129.05 137.15 128.8C135.65 128.6 135.35 128.2 135.35 127.5C135.35 126.8 135.85 126.35 136.85 126.35C137.75 126.35 138.25 126.65 138.5 127.4C138.55 127.55 138.7 127.65 138.85 127.65H139.65C139.85 127.65 140 127.5 140 127.3V127.25C139.8 126.15 138.9 125.3 137.75 125.2V124C137.75 123.8 137.6 123.65 137.35 123.6H136.6C136.4 123.6 136.25 123.75 136.2 124V125.15C134.7 125.35 133.75 126.35 133.75 127.6C133.75 129.25 134.75 129.9 136.85 130.15C138.25 130.4 138.7 130.7 138.7 131.5C138.7 132.3 138 132.85 137.05 132.85C135.75 132.85 135.3 132.3 135.15 131.55C135.1 131.35 134.95 131.25 134.8 131.25H133.95C133.75 131.25 133.6 131.4 133.6 131.6V131.65C133.8 132.9 134.6 133.8 136.25 134.05V135.25C136.25 135.45 136.4 135.6 136.65 135.65H137.4C137.6 135.65 137.75 135.5 137.8 135.25V134.05C139.3 133.8 140.3 132.75 140.3 131.4Z"
        fill="white"
      />
      <path
        d="M134.45 136.65C130.55 135.25 128.55 130.9 130 127.05C130.75 124.95 132.4 123.35 134.45 122.6C134.65 122.5 134.75 122.35 134.75 122.1V121.4C134.75 121.2 134.65 121.05 134.45 121C134.4 121 134.3 121 134.25 121.05C129.5 122.55 126.9 127.6 128.4 132.35C129.3 135.15 131.45 137.3 134.25 138.2C134.45 138.3 134.65 138.2 134.7 138C134.75 137.95 134.75 137.9 134.75 137.8V137.1C134.75 136.95 134.6 136.75 134.45 136.65ZM139.75 121.05C139.55 120.95 139.35 121.05 139.3 121.25C139.25 121.3 139.25 121.35 139.25 121.45V122.15C139.25 122.35 139.4 122.55 139.55 122.65C143.45 124.05 145.45 128.4 144 132.25C143.25 134.35 141.6 135.95 139.55 136.7C139.35 136.8 139.25 136.95 139.25 137.2V137.9C139.25 138.1 139.35 138.25 139.55 138.3C139.6 138.3 139.7 138.3 139.75 138.25C144.5 136.75 147.1 131.7 145.6 126.95C144.7 124.1 142.5 121.95 139.75 121.05Z"
        fill="white"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.79289 9.79289C8.18342 9.40237 8.81658 9.40237 9.20711 9.79289L12.5 13.0858L15.7929 9.79289C16.1834 9.40237 16.8166 9.40237 17.2071 9.79289C17.5976 10.1834 17.5976 10.8166 17.2071 11.2071L13.2071 15.2071C13.0196 15.3946 12.7652 15.5 12.5 15.5C12.2348 15.5 11.9804 15.3946 11.7929 15.2071L7.79289 11.2071C7.40237 10.8166 7.40237 10.1834 7.79289 9.79289Z"
        fill="#0E140E"
      />
    </svg>
  );
}

export default BalanceDisplay;
