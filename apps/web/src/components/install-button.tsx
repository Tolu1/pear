"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

function InstallButton() {
  return (
    <Button
      size="lg"
      className="w-full md:w-fit"
      onClick={() =>
        posthog.capture("install_button_clicked", {
          source: "landing_page",
          section: "hero",
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        })
      }
    >
      Install Free Extension
    </Button>
  );
}

export default InstallButton;
