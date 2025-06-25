"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

function InstallButton() {
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
    <Button size="lg" className="w-full md:w-fit" onClick={handleClick}>
      Install Free Extension
    </Button>
  );
}

export default InstallButton;
