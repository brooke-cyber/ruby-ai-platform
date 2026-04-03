"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mx-auto h-12 w-12 rounded-xl bg-dark-950 flex items-center justify-center mb-5">
            <span className="text-sm font-bold text-white tracking-tight">FF</span>
          </div>
          <h1 className="font-display text-display-sm text-dark-900">Counsel Portal</h1>
          <p className="text-sm text-neutral-500 mt-2">Sign in to access the review dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-dark-800 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter dashboard password"
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm text-dark-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-dark-950/10 focus:border-dark-950 transition-all duration-200"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-[12px] text-neutral-400 text-center mt-8">
          Access restricted to For Founders Law counsel
        </p>
      </div>
    </div>
  );
}
