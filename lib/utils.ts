import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const EASE = [0.16, 1, 0.3, 1] as const;
