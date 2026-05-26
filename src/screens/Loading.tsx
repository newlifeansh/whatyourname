import { useEffect, useRef, useState } from "react";
import { showInterstitialAdAsync } from "../engine/ad";

const MESSAGES = [
  "오행의 균형을 확인하고 있어요...",
  "용신 기운을 찾고 있어요...",
  "어울리는 영어이름을 매칭하고 있어요...",
  "거의 다 됐어요!",
];

interface Props {
  onDone: () => void;
}

export function Loading({ onDone }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0.8);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const duration = 5000;
    const startProgress = 0.8;
    const start = Date.now();
    let adCompleted = false;
    let timerCompleted = false;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(1);
      setMsgIdx(MESSAGES.length - 1);
      onDoneRef.current();
    };

    const tryFinish = () => {
      if (adCompleted && timerCompleted) {
        finish();
      }
    };

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      const displayProgress = startProgress + pct * (1 - startProgress);
      setProgress(displayProgress);
      setMsgIdx(Math.min(Math.floor(pct * MESSAGES.length), MESSAGES.length - 1));

      if (pct >= 1) {
        clearInterval(timer);
        timerCompleted = true;
        tryFinish();
      }
    }, 100);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - start >= duration) {
        clearInterval(timer);
        timerCompleted = true;
        tryFinish();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    showInterstitialAdAsync().finally(() => {
      adCompleted = true;
      tryFinish();
    });

    return () => {
      finished = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-emoji-wrap">
        <img
          className="loading-emoji"
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt=""
        />
      </div>

      <div className="loading-msg">{MESSAGES[msgIdx]}</div>

      <div className="loading-bar-wrap">
        <div
          className="loading-bar-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="loading-pct">{Math.round(progress * 100)}%</div>
    </div>
  );
}
