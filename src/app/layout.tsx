import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sphero — AI-Powered Social Intelligence Engine",
  description:
    "Search once, discover what the entire internet is saying. Sphero aggregates public posts from Reddit, X, YouTube, Hacker News, Medium and more into one unified AI-powered search experience.",
  keywords: [
    "social search",
    "AI search",
    "social listening",
    "social intelligence",
    "trend analysis",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
