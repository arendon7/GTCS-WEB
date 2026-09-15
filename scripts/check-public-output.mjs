#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(process.env.PUBLIC_OUTPUT_DIR || "out");
const forbiddenLocalUrl = /https?:\/\/(?:(?:localhost|(?:127|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?(?:[/?#][^\s"'<>]*)?)/i;
const failures = [];

function visit(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(entryPath);
      continue;
    }
    if (!/\.(?:html?|txt|json|xml|webmanifest)$/i.test(entry.name)) continue;
    const body = fs.readFileSync(entryPath, "utf8");
    if (forbiddenLocalUrl.test(body)) failures.push(path.relative(process.cwd(), entryPath));
  }
}

visit(outputDir);

if (failures.length > 0) {
  console.error("Public output QA FAIL: local runtime URLs found in the publishable artifact.");
  for (const file of failures) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`Public output QA PASS: no local runtime URLs found in ${outputDir}.`);
}
