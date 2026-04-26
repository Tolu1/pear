import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getActiveTab } from "@/lib/browser/get-active-tab";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isExtensionEnvironment() {
  return Boolean(window.chrome?.runtime?.id);
}

export function getCurrencySymbol(currencyCode: string) {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency: currencyCode })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currencyCode
  );
}

export async function getViewportInfo() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
    }),
  });

  const viewport = result.result;
  if (!viewport) throw new Error("Could not get viewport info");
  console.log("\n📊 EXTENSION VIEWPORT INFO:");
  console.log(`📐 Browser viewport: ${viewport.width}x${viewport.height}`);
  console.log(`📱 Device pixel ratio: ${viewport.devicePixelRatio}`);
  console.log(
    `🖥️ Physical pixels: ${viewport.width * viewport.devicePixelRatio}x${viewport.height * viewport.devicePixelRatio}`,
  );

  return viewport;
}

export async function getDOMContent() {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab found");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });
  const dom = result.result;
  if (!dom) throw new Error("Could not get DOM content");
  return dom;
}
