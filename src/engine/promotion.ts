import {
  Storage,
  getAnonymousKey,
  grantPromotionReward,
} from "@apps-in-toss/web-framework";

const DEFAULT_PROMOTION_CODE = "01KRQ3WWBZ63AYS60ZKYYPPZQF";
const DEFAULT_PROMOTION_AMOUNT = 5;

export const PROMOTION_AMOUNT = Number(
  import.meta.env.VITE_PROMOTION_AMOUNT ?? DEFAULT_PROMOTION_AMOUNT,
);
export const PROMOTION_CODE =
  import.meta.env.VITE_PROMOTION_CODE ?? DEFAULT_PROMOTION_CODE;

export type PromotionRewardStatus =
  | "success"
  | "already_granted"
  | "unsupported"
  | "skipped"
  | "not_running"
  | "error";

export interface PromotionRewardResult {
  status: PromotionRewardStatus;
  message: string;
  key?: string;
  errorCode?: string;
}

let rewardInFlight = false;

function isTossWebView() {
  return typeof window !== "undefined" && "ReactNativeWebView" in window;
}

async function getPromotionStorageKey() {
  const anonymousKey = await getAnonymousKey().catch(() => undefined);
  const userKey =
    anonymousKey && anonymousKey !== "ERROR" ? anonymousKey.hash : "anonymous";

  return `promotion:${PROMOTION_CODE}:${userKey}:result-reward`;
}

export async function grantResultPromotionReward(): Promise<PromotionRewardResult> {
  if (!isTossWebView()) {
    return { status: "skipped", message: "토스앱 환경이 아니어서 지급을 건너뛰었어요." };
  }
  if (rewardInFlight) {
    return { status: "already_granted", message: "포인트 지급을 이미 확인하고 있어요." };
  }

  rewardInFlight = true;

  try {
    const storageKey = await getPromotionStorageKey();
    const storedStatus = await Storage.getItem(storageKey).catch(() => null);

    if (storedStatus === "granted" || storedStatus === "pending") {
      return { status: "already_granted", message: "이미 참여한 프로모션이에요." };
    }

    await Storage.setItem(storageKey, "pending").catch(() => {});

    const result = await grantPromotionReward({
      params: {
        promotionCode: PROMOTION_CODE,
        amount: PROMOTION_AMOUNT,
      },
    });

    if (!result) {
      await Storage.removeItem(storageKey).catch(() => {});
      return {
        status: "unsupported",
        message: "토스앱 업데이트 후 포인트를 받을 수 있어요.",
      };
    }

    if (result === "ERROR") {
      await Storage.removeItem(storageKey).catch(() => {});
      return { status: "error", message: "포인트 지급 확인이 지연되고 있어요." };
    }

    if ("key" in result) {
      await Storage.setItem(storageKey, "granted").catch(() => {});
      return {
        status: "success",
        message: `토스 포인트 ${PROMOTION_AMOUNT}원이 지급됐어요.`,
        key: result.key,
      };
    }

    if (result.errorCode === "4113") {
      await Storage.setItem(storageKey, "granted").catch(() => {});
      return { status: "already_granted", message: "이미 지급된 프로모션이에요." };
    }

    await Storage.removeItem(storageKey).catch(() => {});
    return {
      status: result.errorCode === "4109" ? "not_running" : "error",
      message: result.message || "포인트 지급에 실패했어요.",
      errorCode: result.errorCode,
    };
  } catch {
    return { status: "error", message: "포인트 지급 확인이 지연되고 있어요." };
  } finally {
    rewardInFlight = false;
  }
}
