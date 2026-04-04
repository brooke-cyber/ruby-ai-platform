import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
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
      <body className={`min-h-screen antialiased ${cormorant.variable}`}>
        <Nav />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
