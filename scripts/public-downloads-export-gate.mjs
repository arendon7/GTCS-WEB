import fs from "node:fs";
import path from "node:path";

function collectLinkedPdfPaths(outputRoot) {
  const linked = new Set();
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (entry.isFile() && entry.name.endsWith(".html")) {
        const html = fs.readFileSync(file, "utf8");
        for (const [, quote, rawValue] of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
          void quote;
          let pathname;
          try {
            pathname = decodeURIComponent(new URL(rawValue, "https://greenatics.invalid").pathname);
          } catch {
            continue;
          }
          if (pathname.startsWith("/downloads/") && pathname.toLowerCase().endsWith(".pdf")) linked.add(pathname);
        }
      }
    }
  }
  inspect(outputRoot);
  return linked;
}

function listPdfFiles(downloadRoot) {
  const files = [];
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if ((entry.isFile() || entry.isSymbolicLink()) && entry.name.toLowerCase().endsWith(".pdf")) files.push(file);
    }
  }
  inspect(downloadRoot);
  return files;
}

function getExportDownloadsRoot(outputDirectory) {
  const outputInfo = fs.lstatSync(outputDirectory);
  if (!outputInfo.isDirectory() || outputInfo.isSymbolicLink()) throw new Error("Public PDF gate requires a real static export directory.");
  const outputRoot = fs.realpathSync(outputDirectory);
  const downloadsRoot = path.join(outputRoot, "downloads");
  if (!fs.existsSync(downloadsRoot)) return { outputRoot, downloadsRoot: null };
  const info = fs.lstatSync(downloadsRoot);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("Public PDF gate requires a real downloads directory inside the export.");
  return { outputRoot, downloadsRoot: fs.realpathSync(downloadsRoot) };
}

export function excludeUnlinkedPublicDownloadPdfs(outputDirectory) {
  const { downloadsRoot } = getExportDownloadsRoot(outputDirectory);
  if (!downloadsRoot) return [];
  const linked = collectLinkedPdfPaths(fs.realpathSync(outputDirectory));
  const excluded = [];
  for (const file of listPdfFiles(downloadsRoot)) {
    const relative = path.relative(fs.realpathSync(outputDirectory), file).split(path.sep).join("/");
    const publicPath = `/${relative}`;
    if (!linked.has(publicPath)) {
      fs.unlinkSync(file);
      excluded.push(publicPath);
    }
  }
  assertPublicDownloadPdfSet(outputDirectory);
  return excluded.sort();
}

export function assertPublicDownloadPdfSet(outputDirectory) {
  const { outputRoot, downloadsRoot } = getExportDownloadsRoot(outputDirectory);
  if (!downloadsRoot) return;
  const linked = collectLinkedPdfPaths(outputRoot);
  const files = listPdfFiles(downloadsRoot);
  const present = new Set(files.map((file) => `/${path.relative(outputRoot, file).split(path.sep).join("/")}`));
  const violations = [];
  for (const publicPath of linked) if (!present.has(publicPath)) violations.push(`${publicPath}: linked PDF is missing from export`);
  for (const publicPath of present) if (!linked.has(publicPath)) violations.push(`${publicPath}: unlinked PDF remains in export`);
  if (violations.length) throw new Error(`Public PDF export BLOCKED:\n${violations.sort().join("\n")}`);
}
