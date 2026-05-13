import { NAME_DB } from "../engine/nameDb";
import { buildCharacterConcept } from "../engine/characterConcept";
import { getPhoneticCues, getPhoneticElements } from "../engine/phonetic";
import type { Element } from "../engine/saju";

const ELEMENT_KO: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const duplicateKeys = new Set<string>();
const seenKeys = new Set<string>();

for (const name of NAME_DB) {
  const key = `${name.name}-${name.gender}`;
  if (seenKeys.has(key)) {
    duplicateKeys.add(key);
  }
  seenKeys.add(key);
}

const mismatchCandidates = NAME_DB.map((name) => {
  const cues = getPhoneticCues(name.name);
  const phoneticElements = getPhoneticElements(name.name);
  const primaryCue = cues[0] ?? null;
  const supportingCue = cues.slice(1).find((cue) => cue.element !== primaryCue?.element) ?? null;

  return {
    name: name.name,
    gender: name.gender,
    primarySound: primaryCue?.source ?? "",
    primaryElement: primaryCue?.element ?? null,
    supportingElement: supportingCue?.element ?? null,
    phoneticElements,
    dbElements: name.elements,
  };
}).filter((row) => row.primaryElement && row.supportingElement);

const report = {
  totalNames: NAME_DB.length,
  duplicateNameGenderPairs: Array.from(duplicateKeys).length,
  phoneticMismatchRiskCount: mismatchCandidates.length,
  sampleMismatchRisks: mismatchCandidates.slice(0, 50).map((row) => ({
    name: row.name,
    gender: row.gender,
    primarySound: row.primarySound,
    primaryElement: ELEMENT_KO[row.primaryElement!],
    supportingElement: ELEMENT_KO[row.supportingElement!],
    dbElements: row.dbElements.map((el) => ELEMENT_KO[el]),
  })),
  sampleCharacterPrompts: NAME_DB.slice(0, 10).map((name) => ({
    name: name.name,
    gender: name.gender,
    ...buildCharacterConcept(name),
  })),
};

console.log(JSON.stringify(report, null, 2));
