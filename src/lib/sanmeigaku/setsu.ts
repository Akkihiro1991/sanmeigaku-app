// 節入り日の計算（太陽黄経から算出、日本時間）
// Meeus の簡易式で精度は十数分程度。

const RAD = Math.PI / 180;
const JST_OFFSET_DAYS = 9 / 24;

// 暦の月ごとの節（小寒=285°, 立春=315°, 啓蟄=345°, 清明=15°, ...）
function setsuLongitude(month: number): number {
  return (285 + 30 * (month - 1)) % 360;
}

// グレゴリオ暦日付（UT 0時）のユリウス日
function julianDayUT(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn - 0.5;
}

// 太陽の視黄経（度）
function sunLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = (357.52911 + 35999.05029 * t - 0.0001537 * t * t) * RAD;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m);
  const omega = (125.04 - 1934.136 * t) * RAD;
  const lambda = l0 + c - 0.00569 - 0.00478 * Math.sin(omega);
  return ((lambda % 360) + 360) % 360;
}

// target 度を越えたか（-180〜180 に正規化した差で判定）
function passed(longitude: number, target: number): boolean {
  const diff = ((longitude - target + 540) % 360) - 180;
  return diff >= 0;
}

const cache = new Map<string, number>();

/** その年・月の節入り日（日本時間の日にち）を返す */
export function getSetsuDay(year: number, month: number): number {
  const key = `${year}-${month}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const target = setsuLongitude(month);
  let result = 6;
  for (let d = 1; d <= 15; d++) {
    // 日本時間 d日 24:00 の時点で節を越えていれば、その日が節入り
    const jdEndOfDayJst = julianDayUT(year, month, d) + 1 - JST_OFFSET_DAYS;
    if (passed(sunLongitude(jdEndOfDayJst), target)) {
      result = d;
      break;
    }
  }
  cache.set(key, result);
  return result;
}

/** 生年月日が属する算命学上の月の節入り日から数えた日数（節入り日＝1日目） */
export function getDaysFromSetsu(year: number, month: number, day: number): number {
  const setsu = getSetsuDay(year, month);
  if (day >= setsu) return day - setsu + 1;

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevSetsu = getSetsuDay(prevYear, prevMonth);
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
  return daysInPrevMonth - prevSetsu + 1 + day;
}
