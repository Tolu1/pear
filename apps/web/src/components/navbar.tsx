"use client";
import React from "react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

function Navbar() {
  function handleClick() {
    posthog.capture("install_button_clicked", {
      source: "landing_page",
      section: "hero",
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    window.open("https://tally.so/r/w7O8o0", "_blank", "noopener,noreferrer");
  }

  return (
    <nav className="flex items-center justify-between bg-[#D6D58B] px-6 py-2">
      <Logo />
      <a
        href="https://x.com/pearextension"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
      >
        <svg
          width="24"
          height="26"
          viewBox="0 0 24 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.8619 11.4684L21.1471 3H19.4207L13.0951 10.3532L8.04269 3H2.21509L9.85509 14.1192L2.21509 23H3.94149L10.6215 15.2344L15.9575 23H21.7851L13.8611 11.4684H13.8619ZM11.4971 14.2172L10.7231 13.11L4.56349 4.2996H7.21549L12.1863 11.4096L12.9603 12.5168L19.4215 21.7592H16.7695L11.4971 14.2172Z"
            fill="#1A1A1A"
          />
        </svg>
      </a>
      <Button className="gap-2.5" onClick={handleClick}>
        Install
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L5.70711 4.29289C6.09763 4.68342 6.09763 5.31658 5.70711 5.70711L1.70711 9.70711C1.31658 10.0976 0.683417 10.0976 0.292893 9.70711C-0.0976311 9.31658 -0.0976311 8.68342 0.292893 8.29289L3.58579 5L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
            fill="#0E140E"
          />
        </svg>
      </Button>
    </nav>
  );
}

export default Navbar;
