/**
 * 將秒數轉換為正規化的 ISO 8601 duration 格式
 *
 * @param seconds - 總秒數
 * @returns ISO 8601 duration 字串，例如 "PT1H2M3S" 或 "PT2M30S"
 *
 * @example
 * formatDuration(182) // "PT3M2S"
 * formatDuration(3661) // "PT1H1M1S"
 * formatDuration(45) // "PT45S"
 * formatDuration(0) // "PT0S"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    throw new Error('Duration cannot be negative');
  }

  if (seconds === 0) {
    return 'PT0S';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';

  if (hours > 0) {
    duration += `${hours}H`;
  }

  if (minutes > 0) {
    duration += `${minutes}M`;
  }

  if (secs > 0 || (hours === 0 && minutes === 0)) {
    duration += `${secs}S`;
  }

  return duration;
}

/**
 * 將 ISO 8601 duration 字串轉換為秒數
 * 支援格式：PT123S, PT1H2M3S, PT2M30S 等
 *
 * @param duration - ISO 8601 duration 字串
 * @returns 總秒數
 *
 * @example
 * parseDuration("PT182S") // 182
 * parseDuration("PT3M2S") // 182
 * parseDuration("PT1H1M1S") // 3661
 */
export function parseDuration(duration: string): number {
  if (!duration.startsWith('PT')) {
    throw new Error('Invalid ISO 8601 duration format');
  }

  const timeStr = duration.substring(2);
  let totalSeconds = 0;

  // 匹配小時
  const hoursMatch = timeStr.match(/(\d+)H/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
  }

  // 匹配分鐘
  const minutesMatch = timeStr.match(/(\d+)M/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1], 10) * 60;
  }

  // 匹配秒
  const secondsMatch = timeStr.match(/(\d+)S/);
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1], 10);
  }

  return totalSeconds;
}
