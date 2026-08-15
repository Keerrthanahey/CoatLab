"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

interface StatCounterProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color?: string;
}

function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(spanRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      const controls = animate(motionVal, value, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => {
          if (displayRef.current) {
            displayRef.current.textContent = prefix + v.toFixed(decimals) + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, value, decimals, suffix, prefix, motionVal]);

  return (
    <span ref={spanRef}>
      <span ref={displayRef}>{prefix}0{suffix}</span>
    </span>
  );
}

export function StatCounter({
  value,
  label,
  suffix = "",
  prefix = "",
  decimals = 0,
  color = "#14b8a6",
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col"
    >
      <span
        className="font-display text-3xl font-semibold leading-none"
        style={{ color }}
      >
        <AnimatedNumber value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
      </span>
      <span className="mt-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </motion.div>
  );
}
