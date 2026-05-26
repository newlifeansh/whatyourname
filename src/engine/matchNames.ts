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
  matchedElement: Element;
  phoneticExplanationElement: Element | null;
  evidence: string[];
}

interface ReasonCandidate {
  text: string;
  element: Element;
  phoneticElement: Element | null;
}

export function matchNames(
  saju: SajuResult,
  gender: Gender,
): NameRecommendation[] {
  const candidates = NAME_DB.filter(
    (n) => n.gender === gender || n.gender === "unisex",
  );

  const targetElements = saju.yongshinElements;

  const scored = candidates.map((name) => {
    let score = 0;
    const reasons: ReasonCandidate[] = [];
    const phoneticEls = getPhoneticElements(name.name);

    // 이름이 가진 모든 오행 (의미 + 발음 합산, 중복 제거)
    const allElements = new Set([...name.elements, ...phoneticEls]);
    let targetMatchCount = 0;
    let strongPenaltyCount = 0;

    // ═══ 핵심: 용신 오행 보완 (최우선) ═══
    for (const [index, targetEl] of targetElements.entries()) {
      const meaningScore = index === 0 ? 82 : 54;
      const phoneticScore = index === 0 ? 52 : 34;

      if (name.elements.includes(targetEl)) {
        score += meaningScore;
        targetMatchCount += 1;
        reasons.push({
          text: `용신 ${elementKo(targetEl)}의 기운을 의미로 보완해줘요`,
          element: targetEl,
          phoneticElement: null,
        });
      }

      if (phoneticEls.includes(targetEl)) {
        score += phoneticScore;
        targetMatchCount += 1;
        const matchingCue = getPhoneticCueForElement(name.name, targetEl);
        if (matchingCue) {
          reasons.push({
            text: `'${matchingCue.source}' 발음이 용신 ${elementKo(targetEl)}의 기운을 채워줘요`,
            element: targetEl,
            phoneticElement: targetEl,
          });
        } else {
          reasons.push({
            text: `이름의 발음이 용신 ${elementKo(targetEl)}의 기운을 채워줘요`,
            element: targetEl,
            phoneticElement: null,
          });
        }
      }
    }

    if (targetMatchCount >= 2) {
      score += 20;
    }

    // ═══ 상생 관계 ═══
    if (allElements.has(saju.dayStemElement)) {
      score += 10;
      if (reasons.length === 0) {
        reasons.push({
          text: `${elementKo(saju.dayStemElement)} 일간과 같은 결의 에너지`,
          element: saju.dayStemElement,
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

    // ═══ 용신 오행을 못 건드리는 이름은 후순위 ═══
    if (targetMatchCount === 0) {
      score -= 22;
    }

    // ═══ 오행 분포 세밀 점수 ═══
    for (const el of allElements) {
      const count = saju.elementCounts[el];
      score += targetElements.includes(el) ? Math.max(0, 3 - count) * 2 : 0;
    }

    // ═══ 같은 그룹 내 자연스러운 순서만 섞기 ═══
    const nameHash = hashString(
      name.name + saju.yearPillar + saju.monthPillar + saju.dayPillar + (saju.timePillar ?? ""),
    );
    score += nameHash % 6;

    const primaryReason = reasons[0] ?? {
      text: `용신 ${elementKo(targetElements[0])}의 기운이 사주 균형을 도와줘요`,
      element: targetElements[0],
      phoneticElement: null,
    };
    const evidence = Array.from(new Set(reasons.map((reason) => reason.text))).slice(0, 3);

    return {
      name,
      score,
      reason: primaryReason.text,
      matchedElement: primaryReason.element,
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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
