"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

type Props = {
  href: string;
  version: string;
};

function ReleaseDownloadButton({ href, version }: Props) {
  function handleClick() {
    posthog.capture("beta_download_clicked", {
      version,
      source: "releases_page",
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <Button
      asChild
      size="lg"
      className="w-full shadow-[3px_3px_0_0_#0E140E] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0E140E] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[0_0_0_0_#0E140E] md:w-fit"
    >
      <a href={href} download onClick={handleClick}>
        Download beta .zip
        <svg
          width="12"
          height="12"
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
    </Button>
  );
}

export default ReleaseDownloadButton;
