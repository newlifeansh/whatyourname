import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";

const AD_RESULT = "ait.v2.live.fa85f76de967462c";
const AD_UNLOCK = "ait.v2.live.42f2dcdfd8fc481d";

function showAd(adGroupId: string, onDone: () => void) {
  try {
    if (!loadFullScreenAd.isSupported?.()) {
      onDone();
      return;
    }

    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        onDone();
      }
    };

    // 10초 타임아웃 (최후의 안전망)
    const timeout = setTimeout(finish, 10000);

    loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "loaded") {
          showFullScreenAd({
            options: { adGroupId },
            onEvent: (showEvent) => {
              if (
                showEvent.type === "dismissed" ||
                showEvent.type === "clicked" ||
                showEvent.type === "failedToShow"
              ) {
                clearTimeout(timeout);
                finish();
              }
            },
            onError: () => {
              clearTimeout(timeout);
              finish();
            },
          });
        }
      },
      onError: () => {
        clearTimeout(timeout);
        finish();
      },
    });
  } catch {
    onDone();
  }
}

/** 결과 보기 전 광고 */
export function showInterstitialAd(onDone: () => void) {
  showAd(AD_RESULT, onDone);
}

/** 7개 더보기 잠금해제 광고 */
export function showUnlockAd(onDone: () => void) {
  showAd(AD_UNLOCK, onDone);
}

export function showInterstitialAdAsync(): Promise<void> {
  return new Promise((resolve) => {
    showInterstitialAd(resolve);
  });
}

export function showUnlockAdAsync(): Promise<void> {
  return new Promise((resolve) => {
    showUnlockAd(resolve);
  });
}
