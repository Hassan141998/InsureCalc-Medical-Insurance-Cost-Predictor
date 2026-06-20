"use client";
import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/api";

interface Props {
  value: number;
  duration?: number;
}

export default function AnimatedCounter({ value, duration = 1500 }: Props) {
  const [display, setDisplay] = useState(0);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
      else prevRef.current = end;
    };

    startRef.current = null;
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value, duration]);

  return (
    <span className="font-mono-custom tabular-nums">
      {fmt(display)}
    </span>
  );
}
