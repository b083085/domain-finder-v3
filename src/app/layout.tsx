import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Domain Finder - Find Perfect Domain Names",
  description: "Find the perfect domain name by analyzing successful e-commerce stores in your niche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
