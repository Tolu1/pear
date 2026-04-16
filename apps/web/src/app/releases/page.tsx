import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Wave from "@/components/wave";
import ReleaseDownloadButton from "@/components/release-download-button";

export const metadata: Metadata = {
  title: "Pear | Releases",
  description:
    "Download Pear. Stable on the Chrome Web Store and a public beta channel for early access to new features.",
};

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/pear/jihaoncggojanjkopoebkihgmebhjdcj";

const BETA_VERSION = "0.1.0-beta";
const BETA_ZIP_PATH = `/downloads/pear-extension-v${BETA_VERSION}.zip`;
const STABLE_VERSION = "0.0.2-alpha";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-between rounded-t-[24px] border-x-1 border-t-1 border-black bg-white bg-linear-to-b from-[#BE910B]/20 to-[#FFF8D4]/20 pt-6">
      <article className="flex w-full flex-col md:max-w-7xl">
        <header className="flex flex-col items-center gap-4 pt-[64px] pb-[56px] text-center md:pt-[80px] md:pb-[72px]">
          <h1
            className="font-melody text-[40px] leading-[40px] tracking-[-0.02em] text-[#0E140E] md:text-[64px] md:leading-[64px]"
            style={{ WebkitTextStroke: "0.5px #0E140E" }}
          >
            RELEASES
          </h1>
          <p className="max-w-[440px] px-6 text-[18px] leading-[24px] tracking-[-0.04em] text-black/60 md:px-0 md:text-[20px] md:leading-[28px]">
            Two ways to install Pear. Choose a release channel.
          </p>
          <div className="flex w-6 justify-between pt-2">
            <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
            <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
            <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
          </div>
        </header>

        <div className="flex w-full flex-col gap-16 px-6 md:gap-20">
          <div className="flex flex-col gap-4 md:gap-5">
            <article className="flex flex-1 flex-col gap-4 rounded-[20px] border border-black/20 bg-[#FFFBE8] p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge className="h-7 gap-1.5 rounded-full border border-black bg-[#D6D58B] px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2F4439]" />
                  <span className="font-mono text-[10px] leading-[12px] font-semibold tracking-[-0.04em] text-[#0E140E] uppercase">
                    Alpha
                  </span>
                </Badge>
                <span className="font-mono text-[11px] leading-[12px] tracking-[-0.04em] text-black/50">
                  v{STABLE_VERSION}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3
                  className="text-[20px] leading-[24px] tracking-[-0.04em] text-[#0E140E]"
                  style={{ WebkitTextStroke: "0.5px #0E140E" }}
                >
                  Pear on the Chrome Web Store
                </h3>
                <p className="text-[15px] leading-[20px] tracking-[-0.04em] text-black/55">
                  Our first public build, live on the Chrome Web Store.
                  One-click install for an early look at Pear.
                </p>
              </div>
              <div className="mt-auto flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[8px] border border-black bg-[#FFE566] px-5 font-bold tracking-[-0.08em] text-black shadow-[3px_3px_0_0_#0E140E] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFE566]/90 hover:shadow-[2px_2px_0_0_#0E140E] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0_0_0_#0E140E] md:w-fit"
                >
                  Open store
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9L9 3M9 3H4M9 3V8"
                      stroke="#0E140E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <span className="font-mono text-[11px] leading-[12px] tracking-[-0.04em] text-black/40">
                  Chrome · Edge · Brave
                </span>
              </div>
              {/* <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] border border-black bg-[#FFE566] px-8 font-bold tracking-[-0.08em] text-black shadow-[3px_3px_0_0_#0E140E] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFE566]/90 hover:shadow-[2px_2px_0_0_#0E140E] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0_0_0_#0E140E] md:w-fit"
              >
                Open in Chrome Web Store
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L9 3M9 3H4M9 3V8"
                    stroke="#0E140E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a> */}
            </article>

            <article className="flex flex-1 flex-col gap-4 rounded-[20px] border border-black/20 bg-[#FFFBE8] p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge className="h-7 gap-1.5 rounded-full border border-black bg-[#BE910B]/15 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#BE910B]" />
                  <span className="font-mono text-[10px] leading-[12px] font-semibold tracking-[-0.04em] text-[#0E140E] uppercase">
                    Beta
                  </span>
                </Badge>
                <span className="font-mono text-[11px] leading-[12px] tracking-[-0.04em] text-black/50">
                  v{BETA_VERSION}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3
                  className="text-[20px] leading-[24px] tracking-[-0.04em] text-[#0E140E]"
                  style={{ WebkitTextStroke: "0.5px #0E140E" }}
                >
                  Pear Beta
                </h3>
                <p className="text-[15px] leading-[20px] tracking-[-0.04em] text-black/55">
                  A preview channel with our latest work. Ships ahead of the
                  public release and evolves as we iterate.
                </p>
              </div>
              <div className="mt-auto flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
                <a
                  href={BETA_ZIP_PATH}
                  download
                  className="inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[8px] border border-black bg-[#FFE566] px-5 font-bold tracking-[-0.08em] text-black shadow-[3px_3px_0_0_#0E140E] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFE566]/90 hover:shadow-[2px_2px_0_0_#0E140E] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0_0_0_#0E140E] md:w-fit"
                >
                  Download .zip
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 2V8.5M6 8.5L3 5.5M6 8.5L9 5.5M2.5 10H9.5"
                      stroke="#0E140E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <span className="font-mono text-[11px] leading-[12px] tracking-[-0.04em] text-black/40">
                  .zip · Unpacked extension
                </span>
              </div>
            </article>
          </div>

          <section className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[24px] leading-[28px] tracking-[-0.04em] text-[#0E140E] md:text-[32px] md:leading-[36px]"
                  style={{ WebkitTextStroke: "0.5px #0E140E" }}
                >
                  How to install the beta
                </h2>
                <p className="text-[18px] leading-[26px] tracking-[-0.04em] text-black/60">
                  Four steps. Takes about a minute on Chrome, Edge, Brave or
                  Arc.
                </p>
              </div>
              <ol className="flex flex-col gap-7">
                <InstallStep
                  index={1}
                  title="Download and unzip"
                  body={`Click the download button above. Unzip ${`pear-extension-v${BETA_VERSION}.zip`} anywhere on your machine.`}
                />
                <InstallStep
                  index={2}
                  title="Open your extensions page"
                  body="Go to chrome://extensions (or the equivalent on your browser). Toggle on Developer mode in the top-right corner."
                />
                <InstallStep
                  index={3}
                  title="Load unpacked"
                  body="Click Load unpacked and select the unzipped folder. Pear will appear in your extensions list."
                />
                <InstallStep
                  index={4}
                  title="Pin it and explore"
                  body="Pin Pear to your toolbar and open a checkout to see it in action."
                />
              </ol>
            </div>

            <div className="flex flex-col gap-6 lg:self-center">
              <div className="flex aspect-video w-full items-center justify-center rounded-[24px] border border-dashed border-black/30 bg-[#0E140E]/[0.03]">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <span className="font-mono text-[11px] leading-[12px] font-semibold tracking-[-0.04em] text-black/50 uppercase">
                    Coming soon
                  </span>
                  <p className="max-w-[320px] text-[16px] leading-[22px] tracking-[-0.04em] text-black/50">
                    In the meantime, install the beta and try it out.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center gap-3 pt-10 pb-4 text-center">
            <div className="flex w-6 justify-between pb-4">
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
              <div className="h-1 w-1 rounded-full bg-[#0E140E]/45" />
            </div>
            <p className="leading-[18px] tracking-[-0.08em] text-black/50">
              Review our{" "}
              <Link
                href="/privacy"
                className="transition-colors hover:text-black/60"
              >
                Privacy Policy
              </Link>{" "}
              before installing.
            </p>
          </section>
        </div>
      </article>
      <div className="pt-24" />
      <Wave />
    </main>
  );
}

function InstallStep({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-[24px] border-[13px] border-[#0E140EE5] bg-white py-[9px]">
        <span className="font-bold tracking-[-0.08em] text-[#0E140E]">
          {index}
        </span>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <h3 className="text-[20px] leading-[24px] tracking-[-0.04em] text-[#0E140E]">
          {title}
        </h3>
        <p className="text-[16px] leading-[24px] tracking-[-0.04em] text-black/60">
          {body}
        </p>
      </div>
    </li>
  );
}
