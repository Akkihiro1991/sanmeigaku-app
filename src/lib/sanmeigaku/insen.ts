import {
  JIKKAN, JUNISHI, SETSU_DAYS, MONTH_SHI, MONTH_KAN_START,
  GOGYO, GOGYO_SHI, INYO_KAN, ZOKKAN,
} from './constants';

export interface Chu {
  kan: string;  // 天干
  shi: string;  // 地支
}

export interface Meisei {
  nenchu: Chu;   // 年柱
  getchu: Chu;   // 月柱
  nitchu: Chu;   // 日柱
  nenkanIndex: number;
  nishiIndex: number;
  nichikanIndex: number;
  nichishiIndex: number;
}

// ユリウス通日を計算
function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// 年柱計算
// 算命学の年は立春（2月節入り）で切り替わる
function calcNenchu(year: number, month: number, day: number): { chu: Chu; kanIndex: number } {
  let sanmeiYear = year;
  // 立春前（1月 or 2月の節入り前）は前年扱い
  if (month < 2 || (month === 2 && day < SETSU_DAYS[2])) {
    sanmeiYear = year - 1;
  }
  const kanIndex = ((sanmeiYear - 4) % 10 + 10) % 10;
  const shiIndex = ((sanmeiYear - 4) % 12 + 12) % 12;
  return {
    chu: { kan: JIKKAN[kanIndex], shi: JUNISHI[shiIndex] },
    kanIndex,
  };
}

// 月柱計算
// 月支は節入りで決まる（近似値で実装）
function calcGetchu(year: number, month: number, day: number, nenkanIndex: number): Chu {
  // 節入り前は前月扱い
  const setsuDay = SETSU_DAYS[month] ?? 6;
  let sanmeiMonth = month;
  if (day < setsuDay) {
    sanmeiMonth = month - 1;
    if (sanmeiMonth === 0) sanmeiMonth = 12;
  }

  // 月支: 1月=丑(0)、2月=寅(1)、...
  const shiIndex = (sanmeiMonth - 1) % 12;
  const moonShi = MONTH_SHI[shiIndex];

  // 月干: 年干から五虎遁で決める
  // 寅月(2月)の干 = MONTH_KAN_START[nenkanIndex]
  // 寅月が基準(月インデックス1)
  const startKan = MONTH_KAN_START[nenkanIndex];
  // 2月=寅月が月インデックス1なので、sanmeiMonthからのオフセット
  const monthOffset = (sanmeiMonth - 2 + 12) % 12;
  const kanIndex = (startKan + monthOffset) % 10;

  return { kan: JIKKAN[kanIndex], shi: moonShi };
}

// 日柱計算
// 基準: 2000年1月1日 = JD 2451545
// 2000年1月1日の日干支を調べると「戊午」
// 戊=4, 午=6 → 六十干支インデックス = ?
// 干支インデックスnは n%10=4(戊), n%12=6(午) → n=54
function calcNitchu(year: number, month: number, day: number): { chu: Chu; kanIndex: number; shiIndex: number } {
  const jd = toJulianDay(year, month, day);
  const BASE_JD = 2451545; // 2000年1月1日
  const BASE_KAN = 4; // 戊
  const BASE_SHI = 6; // 午

  const diff = jd - BASE_JD;
  const kanIndex = ((BASE_KAN + diff) % 10 + 10) % 10;
  const shiIndex = ((BASE_SHI + diff) % 12 + 12) % 12;

  return {
    chu: { kan: JIKKAN[kanIndex], shi: JUNISHI[shiIndex] },
    kanIndex,
    shiIndex,
  };
}

// 命式（陰占）を計算
export function calcMeisei(year: number, month: number, day: number): Meisei {
  const { chu: nenchu, kanIndex: nenkanIndex } = calcNenchu(year, month, day);
  const getchu = calcGetchu(year, month, day, nenkanIndex);
  const { chu: nitchu, kanIndex: nichikanIndex, shiIndex: nichishiIndex } = calcNitchu(year, month, day);
  const nishiIndex = JUNISHI.indexOf(nenchu.shi as typeof JUNISHI[number]);

  return {
    nenchu,
    getchu,
    nitchu,
    nenkanIndex,
    nishiIndex,
    nichikanIndex,
    nichishiIndex,
  };
}

// 五行を取得
export function getGogyoKan(kan: string): string {
  return GOGYO[kan as keyof typeof GOGYO] ?? '';
}

export function getGogyoShi(shi: string): string {
  return GOGYO_SHI[shi as keyof typeof GOGYO_SHI] ?? '';
}

// 陰陽を取得
export function getInyo(kan: string): string {
  return INYO_KAN[kan as keyof typeof INYO_KAN] ?? '';
}

// 蔵干を取得（地支に蔵される天干）
export function getZokkan(shi: string): string[] {
  return ZOKKAN[shi] ?? [];
}
