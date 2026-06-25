"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/button";

interface Submission {
  id: string;
  level_id: number;
  is_correct: boolean;
  proof_image_url: string;
  ai_status: string | null;
  submitted_at: string;
  team_id: string;
  teams: {
    team_name: string;
    ai_strikes: number;
  };
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStrike = async (submissionId: string, teamId: string) => {
    if (!confirm("Are you sure you want to flag this for AI usage? The team will get a strike.")) return;

    try {
      const res = await fetch("/api/admin/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId, team_id: teamId })
      });
      
      const data = await res.json();
      if (data.success) {
        if (data.disqualified) {
          alert(`CRITICAL: Team has received their 4th strike and is DISQUALIFIED!`);
        } else {
          alert(`Strike applied! Team now has ${data.strikes}/4 strikes.`);
        }
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-accent font-mono animate-pulse">
        Loading surveillance feed...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <header className="flex justify-between items-center mb-8 border-b border-border2 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-red tracking-widest uppercase mb-1">
            <span className="text-white">&lt;</span> SURVEILLANCE FEED <span className="text-white">/&gt;</span>
          </h1>
          <p className="text-text3 font-mono text-xs">MONITORING ALL INCOMING FRAGMENT SUBMISSIONS</p>
        </div>
        <Link href="/admin" className="text-text3 hover:text-accent font-mono text-sm border border-border2 px-4 py-2 hover:border-accent rounded transition-colors">
          Return to Command
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-surface border border-border2 rounded p-3 flex flex-col relative overflow-hidden group">
            {sub.ai_status === 'flagged' && (
              <div className="absolute inset-0 bg-red/10 border-2 border-red z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red font-display text-3xl font-bold opacity-30 transform -rotate-12 border-4 border-red px-4 py-1 uppercase tracking-widest">
                  AI STRIKE
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-accent font-mono font-bold text-sm truncate max-w-[150px]">{sub.teams?.team_name}</div>
                <div className="text-text3 font-mono text-[10px]">Lvl {sub.level_id} &middot; {new Date(sub.submitted_at).toLocaleTimeString()}</div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i <= (sub.teams?.ai_strikes || 0) ? 'bg-red shadow-[0_0_8px_#ff3c3c]' : 'bg-surface2 border border-border2'}`} />
                ))}
              </div>
            </div>

            <div className="relative aspect-video w-full bg-surface2 rounded mb-4 overflow-hidden border border-border/50 group-hover:border-accent/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={sub.proof_image_url} 
                alt={`Proof from ${sub.teams?.team_name}`}
                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-bg/80 to-transparent" />
            </div>

            <div className="mt-auto">
              <Button 
                variant="danger" 
                className="w-full"
                disabled={sub.ai_status === 'flagged'}
                onClick={() => handleStrike(sub.id, sub.team_id)}
              >
                ⚡ AI STRIKE
              </Button>
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="col-span-full py-12 text-center text-text3 font-mono border border-dashed border-border2 rounded">
            NO INCOMING DATA STREAMS DETECTED
          </div>
        )}
      </div>
    </div>
  );
}
