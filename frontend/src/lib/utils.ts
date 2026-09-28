import { twMerge } from "tailwind-merge";

export function cn(...inputs: unknown[]) {
  const classes = inputs
    .flat(Infinity)
    .filter((item): item is string => typeof item === "string")
    .join(" ");

  return twMerge(classes);
}
