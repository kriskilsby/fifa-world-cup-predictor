// frontend/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIFA World Cup Predictor",
  description:
    "Live FIFA World Cup predictions, match tracking, and tournament analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* Analytics script*/}
        {process.env.NODE_ENV === "production" && (
          <Script
            src="https://analytics.kriskilsby.com/js/script.js"
            data-domain="fifa.kriskilsby.com"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}