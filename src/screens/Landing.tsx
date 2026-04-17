import { FixedBottomCTA } from "@toss/tds-mobile";
import { useEffect, useState } from "react";

const CHARACTERS = [
  "final/7.png",
  "final/8.png",
  "final/11.png",
  "final/14.png",
  "final/16.png",
  "final/17.png",
  "final/18.png",
  "final/21.png",
  "final/23.png",
  "final/28.png",
  "final/31.png",
  "final/32.png",
  "final/33.png",
  "final/34.png",
  "final/39.png",
  "final/40.png",
];

const SLOTS = [
  { left: "8%", top: "5%" },
  { left: "32%", top: "0%" },
  { left: "60%", top: "8%" },
  { left: "78%", top: "30%" },
  { left: "55%", top: "42%" },
  { left: "28%", top: "48%" },
  { left: "2%", top: "38%" },
  { left: "18%", top: "72%" },
  { left: "48%", top: "78%" },
  { left: "72%", top: "65%" },
];

interface Pop {
  id: number;
  src: string;
  left: string;
  top: string;
  size: number;
}

interface Props {
  onStart: () => void;
}

export function Landing({ onStart }: Props) {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    let nextId = 0;
    const interval = setInterval(() => {
      const charIdx = Math.floor(Math.random() * CHARACTERS.length);
      const slotIdx = Math.floor(Math.random() * SLOTS.length);
      const id = nextId++;
      const slot = SLOTS[slotIdx];
      const size = Math.round(40 + Math.random() * 70);
      setPops((prev) => [
        ...prev,
        {
          id,
          src: `${import.meta.env.BASE_URL}${CHARACTERS[charIdx]}`,
          left: slot.left,
          top: slot.top,
          size,
        },
      ]);
      setTimeout(() => {
        setPops((prev) => prev.filter((p) => p.id !== id));
      }, 2000);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing">
      <div className="bg-deco" aria-hidden>
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
        <span className="blob blob-4" />
      </div>

      <img
        className="logo"
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="whatyourname 로고"
      />

      <p className="copy">
        이제 인기 영어 이름 순위 검색하지 말고
        <br />내 사주와 맞는 영어이름을 만들어요.
      </p>

      <div className="popcorn-area" aria-hidden>
        {pops.map((p) => (
          <img
            key={p.id}
            className="pop"
            src={p.src}
            alt=""
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <FixedBottomCTA onClick={onStart}>
        <span className="cta-inner">
          <span className="flag" role="img" aria-label="미국">
            🇺🇸
          </span>
          영어 이름 만들기
        </span>
      </FixedBottomCTA>
    </div>
  );
}
