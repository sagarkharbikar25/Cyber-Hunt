"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Card, { CardBody } from "@/components/ui/card";
import Button from "@/components/ui/button";

export default function SubmitPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum 5MB.");
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(selected.type)) {
      setError("Invalid file type. Use PNG, JPG, or WebP.");
      return;
    }

    setFile(selected);
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);

      const res = await fetch("/api/submit/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setUploaded(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-accent">Mission</span> Complete
          </h1>
          <p className="text-text3 text-sm">
            Upload a screenshot of your completed dashboard as proof.
          </p>
        </div>

        {uploaded ? (
          <Card glow="green">
            <CardBody className="text-center py-8">
              <div className="text-5xl mb-4">&#127942;</div>
              <h2 className="text-accent text-xl font-bold mb-2">
                Submission Received
              </h2>
              <p className="text-text2 text-sm mb-6">
                Your screenshot has been uploaded successfully. Results will be
                announced by the organizer after verification.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              {error && (
                <div className="bg-red/10 border border-red/30 text-red rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file
                    ? "border-accent/30 bg-accent/5"
                    : "border-border hover:border-accent/30"
                }`}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Screenshot preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-text2 text-xs">{file?.name}</p>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-text3 text-4xl mb-3">&#128247;</div>
                    <p className="text-text2 text-sm mb-1">
                      Click to select a screenshot
                    </p>
                    <p className="text-text3 text-xs">
                      PNG, JPG, or WebP — Max 5MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {file && (
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="flex-1"
                  >
                    Change
                  </Button>
                  <Button
                    onClick={handleUpload}
                    loading={uploading}
                    className="flex-1"
                  >
                    Upload Proof
                  </Button>
                </div>
              )}

              {!file && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="w-full mt-4"
                >
                  Skip for now
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}
