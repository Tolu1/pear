import type { Metadata } from "next";
import { Kode_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";

const astra = localFont({
  src: [
    {
      path: "../assets/fonts/PTAstraSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/PTAstraSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-astra",
});

const melody = localFont({
  src: "../assets/fonts/BrightMelody.ttf",
  display: "swap",
  variable: "--font-melody",
});

const gavelin = localFont({
  src: "../assets/fonts/Gavelin.otf",
  display: "swap",
  variable: "--font-gavelin",
});

const mono = Kode_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pear",
  description: "Spend your crypto on any website, instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "text-foreground flex min-h-dvh flex-col bg-[#D6D58B] antialiased",
          astra.className,
          astra.variable,
          melody.variable,
          gavelin.variable,
          mono.variable,
        )}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
