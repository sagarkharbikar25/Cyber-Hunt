"use client";

import { useState } from "react";
import Card, { CardHeader, CardBody } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [pauseStatus, setPauseStatus] = useState<"idle" | "loading" | "done">("idle");
  const [unlockStatus, setUnlockStatus] = useState<"idle" | "loading" | "done">("idle");
  const [publishStatus, setPublishStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");

  const [unlockTeamId, setUnlockTeamId] = useState("");
  const [unlockLevelId, setUnlockLevelId] = useState("");
  const [publishWinnerId, setPublishWinnerId] = useState("");

  const handleAuth = async () => {
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@cyberhunt.techalfa.in", team_id: adminSecret }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError("Invalid admin secret");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  };

  const handlePause = async (action: "pause" | "resume") => {
    setPauseStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setPauseStatus("done");
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed");
        setPauseStatus("idle");
      }
    } catch {
      setMessage("Network error");
      setPauseStatus("idle");
    }
  };

  const handleForceUnlock = async () => {
    if (!unlockTeamId || !unlockLevelId) return;
    setUnlockStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/force-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: unlockTeamId,
          level_id: parseInt(unlockLevelId),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUnlockStatus("done");
        setMessage(data.message);
        setUnlockTeamId("");
        setUnlockLevelId("");
      } else {
        setMessage(data.error || "Failed");
        setUnlockStatus("idle");
      }
    } catch {
      setMessage("Network error");
      setUnlockStatus("idle");
    }
  };

  const handlePublish = async () => {
    setPublishStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_team_id: publishWinnerId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishStatus("done");
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed");
        setPublishStatus("idle");
      }
    } catch {
      setMessage("Network error");
      setPublishStatus("idle");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Card className="w-full max-w-sm">
          <CardBody>
            <h1 className="font-display text-xl font-bold text-center mb-4">
              <span className="text-red">Admin</span> Access
            </h1>
            {authError && (
              <div className="bg-red/10 border border-red/30 text-red rounded px-3 py-2 mb-3 text-sm">
                {authError}
              </div>
            )}
            <Input
              label="Admin Secret"
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter admin secret"
              mono
            />
            <Button onClick={handleAuth} className="w-full mt-4">
              Authenticate
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-base font-bold">
            <span className="text-red">Admin</span>
            <span className="text-text3 text-xs ml-2">Emergency Controls</span>
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {message && (
          <div className="bg-accent/10 border border-accent/30 text-accent rounded-lg px-4 py-3 mb-4 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pause / Resume */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold text-text">Event Control</span>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-text3 text-xs">
                Pause freezes the timer for all teams. Resume adds the paused duration back.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={() => handlePause("pause")}
                  loading={pauseStatus === "loading"}
                  className="flex-1"
                >
                  Pause Event
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePause("resume")}
                  loading={pauseStatus === "loading"}
                  className="flex-1"
                >
                  Resume Event
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Force Unlock */}
          <Card>
            <CardHeader>
              <span className="text-sm font-semibold text-text">Force Unlock Level</span>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-text3 text-xs">
                Emergency: Unlock a specific level for a team. Previous levels auto-solved.
              </p>
              <Input
                label="Team ID"
                value={unlockTeamId}
                onChange={(e) => setUnlockTeamId(e.target.value)}
                placeholder="TEAM-X7K92"
                mono
              />
              <Input
                label="Level ID (1-10)"
                value={unlockLevelId}
                onChange={(e) => setUnlockLevelId(e.target.value)}
                placeholder="5"
                type="number"
                min={1}
                max={10}
              />
              <Button
                variant="danger"
                onClick={handleForceUnlock}
                loading={unlockStatus === "loading"}
                disabled={!unlockTeamId || !unlockLevelId}
                className="w-full"
              >
                Force Unlock
              </Button>
            </CardBody>
          </Card>

          {/* Publish Results */}
          <Card className="md:col-span-2">
            <CardHeader>
              <span className="text-sm font-semibold text-text">Publish Results</span>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-text3 text-xs">
                After manual verification, publish results for everyone. This unlocks the /results page.
              </p>
              <Input
                label="Winner Team ID (optional)"
                value={publishWinnerId}
                onChange={(e) => setPublishWinnerId(e.target.value)}
                placeholder="TEAM-X7K92"
                mono
              />
              <Button
                onClick={handlePublish}
                loading={publishStatus === "loading"}
                className="w-full"
              >
                Publish Results & Mark Winner
              </Button>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
