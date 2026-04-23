import { useState } from "react";
import "./App.css";
import { showInterstitialAd } from "./engine/ad";
import { Landing } from "./screens/Landing";
import { Loading } from "./screens/Loading";
import { Result } from "./screens/Result";
import { StepBirthDate } from "./screens/StepBirthDate";
import { StepBirthTime } from "./screens/StepBirthTime";
import { StepGender } from "./screens/StepGender";
import type { Gender, SajuInput } from "./types";

type Step = "landing" | "gender" | "birthDate" | "birthTime" | "loading" | "result";

function App() {
  const [step, setStep] = useState<Step>("landing");
  const [input, setInput] = useState<SajuInput>({
    gender: null,
    birthDate: "",
    birthTime: "",
  });

  const handleAdThenLoading = () => {
    // 전면 광고 표시 → 광고 끝나면 로딩으로
    showInterstitialAd(() => {
      setStep("loading");
    });
  };

  switch (step) {
    case "landing":
      return <Landing onStart={() => setStep("gender")} />;
    case "gender":
      return (
        <StepGender
          value={input.gender}
          onChange={(g: Gender) => setInput((i) => ({ ...i, gender: g }))}
          onNext={() => setStep("birthDate")}
        />
      );
    case "birthDate":
      return (
        <StepBirthDate
          value={input.birthDate}
          onChange={(v) => setInput((i) => ({ ...i, birthDate: v }))}
          onNext={() => setStep("birthTime")}
        />
      );
    case "birthTime":
      return (
        <StepBirthTime
          value={input.birthTime}
          onChange={(v) => setInput((i) => ({ ...i, birthTime: v }))}
          onSubmit={handleAdThenLoading}
        />
      );
    case "loading":
      return <Loading onDone={() => setStep("result")} />;
    case "result":
      return <Result input={input} />;
  }
}

export default App;
