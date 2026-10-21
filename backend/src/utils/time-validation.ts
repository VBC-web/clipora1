export function parseTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (typeof value !== 'string' || !/^\d{1,3}(?::[0-5]?\d){0,2}(?:\.\d{1,3})?$/.test(value.trim())) throw new Error('Enter a timestamp such as 00:01:25.');
  const parts = value.trim().split(':').map(Number); let seconds = 0;
  for (const part of parts) seconds = seconds * 60 + part;
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Timestamp must be nonnegative.');
  return seconds;
}
export function validateRange(start: unknown, end: unknown, duration?: number, maxDuration = 3600): {start:number;end:number;duration:number} {
  const s = parseTimestamp(start), e = parseTimestamp(end);
  if (e <= s) throw new Error('End time must be greater than start time.');
  if (duration !== undefined && e > duration) throw new Error('End time exceeds the video duration.');
  if (e - s > maxDuration) throw new Error(`Selected clip exceeds the ${maxDuration}-second processing limit.`);
  return {start:s,end:e,duration:e-s};
}
