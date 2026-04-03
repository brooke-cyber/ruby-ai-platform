import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "For Founders Law — AI Contract Drafting Platform",
  description: "AI-powered Canadian contract drafting across employment, corporate governance, investment, and commercial practice areas. Powered by Claude.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/60">
          <div className="container-wide flex items-center justify-between h-[72px]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-dark-950 flex items-center justify-center transition-transform duration-300 ease-smooth group-hover:scale-105">
                <span className="text-xs font-bold text-white tracking-tight">FF</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold tracking-tight text-dark-900 leading-tight">
                  For Founders Law
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-10">
              <Link
                href="/agreements"
                className="text-[13px] font-medium text-neutral-500 hover:text-dark-900 transition-colors duration-200"
              >
                Agreements
              </Link>
              <Link
                href="/#how-it-works"
                className="text-[13px] font-medium text-neutral-500 hover:text-dark-900 transition-colors duration-200"
              >
                Process
              </Link>
              <Link
                href="/login"
                className="text-[13px] font-medium text-neutral-500 hover:text-dark-900 transition-colors duration-200"
              >
                Counsel
              </Link>
              <Link
                href="/agreements"
                className="btn-primary !py-2.5 !px-5 !text-[13px]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="pt-[72px]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-neutral-200/60">
          <div className="container-wide py-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-dark-950 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white tracking-tight">FF</span>
              </div>
              <span className="text-sm font-medium text-dark-800">For Founders Law</span>
            </div>
            <p className="text-[13px] text-neutral-400">
              Draft agreements require lawyer review before execution.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
