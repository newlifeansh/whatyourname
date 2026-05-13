import fs from "node:fs";
import path from "node:path";
import { NAME_DB } from "../engine/nameDb";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const projectRoot = process.cwd();
const imageDir = path.join(projectRoot, "public", "name-images");
const outputPath = path.join(projectRoot, "src", "generated", "nameImageManifest.ts");

const existingFiles = new Set(
  fs.readdirSync(imageDir)
    .filter((file) => file.toLowerCase().endsWith(".png"))
    .map((file) => file.toLowerCase()),
);

const entries = NAME_DB.flatMap((name) => {
  const slug = `${slugify(name.name)}.png`;
  if (!existingFiles.has(slug)) {
    return [];
  }

  return [[`${name.name}-${name.gender}`, `name-images/${slug}`] as const];
}).sort(([left], [right]) => left.localeCompare(right));

const fileContents = [
  "export const GENERATED_NAME_IMAGE_MAP: Record<string, string> = {",
  ...entries.map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`),
  "};",
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fileContents);

console.log(
  JSON.stringify(
    {
      ok: true,
      mapped: entries.length,
      outputPath,
    },
    null,
    2,
  ),
);
