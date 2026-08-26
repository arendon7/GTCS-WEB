import { readFileSync } from "node:fs";

const namedEntities = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", " "],
]);

function decodeHtmlEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities.get(name.toLowerCase()) ?? entity);
}

export function normalizeResponseText(source) {
  return decodeHtmlEntities(
    source
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

if (process.argv[1]?.endsWith("http-visible-text.mjs")) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/http-visible-text.mjs <response-body-file>");
    process.exit(2);
  }

  process.stdout.write(normalizeResponseText(readFileSync(inputPath, "utf8")));
}
