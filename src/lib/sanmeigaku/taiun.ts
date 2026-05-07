import { JIKKAN, JUNISHI, SETSU_DAYS, KANSHI_RELATION, JUSSEI, ZOKKAN } from './constants';
import { JUNISEI_TABLE } from './yosen';
import type { Meisei } from './insen';

export interface TaiUnEntry {
  kan: string;
  shi: string;
  shusei: string;     // 天干主星
  chiShusei: string;  // 地支主星（主蔵干）
  junisei: string;    // 十二大従星
  startAge: number;
  endAge: number;
}

export interface TaiUn {
  isForward: boolean;  // 陽年=順行, 陰年=逆行
  daysToSetsu: number;
  kiunYears: number;
  kiunMonths: number;  // 0, 4, 8 のいずれか
  entries: TaiUnEntry[];
}

function findNextSetsu(year: number, month: number, day: number): Date {
  const bd = new Date(year, month - 1, day);
  for (const y of [year, year + 1]) {
    for (let m = 1; m <= 12; m++) {
      const sd = new Date(y, m - 1, SETSU_DAYS[m] ?? 6);
      if (sd > bd) return sd;
    }
  }
  return new Date(year + 2, 1, 4);
}

function findPrevSetsu(year: number, month: number, day: number): Date {
  const bd = new Date(year, month - 1, day);
  let best: Date | null = null;
  for (const y of [year - 1, year]) {
    for (let m = 1; m <= 12; m++) {
      const sd = new Date(y, m - 1, SETSU_DAYS[m] ?? 6);
      if (sd < bd && (!best || sd > best)) best = sd;
    }
  }
  return best ?? new Date(year - 1, 11, 7);
}

function cycle60ToKanShi(c: number): [number, number] {
  const s = c % 10;
  const k = ((c - 36 * s) % 60 + 60) % 60;
  return [s, k % 12];
}

function calcShusei(nichikan: string, targetKan: string): string {
  return JUSSEI[KANSHI_RELATION[nichikan]?.[targetKan] ?? 0];
}

function calcChiShusei(nichikan: string, shi: string): string {
  const zokkan = ZOKKAN[shi];
  if (!zokkan || zokkan.length === 0) return JUSSEI[0];
  return calcShusei(nichikan, zokkan[0]);
}

function calcJunisei(nichikan: string, shi: string): string {
  const shiIndex = JUNISHI.indexOf(shi as typeof JUNISHI[number]);
  if (shiIndex === -1) return '天極星';
  return JUNISEI_TABLE[nichikan]?.[shiIndex] ?? '天極星';
}

export function calcTaiUn(
  meisei: Meisei,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
): TaiUn {
  const { nenkanIndex, nitchu, getchu } = meisei;
  const nichikan = nitchu.kan;
  const isForward = nenkanIndex % 2 === 0;

  const setsuDate = isForward
    ? findNextSetsu(birthYear, birthMonth, birthDay)
    : findPrevSetsu(birthYear, birthMonth, birthDay);

  const bd = new Date(birthYear, birthMonth - 1, birthDay);
  const days = Math.abs(Math.round((setsuDate.getTime() - bd.getTime()) / 86400000));
  const kiunYears  = Math.floor(days / 3);
  const kiunMonths = (days % 3) * 4;

  const getkanIdx = JIKKAN.indexOf(getchu.kan as typeof JIKKAN[number]);
  const getshiIdx = JUNISHI.indexOf(getchu.shi as typeof JUNISHI[number]);
  const mCycle = ((36 * getkanIdx + 25 * getshiIdx) % 60 + 60) % 60;

  const entries: TaiUnEntry[] = [];
  for (let i = 1; i <= 10; i++) {
    const c = isForward ? (mCycle + i) % 60 : ((mCycle - i) % 60 + 60) % 60;
    const [si, bi] = cycle60ToKanShi(c);
    const kan = JIKKAN[si];
    const shi = JUNISHI[bi];
    const startAge = kiunYears + (i - 1) * 10;
    entries.push({
      kan, shi,
      shusei:    calcShusei(nichikan, kan),
      chiShusei: calcChiShusei(nichikan, shi),
      junisei:   calcJunisei(nichikan, shi),
      startAge,
      endAge: startAge + 9,
    });
  }

  return { isForward, daysToSetsu: days, kiunYears, kiunMonths, entries };
}
