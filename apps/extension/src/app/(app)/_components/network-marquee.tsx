// Polygon and Solana lead so Arc starts near the centre of the row.
const NETWORKS = [
  "Polygon",
  "Solana",
  "Arc",
  "Base",
  "Ethereum",
  "Arbitrum",
  "Optimism",
  "Avalanche",
];

export function NetworkMarquee() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="font-mono text-[10px] font-bold tracking-[-0.04em] text-[#0E140E]/50">
        PAY WITH USDC ON
      </span>
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        {/* Two identical copies, each pill carrying its own margin, so shifting
            by exactly half the row loops without a visible jump. */}
        <div className="animate-marquee flex w-max">
          {[...NETWORKS, ...NETWORKS].map((network, i) => (
            <span
              key={i}
              className="mr-2 rounded-full border border-[#0E140E]/15 bg-[#FFF2B3] px-3 py-1 font-mono text-[11px] font-bold text-[#0E140E]/80"
            >
              {network}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
