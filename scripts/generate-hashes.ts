import { createHash, randomBytes } from "crypto";

function hashAnswer(answer: string, salt: string): string {
  return createHash("sha256")
    .update(answer.toLowerCase().trim() + salt)
    .digest("hex");
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

const answers = [
  { level: 1, answer: "operation_silent_echo" },
  { level: 2, answer: "ghost_protocol" },
  { level: 3, answer: "forgotten_truth" },
  { level: 4, answer: "delta_echo_gamma" },
  { level: 5, answer: "techalfa_cipher" },
  { level: 6, answer: "vault_override" },
  { level: 7, answer: "hidden_metadata" },
  { level: 8, answer: "backdoor" },
  { level: 9, answer: "shadow_function_executed" },
  { level: 10, answer: "CYBERHUNTERS" }
];

console.log("Generating Salts and Hashes for Levels 1-10:\n");

answers.forEach((entry) => {
  const salt = generateSalt();
  const hash = hashAnswer(entry.answer, salt);
  console.log(`-- LEVEL ${entry.level}`);
  console.log(`Answer: ${entry.answer}`);
  console.log(`Salt: '${salt}'`);
  console.log(`Hash: '${hash}'\n`);
});
