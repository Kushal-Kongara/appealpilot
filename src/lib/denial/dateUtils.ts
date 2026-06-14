export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalDays: number;
}

export interface ParsedDeadline {
  date: Date;
  isEstimated: boolean;
  totalWindowDays: number;
}

export function parseDeadlineDate(s: string): ParsedDeadline {
  const now = Date.now();

  // Try absolute date patterns first
  const absolutePatterns = [
    /(\w+\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ];
  for (const pattern of absolutePatterns) {
    const m = s.match(pattern);
    if (m) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) {
        const totalWindowDays = Math.round((d.getTime() - now) / 86400000);
        return { date: d, isEstimated: false, totalWindowDays: Math.max(totalWindowDays, 1) };
      }
    }
  }

  // Try relative "N days"
  const relativeMatch = s.match(/(\d+)\s*days?/i);
  if (relativeMatch) {
    const n = parseInt(relativeMatch[1], 10);
    const date = new Date(now + n * 86400000);
    return { date, isEstimated: false, totalWindowDays: n };
  }

  // Fallback: 180-day estimated window
  const date = new Date(now + 180 * 86400000);
  return { date, isEstimated: true, totalWindowDays: 180 };
}

export function computeTimeLeft(target: Date, totalWindowDays: number): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalDays: totalWindowDays };
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, isExpired: false, totalDays: totalWindowDays };
}
