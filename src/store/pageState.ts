import { useCallback, useEffect, useId, useRef } from "react";
import { create } from "zustand";
import type { Setter } from "../types";

// Transient component state lives in Zustand, but resets on unmount as in the prototype.
export const usePageStore = create<{ values: Record<string, unknown> }>(() => ({
  values: {},
}));
export function usePageState<T>(initial: T | (() => T)): [T, Setter<T>] {
  const id = useId();
  const seed = useRef<{ value: T }>();
  if (!seed.current)
    seed.current = {
      value: typeof initial === "function" ? (initial as () => T)() : initial,
    };
  const fallback = seed.current.value;
  const value = usePageStore((state) =>
    Object.hasOwn(state.values, id) ? (state.values[id] as T) : fallback,
  );
  const setValue = useCallback<Setter<T>>(
    (next) => {
      usePageStore.setState((state) => {
        const previous = Object.hasOwn(state.values, id)
          ? (state.values[id] as T)
          : fallback;
        return {
          values: {
            ...state.values,
            [id]:
              typeof next === "function"
                ? (next as (value: T) => T)(previous)
                : next,
          },
        };
      });
    },
    [id, fallback],
  );
  useEffect(
    () => () => {
      usePageStore.setState((state) => {
        const values = { ...state.values };
        delete values[id];
        return { values };
      });
    },
    [id],
  );
  return [value, setValue];
}
