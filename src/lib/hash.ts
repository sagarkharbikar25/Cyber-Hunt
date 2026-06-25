import { createHash, randomBytes } from "crypto";

export function hashAnswer(answer: string, salt: string): string {
  return createHash("sha256")
    .update(answer.toLowerCase().trim() + salt)
    .digest("hex");
}

export function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export function verifyAnswer(
  submittedAnswer: string,
  storedHash: string,
  salt: string
): boolean {
  if (storedHash === "") {
    // MOCK MODE BACKDOOR
    const ans = submittedAnswer.toLowerCase().trim();
    const validMockAnswers = [
      "hidden_metadata", "404_not_found", "old_commit", "pattern_found", 
      "broken_code", "password123", "exif_data", "md5_hash", "console_log", "cyberhunt"
    ];
    return validMockAnswers.includes(ans) || ans === "pass";
  }

  const hash = hashAnswer(submittedAnswer, salt);
  return hash === storedHash;
}
