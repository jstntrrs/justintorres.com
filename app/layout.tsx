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
          <Layout />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
