"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Card, { CardBody } from "@/components/ui/card";
import Button from "@/components/ui/button";
import FragmentInventory from "@/components/game/fragment-inventory";
import type { Fragment } from "@/types";

export default function CompletePage() {
  const router = useRouter();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFragments = useCallback(async () => {
    try {
      const res = await fetch("/api/fragments");
      const data = await res.json();
      setFragments(data.fragments || []);
    } catch (err) {
      console.error("Fragments error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFragments();
  }, [fetchFragments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-accent font-mono text-sm animate-pulse">
          Decrypting mission data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">&#128274;</div>
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-accent">Encryption</span> Key Recovered
          </h1>
          <p className="text-text3 text-sm">
            All 9 fragments collected. Mission complete.
          </p>
        </div>

        {/* Fragment Assembly Display */}
        <Card glow="green" className="mb-6">
          <CardBody>
            <div className="text-center mb-4">
              <h3 className="text-xs font-semibold text-text3 uppercase tracking-wider">
                Collected Fragments
              </h3>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {fragments.map((f) => (
                <div
                  key={f.level_id}
                  className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-center"
                >
                  <span className="text-[10px] text-text3 block font-mono">
                    L{f.level_id}
                  </span>
                  <span className="font-mono text-accent font-bold text-lg">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
            {fragments.length === 9 && (
              <div className="text-center mt-4 p-4 bg-surface2 rounded-lg border border-accent/20">
                <p className="text-text3 text-xs mb-2">Assembled Answer:</p>
                <p className="font-mono text-accent text-2xl font-bold tracking-wider">
                  CYBERHUNTERS
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardBody className="text-center py-6">
            <h2 className="text-lg font-bold text-text mb-2">
              What&apos;s Next?
            </h2>
            <p className="text-text2 text-sm mb-4">
              Your submission has been recorded. Upload your proof screenshot
              and wait for the organizer to announce results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/submit")}>
                Upload Screenshot
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
