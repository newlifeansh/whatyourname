import { FixedBottomCTA } from "@toss/tds-mobile";

const CHARACTERS = [
  "final/7.png", "final/8.png", "final/11.png", "final/14.png",
  "final/16.png", "final/17.png", "final/18.png", "final/21.png",
  "final/23.png", "final/28.png", "final/31.png", "final/32.png",
  "final/33.png", "final/34.png", "final/39.png", "final/40.png",
];

// 2줄 마키: 각 줄에 이모지를 반씩 나눔 + 반복
const ROW1 = CHARACTERS.slice(0, 8);
const ROW2 = CHARACTERS.slice(8, 16);

interface Props {
  onStart: () => void;
}

export function Landing({ onStart }: Props) {
  const base = import.meta.env.BASE_URL;

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
        src={`${base}logo.png`}
        alt="whatyourname 로고"
      />

      <p className="copy">
        이제 영어 이름도 인기 순위보다,
        <br />내 사주에 맞게 만들어보세요.
      </p>

      <div className="marquee-area" aria-hidden>
        {/* 1줄: 좌→우 */}
        <div className="marquee-row">
          <div className="marquee-track marquee-left">
            {[...ROW1, ...ROW1].map((src, i) => (
              <img
                key={`r1-${i}`}
                className="marquee-img"
                src={`${base}${src}`}
                alt=""
              />
            ))}
          </div>
        </div>
        {/* 2줄: 우→좌 */}
        <div className="marquee-row">
          <div className="marquee-track marquee-right">
            {[...ROW2, ...ROW2].map((src, i) => (
              <img
                key={`r2-${i}`}
                className="marquee-img"
                src={`${base}${src}`}
                alt=""
              />
            ))}
          </div>
        </div>
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
