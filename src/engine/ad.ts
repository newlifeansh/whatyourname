import { GoogleAdMob } from "@apps-in-toss/web-framework";

const AD_GROUP_ID = "ait.v2.live.fa85f76de967462c";

/**
 * 앱인토스 전면형 광고를 로드하고 표시
 * 광고가 끝나면 (또는 실패하면) onDone 호출
 */
export function showInterstitialAd(onDone: () => void) {
  try {
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported?.()) {
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

    GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") {
          // 광고 로드 완료 → 표시
          GoogleAdMob.showAppsInTossAdMob({
            onEvent: (showEvent) => {
              // dismissed = 사용자가 광고를 닫음
              if (showEvent.type === "dismissed") {
                finish();
              }
            },
            onError: () => finish(),
          });
        }
      },
      onError: () => finish(),
    });
  } catch {
    onDone();
  }
}
