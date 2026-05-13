import fs from "node:fs";
import path from "node:path";
import { NAME_DB } from "../engine/nameDb";
import { getNameImage } from "../engine/nameImage";
import {
  getPhoneticCueForElement,
  getPhoneticElements,
  getPhoneticExplanation,
} from "../engine/phonetic";
import type { Element } from "../engine/saju";

const ELEMENT_KO: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

const errors: string[] = [];
const seen = new Set<string>();

for (const name of NAME_DB) {
  const key = `${name.name}-${name.gender}`;

  if (seen.has(key)) {
    errors.push(`Duplicate name entry: ${key}`);
    continue;
  }
  seen.add(key);

  if (!name.name.trim()) errors.push(`Empty name: ${key}`);
  if (!name.pronunciation.trim()) errors.push(`Empty pronunciation: ${key}`);
  if (!name.meaning.trim()) errors.push(`Empty meaning: ${key}`);
  if (!name.personality.trim()) errors.push(`Empty personality: ${key}`);
  if (!name.celebrity.trim()) errors.push(`Empty celebrity: ${key}`);
  if (name.elements.length === 0) errors.push(`No elements assigned: ${key}`);

  const phoneticElements = getPhoneticElements(name.name);
  if (phoneticElements.length === 0) {
    errors.push(`No phonetic elements derived: ${key}`);
  }

  for (const element of phoneticElements) {
    const cue = getPhoneticCueForElement(name.name, element);
    const explanation = getPhoneticExplanation(name.name, element);

    if (!cue) {
      errors.push(`Missing phonetic cue for ${key} element ${element}`);
      continue;
    }
    if (!explanation.includes(cue.source)) {
      errors.push(`Explanation cue mismatch for ${key}: expected ${cue.source}, got "${explanation}"`);
    }
    if (!explanation.includes(ELEMENT_KO[element])) {
      errors.push(`Explanation element mismatch for ${key}: expected ${ELEMENT_KO[element]}, got "${explanation}"`);
    }
  }

  const imagePath = getNameImage(name);
  const fullImagePath = path.join(publicDir, imagePath);
  if (!fs.existsSync(fullImagePath)) {
    errors.push(`Missing image asset for ${key}: ${imagePath}`);
  }
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} issue(s).\n`);
  for (const error of errors.slice(0, 200)) {
    console.error(`- ${error}`);
  }
  if (errors.length > 200) {
    console.error(`...and ${errors.length - 200} more`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      validatedNames: NAME_DB.length,
      checked: [
        "required fields",
        "duplicate name-gender keys",
        "phonetic cue/explanation alignment",
        "mapped image asset existence",
      ],
    },
    null,
    2,
  ),
);
