import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Wave from "@/components/wave";
import ReleaseDownloadButton from "@/components/release-download-button";
import StoreLinkButton from "@/components/store-link-button";
import { VideoDialog } from "@/components/ui/video-dialog";

export const metadata: Metadata = {
  title: "Pear | Releases",
  description:
    "Download Pear. Stable on the Chrome Web Store and a public beta channel for early access to new features.",
};

const BETA_VERSION = "0.1.0-beta";
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
                <StoreLinkButton />
                <span className="font-mono text-[11px] leading-[12px] tracking-[-0.04em] text-black/40">
                  Chrome · Edge · Brave
                </span>
              </div>
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
                <ReleaseDownloadButton />
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
              <VideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/iPmaQMEWK1E"
                thumbnailSrc="https://img.youtube.com/vi/iPmaQMEWK1E/maxresdefault.jpg"
                thumbnailAlt="How to manually install Pear (Beta)"
                className="overflow-hidden rounded-[24px] border border-black/20"
              />
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
