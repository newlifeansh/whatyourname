import type { Gender } from "../types";
import type { EnglishName } from "./nameDb";
import { NAME_DB } from "./nameDb";
import { getNameImage } from "./nameImage";
import { getPhoneticCueForElement, getPhoneticElements } from "./phonetic";
import type { Element, SajuResult } from "./saju";

export interface NameRecommendation {
  name: EnglishName;
  score: number;
  reason: string;
  phoneticExplanationElement: Element | null;
  evidence: string[];
}

interface ReasonCandidate {
  text: string;
  phoneticElement: Element | null;
}

export function matchNames(
  saju: SajuResult,
  gender: Gender,
): NameRecommendation[] {
  const candidates = NAME_DB.filter(
    (n) => n.gender === gender || n.gender === "unisex",
  );

  const helpingEl = getHelpingElement(saju.dayStemElement);
  const zeroElements = Object.entries(saju.elementCounts)
    .filter(([, count]) => count === 0)
    .map(([el]) => el as Element);

  const scored = candidates.map((name) => {
    let score = 0;
    const reasons: ReasonCandidate[] = [];
    const phoneticEls = getPhoneticElements(name.name);

    // 이름이 가진 모든 오행 (의미 + 발음 합산, 중복 제거)
    const allElements = new Set([...name.elements, ...phoneticEls]);
    let weakMatchCount = 0;
    let strongPenaltyCount = 0;

    // ═══ 핵심: 비어있거나 부족한 오행 보완 (최우선) ═══
    for (const zeroEl of zeroElements) {
      if (name.elements.includes(zeroEl)) {
        score += 70;
        weakMatchCount += 1;
        reasons.push({
          text: `비어있는 ${elementKo(zeroEl)}의 기운을 의미로 보완해줘요`,
          phoneticElement: null,
        });
      }
      if (phoneticEls.includes(zeroEl)) {
        score += 45;
        weakMatchCount += 1;
        const matchingCue = getPhoneticCueForElement(name.name, zeroEl);
        if (matchingCue) {
          reasons.push({
            text: `'${matchingCue.source}' 발음이 비어있는 ${elementKo(zeroEl)}의 기운을 채워줘요`,
            phoneticElement: zeroEl,
          });
        } else {
          reasons.push({
            text: `이름의 발음이 비어있는 ${elementKo(zeroEl)}의 기운을 채워줘요`,
            phoneticElement: null,
          });
        }
      }
    }

    for (const weakEl of saju.weakElements) {
      const deficit = Math.max(1, 3 - saju.elementCounts[weakEl]);

      if (name.elements.includes(weakEl)) {
        score += 24 + deficit * 10;
        weakMatchCount += 1;
        reasons.push({
          text: `부족한 ${elementKo(weakEl)}의 기운을 보완해줘요`,
          phoneticElement: null,
        });
      }

      if (phoneticEls.includes(weakEl)) {
        score += 14 + deficit * 8;
        weakMatchCount += 1;
        const matchingCue = getPhoneticCueForElement(name.name, weakEl);
        if (matchingCue) {
          reasons.push({
            text: `'${matchingCue.source}' 발음이 부족한 ${elementKo(weakEl)}의 기운을 보충해요`,
            phoneticElement: weakEl,
          });
        } else {
          reasons.push({
            text: `이름의 발음이 부족한 ${elementKo(weakEl)}의 기운을 보충해요`,
            phoneticElement: null,
          });
        }
      }
    }

    if (weakMatchCount >= 2) {
      score += 20;
    }

    // ═══ 상생 관계 ═══
    if (allElements.has(helpingEl)) {
      score += 10;
      if (reasons.length === 0) {
        reasons.push({
          text: `${elementKo(saju.dayStemElement)} 일간과 조화로운 ${elementKo(helpingEl)}의 에너지`,
          phoneticElement: null,
        });
      }
    }

    // ═══ 과잉 오행 강한 감점 ═══
    for (const strongEl of saju.strongElements) {
      if (name.elements.includes(strongEl)) {
        score -= 48;
        strongPenaltyCount += 1;
      }
      if (phoneticEls.includes(strongEl)) {
        score -= 28;
        strongPenaltyCount += 1;
      }
    }

    if (strongPenaltyCount >= 2) {
      score -= 12;
    }

    // ═══ 부족 오행을 못 건드리는 이름은 후순위 ═══
    if (weakMatchCount === 0) {
      score -= 18;
    }

    // ═══ 오행 분포 세밀 점수 ═══
    for (const el of allElements) {
      const count = saju.elementCounts[el];
      score += Math.max(0, 3 - count) * 2;
    }

    // ═══ 같은 그룹 내 자연스러운 순서만 섞기 ═══
    const nameHash = hashString(
      name.name + saju.yearPillar + saju.monthPillar + saju.dayPillar + (saju.timePillar ?? ""),
    );
    score += nameHash % 6;

    const primaryReason = reasons[0] ?? {
      text: "당신의 사주와 잘 어울려요",
      phoneticElement: null,
    };
    const evidence = Array.from(new Set(reasons.map((reason) => reason.text))).slice(0, 3);

    return {
      name,
      score,
      reason: primaryReason.text,
      phoneticExplanationElement: primaryReason.phoneticElement,
      evidence,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return uniqueByDisplayNameAndImage(scored).slice(0, 10);
}

function uniqueByDisplayNameAndImage(
  recommendations: NameRecommendation[],
): NameRecommendation[] {
  const seenNames = new Set<string>();
  const seenImages = new Set<string>();

  return recommendations.filter((recommendation) => {
    const nameKey = recommendation.name.name.trim().toLocaleLowerCase();
    const imageKey = getNameImage(recommendation.name);

    if (seenNames.has(nameKey) || seenImages.has(imageKey)) return false;

    seenNames.add(nameKey);
    seenImages.add(imageKey);
    return true;
  });
}

function elementKo(el: Element): string {
  const map: Record<Element, string> = {
    wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
  };
  return map[el];
}

function getHelpingElement(myElement: Element): Element {
  const map: Record<Element, Element> = {
    wood: "water", fire: "wood", earth: "fire", metal: "earth", water: "metal",
  };
  return map[myElement];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
