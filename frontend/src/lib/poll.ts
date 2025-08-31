export type PollFn<T> = () => Promise<T>;

/**
 * - intervalMs: interval between atempts
 * - maxMs: total timeout(0 = no timeout)
 * - shouldStop: if returns true, stops and resolve with the last value
 * - signal: to abort from the outside(unmount, browsing, etc.)
 */
export async function poll<T>({
  fn,
  intervalMs = 1500,
  maxMs = 60_000,
  shouldStop,
  signal,
}: {
  fn: PollFn<T>;
  intervalMs?: number;
  maxMs?: number;
  shouldStop: (v: T) => boolean;
  signal?: AbortSignal;
}): Promise<T> {
  const start = Date.now();

  return new Promise<T>((resolve, reject) => {
    let stopped = false;

    const onAbort = () => {
      stopped = true;
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    const tick = async () => {
      if (stopped) return;
      try {
        const value = await fn();
        if (shouldStop(value)) {
          stopped = true;
          signal?.removeEventListener('abort', onAbort);
          resolve(value);
          return;
        }
      } catch (err) {
        stopped = true;
        signal?.removeEventListener('abort', onAbort);
        reject(err);
        return;
      }

      if (maxMs > 0 && Date.now() - start >= maxMs) {
        stopped = true;
        signal?.removeEventListener('abort', onAbort);
        reject(new Error('Polling timeout'));
        return;
      }

      setTimeout(tick, intervalMs);
    };

    tick();
  });
}
