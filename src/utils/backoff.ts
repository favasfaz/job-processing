export function calculateBackoff(attempt: number, baseMs: number, maxMs: number): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * 1000);
  return exponential + jitter;
}
