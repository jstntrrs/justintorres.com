import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/lib/context";
import Layout from "@/components/Layout";
import "./globals.css";

const datatype = localFont({
  src: [{ path: "../public/fonts/Datatype-Regular.woff2", weight: "400" }],
  variable: "--font-datatype",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Justin Torres",
  description:
    "Official website and interactive portfolio of Justin Torres, internet enthusiast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${datatype.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {/* Server-rendered loading animation for fast LCP */}
          <div
            id="ssr-loading"
            className="fixed inset-0 z-50 grid place-items-center bg-background pointer-events-none"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="hex-container w-60 h-64">
                <div className="hex-tile" />
                <div className="hex-inner-inset">
                  <img
                    src="/me.gif"
                    alt="Loading"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <h4 className="text-lg font-bold text-primary">Loading...</h4>
            </div>
          </div>
          <Layout />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
