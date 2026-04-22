"use client";
import React from "react";
import Link from "next/link";
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
  }

  return (
    <Button asChild size="lg" className="w-full md:w-fit">
      <Link href="/releases" onClick={handleClick}>
        Install Free Extension
      </Link>
    </Button>
  );
}

export default InstallButton;
