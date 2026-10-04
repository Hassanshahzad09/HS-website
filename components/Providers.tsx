"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** `reducedMotion="user"` turns transform animations off for people who ask the OS for less motion. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
