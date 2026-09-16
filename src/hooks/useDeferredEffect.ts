import { useEffect, type DependencyList } from "react";

/** Runs after the effect flush so async/data fetch setState is not synchronous in the effect body. */
export function useDeferredEffect(effect: () => void | (() => void), deps: DependencyList) {
  useEffect(() => {
    let cancelled = false;
    let dispose: void | (() => void);
    queueMicrotask(() => {
      if (cancelled) return;
      dispose = effect();
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are provided by the caller
  }, deps);
}
