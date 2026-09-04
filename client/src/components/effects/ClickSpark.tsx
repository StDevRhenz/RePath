import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

type ClickSparkProps = {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  className?: string;
  style?: CSSProperties;
};

type SparkBurst = {
  x: number;
  y: number;
  startedAt: number;
};

const interactiveSelector =
  "input, textarea, select, option, [contenteditable='true'], [data-click-spark-ignore]";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function ClickSpark({
  children,
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  className,
  style,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burstsRef = useRef<SparkBurst[]>([]);
  const frameRef = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || reducedMotion) {
      return;
    }

    const activeCanvas = canvas;

    function resizeCanvas() {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      activeCanvas.width = nextWidth * pixelRatio;
      activeCanvas.height = nextHeight * pixelRatio;
      activeCanvas.style.width = `${nextWidth}px`;
      activeCanvas.style.height = `${nextHeight}px`;

      const context = activeCanvas.getContext("2d");
      context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [reducedMotion]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion || shouldSkipSpark(event.target)) {
      return;
    }

    burstsRef.current = [
      ...burstsRef.current,
      {
        x: event.clientX,
        y: event.clientY,
        startedAt: event.timeStamp,
      },
    ];

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(drawSparks);
    }
  }

  function drawSparks(now: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      frameRef.current = null;
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    burstsRef.current = burstsRef.current.filter((burst) => {
      const progress = Math.min((now - burst.startedAt) / duration, 1);
      const easedProgress = ease(progress, easing);
      const fade = 1 - progress;

      context.save();
      context.globalAlpha = fade;
      context.strokeStyle = sparkColor;
      context.lineWidth = 1.25;
      context.lineCap = "round";

      for (let index = 0; index < sparkCount; index += 1) {
        const angle = (Math.PI * 2 * index) / sparkCount;
        const distance = sparkRadius * extraScale * easedProgress;
        const length = sparkSize * extraScale * fade;
        const startX = burst.x + Math.cos(angle) * distance;
        const startY = burst.y + Math.sin(angle) * distance;
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      }

      context.restore();

      return progress < 1;
    });

    if (burstsRef.current.length > 0) {
      frameRef.current = requestAnimationFrame(drawSparks);
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    frameRef.current = null;
  }

  return (
    <div className={className} style={style} onClick={handleClick}>
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60]"
        />
      )}
      {children}
    </div>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);

  query.addEventListener("change", onStoreChange);

  return () => {
    query.removeEventListener("change", onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function shouldSkipSpark(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(interactiveSelector));
}

function ease(progress: number, easing: ClickSparkProps["easing"]) {
  switch (easing) {
    case "linear":
      return progress;
    case "ease-in":
      return progress * progress;
    case "ease-in-out":
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2;
    case "ease-out":
    default:
      return 1 - (1 - progress) * (1 - progress);
  }
}
