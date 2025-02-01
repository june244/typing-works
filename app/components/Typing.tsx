"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react"; // useState 추가
import ProgressBar from "./ProgressBar";
import { useTypingContext } from "../context/TypingContext";
import { colors } from "../constants/animation-const";
import { getCaretCoordinates, hexToRGBA } from "../libs";
import HighlightedText from "./HighlightedText";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  lifespan: number;
  age: number;
}

export default function TypingTest() {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // textarea 참조
  const canvasRef = useRef<HTMLCanvasElement>(null); // 캔버스 참조
  const particlesRef = useRef<Particle[]>([]); // 입자 배열 참조
  const animationFrameId = useRef<number>(); // 애니메이션 프레임 ID

  // caretCoords 상태 추가
  const [caretCoords, setCaretCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const {
    _static,
    setSentence,
    userInput,
    setUserInput,
    startTime,
    setStartTime,
    incorrectCount,
    setIncorrectCount,
  } = useTypingContext();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    if (newInput.endsWith("\n")) {
      if (userInput.length >= _static.length) {
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
      setIncorrectCount(0);
    }

    // 입력 내용 업데이트
    setUserInput(newInput);

    // 커서 위치 계산
    const caretPos = e.target.selectionStart;
    if (caretPos !== null && textareaRef.current) {
      const coords = getCaretCoordinates(textareaRef.current, caretPos);
      setCaretCoords({ x: coords.x, y: coords.y });

      // 애니메이션 생성 함수 호출
      handleTypingAt(coords.x, coords.y);
    }
  };

  // handleTypingAt 함수는 기존대로 유지됩니다.
  // 기본 인라인 동작 제거 및 애니메이션 시작 위치를 textarea의 좌측 상단으로 변경

  const handleTypingAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스의 위치를 고려하여 좌표 조정
    const canvasRect = canvas.getBoundingClientRect();
    const adjustedX = x + canvasRect.left;
    const adjustedY = y - canvasRect.top - 90;
    console.log(canvasRect.left, canvasRect.top, y, y - canvasRect.top);

    // 파티클 10개 생성
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particlesRef.current.push({
        x: adjustedX,
        y: adjustedY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        lifespan: 60, // 프레임 수 (1초 기준 60fps)
        age: 0,
      });
    }
  };

  // 캔버스 애니메이션 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize(); // 초기 크기 설정

    // 창 크기 변경 핸들러
    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize); // 창 크기 변경 이벤트 리스너 추가

    // 애니메이션 루프
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기

      // 입자 업데이트 및 그리기
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.age += 1;

        // 입자의 수명 초과 시 제거
        if (particle.age >= particle.lifespan) {
          particlesRef.current.splice(index, 1);
          return;
        }

        // 투명도 계산 (수명에 따라 점점 사라짐)
        const alpha = 1 - particle.age / particle.lifespan;
        ctx.fillStyle = hexToRGBA(particle.color, alpha);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate); // 다음 프레임 요청
    };

    animate(); // 애니메이션 시작

    // 클린업 함수
    return () => {
      window.removeEventListener("resize", handleResize); // 창 크기 변경 이벤트 리스너 제거
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // 애니메이션 프레임 취소
      }
    };
  }, []);

  const canvasStyle: React.CSSProperties = {
    display: "block", // 기본 인라인 동작 제거
    position: "absolute", // fixed에서 absolute로 변경
    top: 0, // textarea의 상단과 맞춤
    left: 0, // textarea의 좌측과 맞춤
    width: "100%",
    height: "100%",
    pointerEvents: "none", // 캔버스가 마우스 이벤트를 방해하지 않도록 설정
    zIndex: 99, // 다른 요소 뒤에 위치
    backgroundClip: "red",
  };

  return (
    <div className='w-[960px]'>
      {/* 커서 좌표 표시 (추가) */}
      <div className='text-sm text-gray-400'>
        커서 좌표: x={caretCoords.x}, y={caretCoords.y}
      </div>

      <div className={"my-5 w-[960px]"}>
        <ProgressBar
          value={Math.max(
            Math.ceil((userInput.length / _static.length) * 100),
            0
          )}
        />
      </div>
      <div className='p-3 mb-4 text-xl w-[960px]'>
        <HighlightedText />
      </div>
      <div className={"relative w-[960px]"}>
        <canvas ref={canvasRef} style={canvasStyle} />
        <textarea
          ref={textareaRef}
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
            z-0
          `}
          value={userInput}
          onChange={handleInputChange} // 여기서 애니메이션 시작
        />
      </div>
    </div>
  );
}
