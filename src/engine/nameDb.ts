import type { Element } from "./saju";

export interface EnglishName {
  name: string;
  pronunciation: string;
  gender: "male" | "female" | "unisex";
  meaning: string;
  elements: Element[];
  personality: string;
  celebrity: string;
}

// 모든 소스에서 이름을 합치고 중복 제거
import { MALE_NAMES } from "./nameDbMale";
import { buildAllNames } from "./autoNames";

function deduplicateNames(names: EnglishName[]): EnglishName[] {
  const seen = new Set<string>();
  return names.filter((n) => {
    const key = `${n.name}-${n.gender}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 합치기: nameDbMale(897) + autoNames(426) → 중복 제거
export const NAME_DB: EnglishName[] = deduplicateNames([
  ...MALE_NAMES,
  ...buildAllNames(),
]);
