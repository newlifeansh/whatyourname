import { graniteEvent } from "@apps-in-toss/web-framework";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Landing } from "./screens/Landing";
import { Loading } from "./screens/Loading";
import { Result } from "./screens/Result";
import { StepBirthDate } from "./screens/StepBirthDate";
import { StepBirthTime } from "./screens/StepBirthTime";
import { StepGender } from "./screens/StepGender";
import type { Gender, SajuInput } from "./types";

type Step = "landing" | "gender" | "birthDate" | "birthTime" | "loading" | "result";

const STEP_ORDER: Step[] = ["landing", "gender", "birthDate", "birthTime", "loading", "result"];

function App() {
  const [step, setStep] = useState<Step>("landing");
  const [input, setInput] = useState<SajuInput>({
    gender: null,
    birthDate: "",
    birthTime: "",
  });
  const stepRef = useRef(step);
  stepRef.current = step;

  // 뒤로가기 처리
  useEffect(() => {
    if (!graniteEvent?.addEventListener) return;
    if (typeof window !== "undefined" && !("ReactNativeWebView" in window)) return;

    try {
      const unsubscribe = graniteEvent.addEventListener("backEvent", {
        onEvent: () => {
          const currentStep = stepRef.current;
          const idx = STEP_ORDER.indexOf(currentStep);

          if (currentStep === "loading" || currentStep === "result") {
            // 로딩/결과에서는 처음으로
            setStep("landing");
            setInput({ gender: null, birthDate: "", birthTime: "" });
          } else if (idx > 0) {
            setStep(STEP_ORDER[idx - 1]);
          }
          // landing에서는 기본 동작(앱 종료)
        },
      });

      return unsubscribe;
    } catch {
      return;
    }
  }, []);

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
          onSubmit={() => setStep("loading")}
        />
      );
    case "loading":
      return <Loading onDone={() => setStep("result")} />;
    case "result":
      return <Result input={input} />;
  }
}

export default App;
