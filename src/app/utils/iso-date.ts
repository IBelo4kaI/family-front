export interface DateParts {
  year: number;
  month: number;
  day: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const parseIso = (iso: string): DateParts => {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
};

export const toIso = ({ year, month, day }: DateParts) => `${year}-${pad(month)}-${pad(day)}`;

export const monthKey = ({ year, month }: { year: number; month: number }) => `${year}-${pad(month)}`;

export const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export const todayIso = () => {
  const now = new Date();
  return toIso({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
};

export const addMonths = (iso: string, months: number) => {
  const { year, month, day } = parseIso(iso);
  const total = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(total / 12);
  const targetMonth = (total % 12) + 1;
  return toIso({ year: targetYear, month: targetMonth, day: Math.min(day, daysInMonth(targetYear, targetMonth)) });
};
