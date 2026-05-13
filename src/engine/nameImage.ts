import type { EnglishName } from "./nameDb";
import { NAME_DB } from "./nameDb";
import { GENERATED_NAME_IMAGE_MAP } from "../generated/nameImageManifest";

const MALE_IMAGE_POOL = [
  "img5.png", "img6.png", "img7.png", "img8.png", "img9.png",
  "img10.png", "img11.png", "img13.png", "img14.png", "img15.png",
  "img16.png", "img17.png", "img18.png", "img19.png", "img21.png",
  "img22.png", "img23.png", "img24.png", "img25.png", "img26.png",
  "img27.png", "img28.png", "img64.png", "img65.png", "img66.png",
  "img67.png", "img75.png", "img91.png",
] as const;

const FEMALE_IMAGE_POOL = [
  "img29.png", "img30.png", "img31.png", "img32.png", "img33.png",
  "img34.png", "img35.png", "img36.png", "img37.png", "img38.png",
  "img39.png", "img40.png", "img41.png", "img42.png", "img43.png",
  "img44.png", "img45.png", "img46.png", "img47.png", "img48.png",
  "img49.png", "img50.png", "img60.png", "img61.png", "img62.png",
  "img63.png", "img70.png", "img71.png", "img80.png", "img81.png",
  "img82.png", "img83.png", "img84.png", "img92.png", "img93.png",
  "img100.png", "img101.png", "img105.png", "img106.png", "img107.png",
  "img108.png", "img109.png",
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getPool(name: EnglishName): readonly string[] {
  return name.gender === "female" ? FEMALE_IMAGE_POOL : MALE_IMAGE_POOL;
}

function getPoolImage(name: EnglishName): string {
  const pool = getPool(name);
  const seed = hashString(
    `${name.name}-${name.gender}-${name.meaning}-${name.elements.join(",")}`,
  );
  return `Result/${pool[seed % pool.length]}`;
}

function buildImageMap() {
  return Object.fromEntries(
    NAME_DB.map((name) => {
      const key = `${name.name}-${name.gender}`;
      return [key, GENERATED_NAME_IMAGE_MAP[key] ?? getPoolImage(name)];
    }),
  );
}

const NAME_IMAGE_MAP = buildImageMap();

export function getNameImage(name: EnglishName): string {
  return NAME_IMAGE_MAP[`${name.name}-${name.gender}`] ?? getPoolImage(name);
}

export function getAllNameImages(): Record<string, string> {
  return NAME_IMAGE_MAP;
}
