"use client";

import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  kind: "line" | "envelope" | "at";
}

export function DripBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let drops: Drop[] = [];

    const COLUMN_GAP = 28;
    const DROP_COUNT_FACTOR = 0.6;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initDrops(rect.width, rect.height);
    }

    function initDrops(w: number, h: number) {
      const cols = Math.floor(w / COLUMN_GAP);
      const count = Math.floor(cols * DROP_COUNT_FACTOR);
      drops = [];

      for (let i = 0; i < count; i++) {
        drops.push(makeDrop(w, h, true));
      }
    }

    function makeDrop(w: number, h: number, scatter: boolean): Drop {
      const r = Math.random();
      let kind: Drop["kind"] = "line";
      if (r < 0.06) kind = "envelope";
      else if (r < 0.12) kind = "at";

      return {
        x:
          Math.floor(Math.random() * (w / COLUMN_GAP)) * COLUMN_GAP +
          COLUMN_GAP / 2,
        y: scatter
          ? Math.random() * h * 1.5 - h * 0.5
          : -Math.random() * h * 0.3,
        speed: kind === "envelope" ? 0.12 + Math.random() * 0.25 : 0.15 + Math.random() * 0.45,
        length: kind === "line" ? 8 + Math.random() * 24 : 16 + Math.random() * 20,
        opacity: 0.04 + Math.random() * 0.1,
        kind,
      };
    }

    function drawEnvelope(
      x: number,
      y: number,
      opacity: number,
      accent: boolean
    ) {
      const w = 10;
      const h = 7;
      const cx = x - w / 2;
      const cy = y - h / 2;

      const color = accent
        ? `rgba(200, 255, 0, ${opacity * 3})`
        : `rgba(255, 255, 255, ${opacity * 1.8})`;

      ctx!.strokeStyle = color;
      ctx!.lineWidth = 0.8;

      // Envelope body
      ctx!.beginPath();
      ctx!.rect(cx, cy, w, h);
      ctx!.stroke();

      // Envelope flap (V shape)
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.lineTo(x, cy + h * 0.55);
      ctx!.lineTo(cx + w, cy);
      ctx!.stroke();
    }

    function draw() {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx!.clearRect(0, 0, w, h);

      for (const drop of drops) {
        drop.y += drop.speed;

        if (drop.y - drop.length > h + 10) {
          Object.assign(drop, makeDrop(w, h, false));
        }

        if (drop.kind === "envelope" || drop.kind === "at") {
          const isEnvelope = drop.kind === "envelope";
          const accent = isEnvelope;
          const trailColor = accent
            ? `rgba(200, 255, 0,`
            : `rgba(200, 255, 0,`;

          // Draw trailing streak above the icon
          const trailGrad = ctx!.createLinearGradient(
            drop.x,
            drop.y - drop.length,
            drop.x,
            drop.y - 6
          );
          trailGrad.addColorStop(0, `${trailColor} 0)`);
          trailGrad.addColorStop(1, `${trailColor} ${drop.opacity * 2})`);

          ctx!.beginPath();
          ctx!.moveTo(drop.x, drop.y - drop.length);
          ctx!.lineTo(drop.x, drop.y - 6);
          ctx!.strokeStyle = trailGrad;
          ctx!.lineWidth = isEnvelope ? 1 : 0.8;
          ctx!.stroke();

          // Draw the icon at the leading edge
          if (isEnvelope) {
            drawEnvelope(drop.x, drop.y, drop.opacity, true);
          } else {
            ctx!.font = "9px monospace";
            ctx!.fillStyle = `rgba(200, 255, 0, ${drop.opacity * 2.5})`;
            ctx!.textAlign = "center";
            ctx!.fillText("@", drop.x, drop.y + 3);
          }
          continue;
        }

        // Default: drip line
        const gradient = ctx!.createLinearGradient(
          drop.x,
          drop.y - drop.length,
          drop.x,
          drop.y
        );

        const isAccent = Math.random() < 0.002; // very rare per-frame flicker
        if (isAccent) {
          gradient.addColorStop(0, `rgba(200, 255, 0, 0)`);
          gradient.addColorStop(
            0.5,
            `rgba(200, 255, 0, ${drop.opacity * 2})`
          );
          gradient.addColorStop(
            1,
            `rgba(200, 255, 0, ${drop.opacity * 3})`
          );
        } else {
          gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
          gradient.addColorStop(
            0.5,
            `rgba(255, 255, 255, ${drop.opacity * 0.5})`
          );
          gradient.addColorStop(
            1,
            `rgba(255, 255, 255, ${drop.opacity})`
          );
        }

        ctx!.beginPath();
        ctx!.moveTo(drop.x, drop.y - drop.length);
        ctx!.lineTo(drop.x, drop.y);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1;
        ctx!.stroke();

        // Leading dot
        ctx!.beginPath();
        ctx!.arc(drop.x, drop.y, 1, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 1.5})`;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        maskImage:
          "linear-gradient(to bottom, black 40%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 40%, transparent 100%)",
      }}
    />
  );
}
