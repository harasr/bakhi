import { useEffect, useRef } from "react";
import { createCrtRenderer, crtStyle, CRT_DEFAULTS, CRT_VARIANTS, type CrtOptions } from "./crtRenderer";
import type { CrtVariant } from "./crtScreens";

export { CRT_VARIANTS };
export type { CrtVariant };
export type CrtBackgroundProps = Partial<CrtOptions> & { className?: string, onGameOver?: (score: number) => void };
export function CrtBackground({ className = "", onGameOver, ...props }: CrtBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null);
  const options = { ...CRT_DEFAULTS, ...props };
  const optionsRef = useRef(options);
  const onGameOverRef = useRef(onGameOver);

  useEffect(() => {
    optionsRef.current = options;
    onGameOverRef.current = onGameOver;
  });

  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current;
    if (!host || !canvas) return undefined;
    const renderer = createCrtRenderer(host, canvas, () => optionsRef.current, (score) => onGameOverRef.current?.(score));
    
    const handleInput = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
      if (e instanceof KeyboardEvent && e.code !== "Space") return;
      renderer.input("jump");
    };

    window.addEventListener("keydown", handleInput);
    host.addEventListener("mousedown", handleInput);
    host.addEventListener("touchstart", handleInput);

    let frame = 0, visible = true;
    const resize = () => { renderer.resize(); renderer.render(performance.now()); };
    const tick = (now: number) => { renderer.render(now); frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0; };
    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !frame) frame = requestAnimationFrame(tick);
      if (!visible && frame) cancelAnimationFrame(frame), frame = 0;
    });
    resizeObserver.observe(host);
    intersection.observe(host);
    resize();
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleInput);
      host.removeEventListener("mousedown", handleInput);
      host.removeEventListener("touchstart", handleInput);
      resizeObserver.disconnect();
      intersection.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`threeui-background crt crt-${options.variant}${className ? ` ${className}` : ""}`}
      style={{
        background: crtStyle(options.variant).background,
        opacity: options.opacity,
        filter: `hue-rotate(${options.hue}deg) saturate(${options.saturation}) brightness(${options.brightness})`,
      }}
    >
      <canvas ref={canvasRef} />
      <a 
        href="https://www.tiktok.com/@_thanhwi" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-0 right-0 z-20 block cursor-pointer"
        style={{ width: '40%', height: '10%' }}
        aria-label="Visit TikTok"
      />
    </div>
  );
}
