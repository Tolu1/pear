import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function formatTokenAmount(amount: string, maxDecimals = 4) {
  return Number(amount).toLocaleString("en", {
    maximumFractionDigits: maxDecimals,
  });
}
