"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/submissions");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="font-display text-lg font-bold">
          <span className="text-white">&lt;</span>
          <span className="text-red">ADMIN_PORTAL</span>
          <span className="text-white"> /&gt;</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold mb-2 text-red">Restricted Area</h1>
            <p className="text-text3 text-sm font-mono">Enter administrative passphrase</p>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 text-red rounded px-4 py-3 mb-6 text-sm font-mono text-center">
              ACCESS DENIED: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text mb-1.5 uppercase tracking-wider font-bold">PASSPHRASE</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-red font-mono">root@admin:~$</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface border border-border2 rounded pl-[140px] pr-4 py-3 text-sm text-text placeholder:text-text3 focus:outline-none focus:border-red transition-colors font-mono"
                  placeholder="******"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bg border border-red text-red font-bold py-3 mt-8 hover:bg-red hover:text-white hover:shadow-[0_0_12px_#ff3c3c] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest font-mono rounded-sm"
            >
              {loading ? "AUTHENTICATING..." : "AUTHORIZE"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
