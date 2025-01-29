"use client";
// SnowfallCanvas.tsx
import React, { useRef, useEffect } from "react";

// 색상 팔레트 정의
const colors: string[] = [
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
];

// 마우스 위치 인터페이스
interface MousePosition {
  x: number;
}

// 눈송이 클래스 정의
class Snowflake {
  size: number;
  x: number;
  y: number;
  speedY: number;
  oscillationSpeed: number;
  oscillationRange: number;
  baseX: number;
  angle: number;
  wind: number;
  color: string;
  colors: string[];

  constructor(canvasWidth: number, canvasHeight: number, colors: string[]) {
    this.colors = colors;
    this.size = Math.random() * 6 + 1; // 눈송이 크기 (1 ~ 7)
    this.x = Math.random() * canvasWidth; // 초기 x 위치
    this.y = Math.random() * canvasHeight; // 초기 y 위치
    this.speedY = this.size * 0.3; // 크기에 따른 하강 속도
    this.oscillationSpeed = Math.random() * 0.03 + 0.01; // 진동 속도
    this.oscillationRange = this.size * 2; // 진동 범위
    this.baseX = this.x; // 기본 x 위치
    this.angle = Math.random() * Math.PI * 2; // 초기 진동 각도
    this.wind = Math.random() * 0.5 - 0.25; // 바람 효과
    this.color = this.getRandomColor(); // 무작위 색상
  }

  // 색상 팔레트에서 무작위 색상 선택
  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  // 눈송이 위치 업데이트
  update(parallaxX: number, canvasWidth: number, canvasHeight: number) {
    this.y += this.speedY; // 수직 이동
    this.angle += this.oscillationSpeed; // 진동 각도 업데이트
    this.x =
      this.baseX + Math.sin(this.angle) * this.oscillationRange + this.wind; // 수평 이동

    // 반대 방향 패럴랙스 효과 적용
    this.baseX -= parallaxX * (this.size / 2); // 패럴랙스 민감도 증가

    // 화면을 벗어나면 위치 초기화
    if (this.y > canvasHeight) {
      this.y = -this.size;
      this.baseX = Math.random() * canvasWidth;
    }

    // 수평 위치 초기화 (화면을 벗어났을 때)
    if (this.x > canvasWidth) {
      this.x = -this.size;
    } else if (this.x < -this.size) {
      this.x = canvasWidth;
    }
  }

  // 눈송이를 캔버스에 그리기
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

const SnowfallCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null); // 캔버스 참조
  const snowflakesRef = useRef<Snowflake[]>([]); // 눈송이 배열 참조
  const mouse = useRef<MousePosition>({ x: 0 }); // 현재 마우스 위치
  const targetMouse = useRef<MousePosition>({ x: 0 }); // 목표 마우스 위치
  const animationFrameId = useRef<number>(); // 애니메이션 프레임 ID

  // 눈송이 생성 함수
  const createSnowflakes = (canvasWidth: number, canvasHeight: number) => {
    snowflakesRef.current = [];
    for (let i = 0; i < 600; i++) {
      // 눈송이 수 증가 (더 밀집된 효과)
      snowflakesRef.current.push(
        new Snowflake(canvasWidth, canvasHeight, colors)
      );
    }
  };

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
    createSnowflakes(canvas.width, canvas.height); // 초기 눈송이 생성

    // 마우스 움직임 핸들러
    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.current.x = event.clientX / window.innerWidth - 0.5; // -0.5 ~ 0.5으로 정규화
    };

    document.addEventListener("mousemove", handleMouseMove); // 마우스 움직임 이벤트 리스너 추가

    // 창 크기 변경 핸들러
    const handleResize = () => {
      setCanvasSize();
      createSnowflakes(canvas.width, canvas.height); // 눈송이 재생성
    };

    window.addEventListener("resize", handleResize); // 창 크기 변경 이벤트 리스너 추가

    // 애니메이션 루프
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 지우기

      // 마우스 위치 부드럽게 전환
      mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.25; // 부드러운 전환을 위한 계수 증가

      // 각 눈송이 업데이트 및 그리기
      snowflakesRef.current.forEach((flake) => {
        flake.update(mouse.current.x, canvas.width, canvas.height);
        flake.draw(ctx);
      });

      animationFrameId.current = requestAnimationFrame(animate); // 다음 프레임 요청
    };

    animate(); // 애니메이션 시작

    // 클린업 함수
    return () => {
      document.removeEventListener("mousemove", handleMouseMove); // 마우스 이벤트 리스너 제거
      window.removeEventListener("resize", handleResize); // 창 크기 변경 이벤트 리스너 제거
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current); // 애니메이션 프레임 취소
      }
    };
  }, []);

  // 캔버스 스타일 설정
  const canvasStyle: React.CSSProperties = {
    display: "block", // 기본 인라인 동작 제거
    position: "fixed", // 캔버스 고정 위치
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1, // 다른 요소 뒤에 위치
  };

  return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default SnowfallCanvas;
