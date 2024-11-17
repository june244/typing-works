"use client";

import { ChangeEvent } from "react";
import ProgressBar from "./ProgressBar";
import { useTypingContext } from "../context/TypingContext";

export default function TypingTest() {
  const {
    _static,
    setSentence,
    userInput,
    setUserInput,
    startTime,
    setStartTime,
    // typingSpeedPerSecond,
    incorrectCount,
    setIncorrectCount,
  } = useTypingContext();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    if (newInput.endsWith("\n")) {
      if (userInput.length >= _static.length) {
        console.log("Enter key pressed");
        setSentence();
        return; // Enter 키를 누르면 추가적인 처리를 막기 위해 여기서 종료
      }
    }

    // 이미 잘못된 입력이 발생한 후 2글자를 넘지 않도록 제한
    if (incorrectCount >= 2 && newInput.length > userInput.length) {
      return;
    }

    // 입력 시작 시간을 기록 (최초 입력시에만)
    if (!startTime) {
      setStartTime(Date.now());
    }

    // 현재 입력된 값과 정답 비교하여 잘못된 입력 개수 확인
    let currentIncorrectCount = 0;
    for (let i = 0; i < newInput.length; i++) {
      if (newInput[i] !== _static[i]) {
        currentIncorrectCount++;
      }
    }

    // 잘못된 입력이 발생했을 때 incorrectCount 업데이트
    if (currentIncorrectCount > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setIncorrectCount((prev) => Math.min(prev + currentIncorrectCount, 2));
    } else {
      // 잘못된 입력이 없다면 incorrectCount를 초기화
      setIncorrectCount(0);
    }

    // 입력 내용 업데이트
    setUserInput(newInput);
  };

  // 가이드 문장과 사용자가 입력한 문장 비교 후 하이라이트
  const renderHighlightedText = () => {
    return (
      <span>
        {_static.split("").map((char, index) => {
          if (index < userInput.length) {
            return (
              <span
                key={index}
                className={
                  char === userInput[index] ? "text-green-500" : "text-red-500"
                }
              >
                {char}
              </span>
            );
          }
          return <span key={index}>{char}</span>;
        })}
      </span>
    );
  };

  return (
    <div className='w-[960px]'>
      {/* <div className='mt-4 text-xl w-[960px]'>
        초당 타자 속도: {typingSpeedPerSecond.toFixed(2)} CPS
      </div> */}
      <div className={"my-5  w-[960px]"}>
        <ProgressBar
          value={Math.max(
            Math.ceil((userInput.length / _static.length) * 100),
            0
          )}
        />
      </div>
      <div className='p-3 mb-4 text-xl w-[960px]'>
        {renderHighlightedText()}
      </div>
      <div className={"relative w-[960px]"}>
        <textarea
          className={`
          p-3
          text-xl
          h-[450px]
          bg-stone-900
          border-inherit
          border-b-4
          border-b-double
          border-b-stone-400
          border-t-4
          border-t-double
          border-t-stone-400
          outline-none
          transition-colors
          duration-300
          ease-in-out
          w-full
          resize-none
          text-white
        `}
          value={userInput}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
