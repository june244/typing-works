"use client";

// 번개 객체 인터페이스
interface Lightning {
  x: number;
  y: number;
  xRange: number;
  yRange: number;
  path: { x: number; y: number }[];
  pathLimit: number;
  canSpawn: boolean;
  hasFired: boolean;
  grower: number;
  growerLimit: number;
}

// 번개 애니메이션 클래스 (기존 canvasLightning 코드의 변형)
class LightningEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cw: number;
  private ch: number;
  private lightning: Lightning[];
  private lightTimeCurrent: number;
  private lightTimeTotal: number;
  private now: number;
  private then: number;
  private delta: number;
  private animationFrameId: number | null;
  // 번개가 모두 사라진 시점을 기록 (없으면 null)
  private finishTime: number | null;

  constructor(canvas: HTMLCanvasElement, startX: number, startY: number) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D 컨텍스트를 불러올 수 없습니다.");
    this.ctx = context;
    this.cw = canvas.width;
    this.ch = canvas.height;
    this.lightning = [];
    this.lightTimeCurrent = 0;
    this.lightTimeTotal = 50;
    this.now = Date.now();
    this.then = this.now;
    this.delta = 0;
    this.animationFrameId = null;
    this.finishTime = null;

    // 타이핑한 위치에서 번개 애니메이션 시작
    this.createL(startX, startY, true);
  }

  // rMi ~ rMa 사이의 정수를 반환
  private rand(rMi: number, rMa: number) {
    return Math.floor(Math.random() * (rMa - rMi + 1)) + rMi;
  }

  // 번개 객체 생성
  private createL(x: number, y: number, canSpawn: boolean) {
    this.lightning.push({
      x,
      y,
      xRange: this.rand(5, 12),
      yRange: this.rand(5, 5),
      path: [{ x, y }],
      pathLimit: this.rand(10, 35),
      canSpawn,
      hasFired: false,
      grower: 0,
      growerLimit: 5,
    });
  }

  // 번개 애니메이션 업데이트
  private updateL() {
    for (let i = this.lightning.length - 1; i >= 0; i--) {
      const light = this.lightning[i];
      light.grower += this.delta;
      if (light.grower >= light.growerLimit) {
        light.grower = 0;
        light.growerLimit *= 1.05;
        const lastPoint = light.path[light.path.length - 1];
        light.path.push({
          x: lastPoint.x + (this.rand(0, light.xRange) - light.xRange / 2),
          y: lastPoint.y + this.rand(0, light.yRange),
        });
        if (light.path.length > light.pathLimit) {
          this.lightning.splice(i, 1);
        }
        light.hasFired = true;
      }
    }
  }

  // 번개 애니메이션 렌더링
  private renderL() {
    for (const light of this.lightning) {
      const opacity = this.rand(10, 100) / 100;
      this.ctx.strokeStyle = `hsla(0, 100%, 100%, ${opacity})`;
      let lineWidth = 1;
      if (this.rand(0, 30) === 0) lineWidth = 2;
      if (this.rand(0, 60) === 0) lineWidth = 3;
      if (this.rand(0, 90) === 0) lineWidth = 4;
      this.ctx.lineWidth = lineWidth;

      this.ctx.beginPath();
      this.ctx.moveTo(light.x, light.y);
      for (let j = 0; j < light.path.length; j++) {
        this.ctx.lineTo(light.path[j].x, light.path[j].y);
        if (light.canSpawn && this.rand(0, 100) === 0) {
          light.canSpawn = false;
          this.createL(light.path[j].x, light.path[j].y, false);
        }
      }

      if (!light.hasFired) {
        const fillOpacity = this.rand(4, 12) / 100;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${fillOpacity})`;
        this.ctx.fillRect(0, 0, this.cw, this.ch);
      }
      if (this.rand(0, 60) === 0) {
        const fillOpacity = this.rand(1, 3) / 100;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${fillOpacity})`;
        this.ctx.fillRect(0, 0, this.cw, this.ch);
      }
      this.ctx.stroke();
    }
  }

  // 캔버스 잔상을 서서히 지우기 위한 처리
  private clearCanvas() {
    this.ctx.globalCompositeOperation = "destination-out";
    const opacity = this.rand(1, 30) / 100;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    this.ctx.fillRect(0, 0, this.cw, this.ch);
    this.ctx.globalCompositeOperation = "source-over";
  }

  // 애니메이션 루프 (번개 효과는 타이핑 순간에만 실행되며, 번개가 모두 사라진 후 1초 뒤에 캔버스를 초기화)
  public start() {
    this.then = Date.now();
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.now = Date.now();
      this.delta = this.now - this.then;
      this.then = this.now;

      this.clearCanvas();
      this.updateL();
      this.renderL();

      // 번개 객체가 모두 사라지면 finishTime 설정 후 1초 뒤에 캔버스를 완전히 초기화
      if (this.lightning.length === 0) {
        if (this.finishTime === null) {
          this.finishTime = this.now;
        }
        if (this.now - this.finishTime >= 1000) {
          // 1초 뒤에 캔버스 초기화 후 애니메이션 종료
          this.ctx.clearRect(0, 0, this.cw, this.ch);
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
          }
          return;
        }
      } else {
        // 번개가 남아있으면 finishTime 초기화
        this.finishTime = null;
      }
    };
    animate();
  }
}

export default LightningEffect;
