"use client";
import React from "react";
import Link from "next/link";
import posthog from "posthog-js";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/pear/jihaoncggojanjkopoebkihgmebhjdcj";

function AnnouncementBar() {
  function handleStoreClick() {
    posthog.capture("announcement_bar_clicked", {
      target: "chrome_store",
      timestamp: new Date().toISOString(),
    });
  }

  function handleClick() {
    posthog.capture("announcement_bar_clicked", {
      target: "releases",
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <div className="flex w-full items-center justify-center gap-3 bg-[#0E140E] px-4 py-2 text-center">
      <a
        href={CHROME_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleStoreClick}
        className="font-mono text-[12px] leading-[14px] font-medium tracking-[-0.04em] text-[#FFF8D4] transition-opacity hover:opacity-80 md:text-[13px]"
      >
        Now live on the Chrome Web Store
      </a>
      <span
        aria-hidden
        className="text-[12px] leading-[14px] tracking-[-0.04em] text-[#FFF8D4]/40"
      >
        •
      </span>
      <Link
        href="/releases"
        onClick={handleClick}
        className="group inline-flex items-center gap-1 font-mono text-[12px] leading-[14px] font-medium tracking-[-0.04em] text-[#D6D58B] transition-opacity hover:opacity-80 md:text-[13px]"
      >
        Read more
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:translate-x-0.5"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L5.70711 4.29289C6.09763 4.68342 6.09763 5.31658 5.70711 5.70711L1.70711 9.70711C1.31658 10.0976 0.683417 10.0976 0.292893 9.70711C-0.0976311 9.31658 -0.0976311 8.68342 0.292893 8.29289L3.58579 5L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
            fill="#D6D58B"
          />
        </svg>
      </Link>
    </div>
  );
}

export default AnnouncementBar;
