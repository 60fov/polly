import clsx, { ClassValue } from "clsx";
import { createContext, useContext } from "react";
import { twMerge } from "tailwind-merge";


export function createCtx<A extends {} | null>() {
  const ctx = createContext<A | undefined>(undefined);
  function useCtx() {
    const c = useContext(ctx);
    if (c === undefined)
      throw new Error("useCtx must be inside a Provider with a value");
    return c;
  }
  return [useCtx, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
}

// yoink'd from shadecn, ty!
// https://github.com/shadcn/taxonomy/blob/0bace50fcac775e7214eab01c96f7fea90d48e8c/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// chatgpt unchecked
export function stringCompareDiff(str1: string, str2: string) {
  // remove spaces and punctuation from both strings
  str1 = str1.replace(/[^\p{L}]/gu, '').toLowerCase();
  str2 = str2.replace(/[^\p{L}]/gu, '').toLowerCase();

  // compare the strings character by character
  let count = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] === str2[i]) {
      count++;
    }
  }

  // return a decimal from 0 to 1 based on similarity
  return count / Math.max(str1.length, str2.length);
}


// chatgpt unchecked
export function shuffle([...arr]) {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};
