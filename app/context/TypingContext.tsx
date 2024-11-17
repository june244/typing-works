"use client";
// TypingContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { sentence } from "../mock/practive";

interface TypingContextType {
  userInput: string;
  setUserInput: (input: string) => void;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  typingSpeedPerSecond: number;
  incorrectCount: number;
  setIncorrectCount: (count: number) => void;
  setSentence: () => void;
  _static: string;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const TypingProvider = ({ children }: { children: ReactNode }) => {
  const [_static, setStatic] = useState(
    sentence[Math.ceil(Math.random() * (sentence.length - 1))]
  );
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [typingSpeedPerSecond, setTypingSpeedPerSecond] = useState(0);

  const setSentence = () => {
    const idx = Math.ceil(Math.random() * (sentence.length - 1));
    setStatic(sentence[idx]);
    setUserInput("");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (startTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const timeTakenInSeconds = (currentTime - startTime) / 1000; // 밀리초를 초로 변환
        if (timeTakenInSeconds > 0) {
          const speedPerSecond = userInput.length / timeTakenInSeconds; // 초당 입력된 글자 수 계산
          setTypingSpeedPerSecond(speedPerSecond);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [startTime, userInput]);

  return (
    <TypingContext.Provider
      value={{
        _static,
        userInput,
        setUserInput,
        startTime,
        setStartTime,
        typingSpeedPerSecond,
        incorrectCount,
        setIncorrectCount,
        setSentence,
      }}
    >
      {children}
    </TypingContext.Provider>
  );
};

export const useTypingContext = () => {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error("useTypingContext must be used within a TypingProvider");
  }
  return context;
};
