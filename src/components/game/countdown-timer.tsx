"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  totalSeconds: number;
  eventStatus: "not_started" | "active" | "paused" | "ended";
}

export default function CountdownTimer({
  totalSeconds,
  eventStatus,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(totalSeconds);

  useEffect(() => {
    setSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (eventStatus !== "active" || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [eventStatus, seconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const isUrgent = seconds < 600 && eventStatus === "active";
  const isCritical = seconds < 60 && eventStatus === "active";

  if (eventStatus === "paused") {
    return (
      <div className="text-center">
        <div className="font-mono text-2xl md:text-4xl font-bold text-amber animate-pulse">
          PAUSED
        </div>
        <div className="text-text3 text-xs mt-1">Waiting for resume</div>
      </div>
    );
  }

  if (eventStatus === "not_started") {
    return (
      <div className="text-center">
        <div className="font-mono text-2xl md:text-4xl font-bold text-blue">
          STANDBY
        </div>
        <div className="text-text3 text-xs mt-1">Event has not started</div>
      </div>
    );
  }

  if (eventStatus === "ended") {
    return (
      <div className="text-center">
        <div className="font-mono text-2xl md:text-4xl font-bold text-red">
          ENDED
        </div>
        <div className="text-text3 text-xs mt-1">Mission time is up</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div
        className={`font-mono text-3xl md:text-5xl font-bold tracking-wider transition-colors ${
          isCritical
            ? "text-red animate-pulse-red"
            : isUrgent
            ? "text-amber"
            : "text-accent"
        }`}
      >
        {pad(h)}:{pad(m)}:{pad(s)}
      </div>
      <div className="text-text3 text-xs mt-1 uppercase tracking-widest font-medium">
        {isCritical
          ? "Time critical"
          : isUrgent
          ? "Running low"
          : "Time remaining"}
      </div>
    </div>
  );
}
