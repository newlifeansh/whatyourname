import { useEffect, useState } from "react";

const MESSAGES = [
  "사주팔자를 분석하고 있어요...",
  "천간과 지지를 살펴보고 있어요...",
  "오행의 균형을 확인하고 있어요...",
  "부족한 기운을 찾고 있어요...",
  "어울리는 영어이름을 매칭하고 있어요...",
  "거의 다 됐어요!",
];

interface Props {
  onDone: () => void;
}

export function Loading({ onDone }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 15000;
    const start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      setMsgIdx(Math.min(Math.floor(pct * MESSAGES.length), MESSAGES.length - 1));

      if (pct >= 1) {
        clearInterval(timer);
        onDone();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [onDone]);

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
