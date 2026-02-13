/**
 * Auto-bumps the patch version in manifest.json and versions.json.
 * Called by the pre-commit git hook when source files are staged.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "manifest.json");
const versionsPath = resolve(root, "versions.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const versions = JSON.parse(readFileSync(versionsPath, "utf8"));

const [major, minor, patch] = manifest.version.split(".").map(Number);
const oldVersion = manifest.version;
const newVersion = `${major}.${minor}.${patch + 1}`;

manifest.version = newVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n", "utf8");

versions[newVersion] = manifest.minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, "\t") + "\n", "utf8");

console.log(`Version bumped: ${oldVersion} → ${newVersion}`);
