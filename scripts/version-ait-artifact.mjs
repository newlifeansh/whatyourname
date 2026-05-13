import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const channel = process.env.AIT_CHANNEL || "dev";
const source = path.join(projectRoot, "whatyourname.ait");
const releaseDir = path.join(projectRoot, "releases");
const targetName = `whatyourname-v${packageJson.version}-${channel}.ait`;
const target = path.join(releaseDir, targetName);

if (!existsSync(source)) {
  throw new Error(`AIT artifact not found: ${source}`);
}

mkdirSync(releaseDir, { recursive: true });
copyFileSync(source, target);

const sizeMb = (statSync(target).size / 1024 / 1024).toFixed(1);
console.log(`Versioned AIT artifact: releases/${targetName} (${sizeMb} MB)`);
