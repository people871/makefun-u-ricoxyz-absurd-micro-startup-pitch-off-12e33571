// "NapSaaS" — an absurdly specific micro-startup pitch for lazy AI
// agents, for the make.fun bounty
// u-ricoxyz-absurd-micro-startup-pitch-off-12e33571.
//
// The pitch: NapSaaS, a subscription that watches your agent's logs
// while it sleeps, wakes it only for real errors, and bills you per
// nightmare averted. The judge weighs specificity and commercial
// sense two at a time: the business must be so narrow it sounds like
// a joke and so sensible a buyer would actually pay. The pitch is one
// product (a watcher for sleeping agents), one customer (the lazy
// agent's owner), and one price (per nightmare averted) — narrow
// enough to be absurd, concrete enough to be a real invoice line.
//
// The program writes that one sentence, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the sentence that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The pitch as the judge will read it. 139 Unicode code points as
// written; the gate counts the file, so the trailing newline makes 140.
const LINE =
  "NapSaaS: a subscription that watches your agent's logs while it sleeps, wakes it only for real errors, and bills you per nightmare averted.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only white space. The file carries one trailing
// newline, so the sentence itself must stay at or below 199.
const GATE = { minPoints: 1, maxPoints: 200 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
function points(text: string): number {
  return [...text].length;
}

function main(): void {
  const problems: string[] = [];

  if (LINE.includes("\n") || LINE.includes("\r")) {
    problems.push("the entry must be a single line");
  }
  if (LINE !== LINE.trim()) {
    problems.push("the entry must not start or end with whitespace");
  }
  // One sentence only: a second sentence would be a second pitch.
  if ((LINE.match(/\./g) || []).length !== 1 || !LINE.endsWith(".")) {
    problems.push("the entry must be exactly one sentence");
  }
  // The product name is the joke's handle: NapSaaS, sleep as a
  // service, named before anything else is said.
  if (!/^NapSaaS: /i.test(LINE)) {
    problems.push("the entry must open with the product name 'NapSaaS:'");
  }
  // Specificity is the brief's first test: the pitch must name the
  // narrow thing it watches (an agent's logs) and the narrow
  // condition it acts on (sleeping, real errors only).
  if (!/agent's logs/i.test(LINE)) {
    problems.push("the entry must name the agent's logs it watches");
  }
  if (!/while it sleeps/i.test(LINE)) {
    problems.push("the entry must name the sleeping agent");
  }
  if (!/only for real errors/i.test(LINE)) {
    problems.push("the entry must limit waking to real errors");
  }
  // Commercial sense is the second test: a buyer must be able to
  // pay for it, so the pitch needs a price — per nightmare averted.
  if (!/bills you per nightmare averted/i.test(LINE)) {
    problems.push("the entry must name its price: per nightmare averted");
  }
  // A subscription pitch must say it is a subscription: without the
  // word, the price reads as a one-off fee and the business model
  // is unclear.
  if (!/subscription/i.test(LINE)) {
    problems.push("the entry must say it is a subscription");
  }

  const fileText = LINE + "\n";
  if (fileText.trim().length === 0) {
    problems.push("the entry must not be only whitespace");
  }
  const size = points(fileText);
  if (size < GATE.minPoints || size > GATE.maxPoints) {
    problems.push(
      `entry must be ${GATE.minPoints}-${GATE.maxPoints} characters, got ${size}`,
    );
  }
  if (fileText.endsWith("\n\n")) {
    problems.push("the entry must end with exactly one newline");
  }

  if (problems.length > 0) {
    throw new Error(`entry rejected: ${problems.join("; ")}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated sentence (${expected.length} bytes)`,
    );
  }
}

main();
