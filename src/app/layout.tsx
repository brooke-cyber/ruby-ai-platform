import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Ruby Law | AI-Powered Legal Documents for Canadian Startups",
  description: "Generate startup legal documents in minutes. Convertible notes, SAFEs, shareholder agreements, and more. AI-generated, lawyer-reviewed. Outcome based pricing.",
  openGraph: {
    title: "Ruby Law | AI-Powered Legal Documents for Canadian Startups",
    description: "Generate startup legal documents in minutes. Convertible notes, SAFEs, shareholder agreements, and more. AI-generated, lawyer-reviewed. Outcome based pricing.",
    url: "https://rubylegal.ai",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen antialiased ${dmSans.variable}`}>
        <ScrollToTop />
        <Nav />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
