import type { Gender } from "../types";
import type { EnglishName } from "./nameDb";
import { NAME_DB } from "./nameDb";
import type { Element, SajuResult } from "./saju";

export interface NameRecommendation {
  name: EnglishName;
  score: number;
  reason: string; // 매칭 이유
}

export function matchNames(
  saju: SajuResult,
  gender: Gender,
): NameRecommendation[] {
  const candidates = NAME_DB.filter(
    (n) => n.gender === gender || n.gender === "unisex",
  );

  const scored = candidates.map((name) => {
    let score = 0;
    let reasons: string[] = [];

    // 1. 부족한 오행 보완 (가장 높은 가산점)
    for (const weakEl of saju.weakElements) {
      if (name.elements.includes(weakEl)) {
        score += 30;
        reasons.push(`부족한 ${elementKo(weakEl)}의 기운을 채워줘요`);
      }
    }

    // 2. 일간(나의 본질) 상생 관계
    const helpingElements = getHelpingElements(saju.dayStemElement);
    for (const helpEl of helpingElements) {
      if (name.elements.includes(helpEl)) {
        score += 15;
        if (!reasons.length) {
          reasons.push(
            `${elementKo(saju.dayStemElement)} 일간과 조화로운 ${elementKo(helpEl)}의 에너지`,
          );
        }
      }
    }

    // 3. 과잉 오행은 감점
    for (const strongEl of saju.strongElements) {
      if (name.elements.includes(strongEl)) {
        score -= 10;
      }
    }

    // 4. 약간의 랜덤성 (동점일 때 다양성)
    score += Math.random() * 5;

    const reason = reasons.length > 0 ? reasons[0] : "당신의 사주와 잘 어울려요";

    return { name, score, reason };
  });

  // 점수 높은 순 정렬 → 상위 3개
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

// 오행 한글 이름
function elementKo(el: Element): string {
  const map: Record<Element, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };
  return map[el];
}

// 상생 관계: 나를 도와주는 오행
// 목→화, 화→토, 토→금, 금→수, 수→목
// "나를 생해주는 것" = 인성 (나를 낳아주는 것)
function getHelpingElements(myElement: Element): Element[] {
  const generating: Record<Element, Element> = {
    wood: "water", // 수생목
    fire: "wood", // 목생화
    earth: "fire", // 화생토
    metal: "earth", // 토생금
    water: "metal", // 금생수
  };
  return [generating[myElement]];
}
