import { matchNames } from "../engine/matchNames";
import { getNameImage } from "../engine/nameImage";
import {
  getPhoneticCueForElement,
  getPhoneticExplanation,
} from "../engine/phonetic";
import type { Element, SajuResult } from "../engine/saju";

const ELEMENT_KO: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];
const errors: string[] = [];

function createScenario(weakElement: Element): SajuResult {
  return {
    yearPillar: "甲子",
    monthPillar: "丙寅",
    dayPillar: "庚午",
    timePillar: null,
    dayStem: "庚",
    dayStemElement: "metal",
    elementCounts: {
      wood: weakElement === "wood" ? 0 : 3,
      fire: weakElement === "fire" ? 0 : 2,
      earth: weakElement === "earth" ? 0 : 2,
      metal: weakElement === "metal" ? 0 : 3,
      water: weakElement === "water" ? 0 : 2,
    },
    weakElements: [weakElement],
    strongElements: ["metal"],
  };
}

function elementMentionedInReason(reason: string): Element | null {
  return ELEMENTS.find((element) => reason.includes(ELEMENT_KO[element])) ?? null;
}

for (const gender of ["male", "female"] as const) {
  for (const weakElement of ELEMENTS) {
    const recommendations = matchNames(createScenario(weakElement), gender);
    const duplicateNames = getDuplicateRecommendationNames(recommendations);
    const duplicateImages = getDuplicateRecommendationImages(recommendations);

    for (const duplicateName of duplicateNames) {
      errors.push(`Duplicate recommendation name for ${gender}/${weakElement}: ${duplicateName}`);
    }
    for (const duplicateImage of duplicateImages) {
      errors.push(`Duplicate recommendation image for ${gender}/${weakElement}: ${duplicateImage}`);
    }

    for (const recommendation of recommendations) {
      const mentionedElement = elementMentionedInReason(recommendation.reason);
      const phoneticElement = recommendation.phoneticExplanationElement;

      if (phoneticElement !== null) {
        const cue = getPhoneticCueForElement(recommendation.name.name, phoneticElement);
        const explanation = getPhoneticExplanation(recommendation.name.name, phoneticElement);

        if (!cue) {
          errors.push(`Missing cue for ${recommendation.name.name}-${gender} / ${phoneticElement}`);
          continue;
        }
        if (!explanation.includes(cue.source)) {
          errors.push(`Explanation source mismatch for ${recommendation.name.name}-${gender}: ${explanation}`);
        }
        if (!explanation.includes(ELEMENT_KO[phoneticElement])) {
          errors.push(`Explanation element mismatch for ${recommendation.name.name}-${gender}: ${explanation}`);
        }
        if (mentionedElement !== null && mentionedElement !== phoneticElement) {
          errors.push(
            `Reason/phonetic mismatch for ${recommendation.name.name}-${gender}: reason=${mentionedElement}, phonetic=${phoneticElement}`,
          );
        }
      }
    }
  }
}

function getDuplicateRecommendationNames(
  recommendations: ReturnType<typeof matchNames>,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const recommendation of recommendations) {
    const key = recommendation.name.name.trim().toLocaleLowerCase();
    if (seen.has(key)) {
      duplicates.add(recommendation.name.name);
    }
    seen.add(key);
  }

  return Array.from(duplicates);
}

function getDuplicateRecommendationImages(
  recommendations: ReturnType<typeof matchNames>,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const recommendation of recommendations) {
    const imagePath = getNameImage(recommendation.name);
    if (seen.has(imagePath)) {
      duplicates.add(imagePath);
    }
    seen.add(imagePath);
  }

  return Array.from(duplicates);
}

const maxScenario: SajuResult = {
  yearPillar: "甲子",
  monthPillar: "甲子",
  dayPillar: "甲子",
  timePillar: null,
  dayStem: "甲",
  dayStemElement: "wood",
  elementCounts: { wood: 4, fire: 2, earth: 2, metal: 0, water: 0 },
  weakElements: ["metal", "water"],
  strongElements: ["wood"],
};
const maxRecommendation = matchNames(maxScenario, "male").find(
  (recommendation) => recommendation.name.name === "Max",
);

if (!maxRecommendation) {
  errors.push("Regression scenario missing Max recommendation");
} else {
  if (!maxRecommendation.reason.includes(ELEMENT_KO.metal)) {
    errors.push(`Max regression reason mismatch: ${maxRecommendation.reason}`);
  }
  if (
    maxRecommendation.phoneticExplanationElement !== null
    && maxRecommendation.phoneticExplanationElement !== "metal"
  ) {
    errors.push(
      `Max regression phonetic mismatch: ${maxRecommendation.phoneticExplanationElement}`,
    );
  }
}

if (errors.length > 0) {
  console.error(`Recommendation validation failed with ${errors.length} issue(s).\n`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checkedScenarios: ELEMENTS.length * 2,
      regressionChecks: ["reason/phonetic consistency", "Max metal fallback mismatch"],
    },
    null,
    2,
  ),
);
