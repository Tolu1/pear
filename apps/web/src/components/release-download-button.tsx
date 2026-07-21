"use client";
import React from "react";
import posthog from "posthog-js";

const BETA_VERSION = "0.1.0-beta";
const BETA_ZIP_PATH = "/download/pear/beta";

function ReleaseDownloadButton() {
  function handleClick() {
    posthog.capture("beta_download_clicked", {
      version: BETA_VERSION,
      source: "releases_page",
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <a
      href={BETA_ZIP_PATH}
      download
      onClick={handleClick}
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
  );
}

export default ReleaseDownloadButton;
