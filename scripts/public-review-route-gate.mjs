import fs from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".mjs", ".svg", ".txt", ".webmanifest", ".xml"]);

function validatePublicPath(value, { directory = false } = {}) {
  if (typeof value !== "string" || !value.startsWith("/") || /[\\%?#]/.test(value)) return false;
  if (path.posix.normalize(value) !== value) return false;
  if (directory !== value.endsWith("/")) return false;
  return true;
}

export function loadPublicReviewRouteHoldbacks(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.holdbacks)) throw new Error("Invalid public review route manifest.");
  const routes = new Set();
  const assets = new Set();

  for (const item of manifest.holdbacks) {
    if (!validatePublicPath(item?.route, { directory: true }) || routes.has(item.route)) {
      throw new Error("Invalid or duplicate public review route.");
    }
    if (!Array.isArray(item.assets) || item.assets.length === 0 || !item.assets.every((asset) => validatePublicPath(asset))) {
      throw new Error(`Invalid public review assets for ${item.route}.`);
    }
    if (item.assets.some((asset) => assets.has(asset))) throw new Error(`Duplicate public review asset for ${item.route}.`);
    if (typeof item.reason !== "string" || !item.reason.trim() || typeof item.source !== "string" || !item.source.trim()) {
      throw new Error(`Incomplete public review holdback for ${item.route}.`);
    }
    routes.add(item.route);
    for (const asset of item.assets) assets.add(asset);
  }

  return manifest.holdbacks;
}

function resolveContainedPath(root, publicPath, label) {
  const realRoot = fs.realpathSync(root);
  const target = path.resolve(realRoot, publicPath.slice(1));
  const relative = path.relative(realRoot, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label} escapes the static export: ${publicPath}`);
  return target;
}

function assertRealExportDirectory(outputDirectory) {
  const info = fs.lstatSync(outputDirectory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("Public review exclusion requires a real static export directory.");
  return fs.realpathSync(outputDirectory);
}

export function excludePublicReviewRoutes(outputDirectory, holdbacks) {
  const root = assertRealExportDirectory(outputDirectory);
  let excludedRoutes = 0;
  let excludedAssets = 0;

  for (const item of holdbacks) {
    const routeDirectory = resolveContainedPath(root, item.route, "Review route");
    const routeInfo = fs.lstatSync(routeDirectory);
    if (!routeInfo.isDirectory() || routeInfo.isSymbolicLink()) throw new Error(`Review route is not a regular export directory: ${item.route}`);
    fs.rmSync(routeDirectory, { recursive: true });
    excludedRoutes += 1;

    for (const publicAsset of item.assets) {
      const asset = resolveContainedPath(root, publicAsset, "Review asset");
      const assetInfo = fs.lstatSync(asset);
      if (!assetInfo.isFile() || assetInfo.isSymbolicLink()) throw new Error(`Review asset is not a regular export file: ${publicAsset}`);
      fs.unlinkSync(asset);
      excludedAssets += 1;
    }
  }

  assertNoPublicReviewRoutes(root, holdbacks);
  return { routes: excludedRoutes, assets: excludedAssets };
}

export function assertNoPublicReviewRoutes(outputDirectory, holdbacks) {
  const root = assertRealExportDirectory(outputDirectory);
  const textFiles = [];
  function collect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(target);
      else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) textFiles.push(target);
    }
  }
  collect(root);

  const violations = [];
  for (const item of holdbacks) {
    const routeDirectory = resolveContainedPath(root, item.route, "Review route");
    if (fs.existsSync(routeDirectory)) violations.push(`${item.route}: review route is still exported`);
    for (const asset of item.assets) {
      if (fs.existsSync(resolveContainedPath(root, asset, "Review asset"))) violations.push(`${asset}: review asset is still exported`);
    }
    const references = [item.route, ...item.assets];
    for (const file of textFiles) {
      const text = fs.readFileSync(file, "utf8");
      for (const reference of references) {
        if (text.includes(reference)) violations.push(`${reference}: referenced in ${path.relative(root, file)}`);
      }
    }
  }
  if (violations.length) throw new Error(`Public review route holdback BLOCKED:\n${[...new Set(violations)].join("\n")}`);
}
