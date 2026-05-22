import { JIKKAN, JUNISHI, JUSSEI, JUNISEI, KANSHI_RELATION, ZOKKAN, GOGYO } from './constants';
import type { Meisei } from './insen';

export interface SeiBag {
  sei: string;   // 主星
  junisei: string; // 従星
}

export interface Yosen {
  chuo: SeiBag;   // 中央（自分）
  kita: SeiBag;   // 北（父）
  minami: SeiBag; // 南（子）
  higashi: SeiBag; // 東（兄弟）
  nishi: SeiBag;  // 西（配偶者）
  kitahigashi: SeiBag; // 北東
  kitanishi: SeiBag;   // 北西
  minamihigashi: SeiBag; // 南東
  minamishi: SeiBag;    // 南西
  oku: SeiBag;    // 奥（精神）
  shinkyoPoints: number; // 三柱エネルギー合計点
  shinkyoBun: string;    // 最身強/身強/身中/身弱/最身弱
}

// 十二大従星のカテゴリ（弱星/中星/強星）
// 弱星: 天馳星(絶)・天極星(死)・天報星(胎)・天胡星(病)
// 中星: 天庫星(墓)・天印星(養)・天恍星(沐浴)・天堂星(衰)・天貴星(長生)
// 強星: 天南星(冠帯)・天禄星(臨官)・天将星(帝旺)
const JUSEI_CATEGORY: Record<string, 'weak' | 'middle' | 'strong'> = {
  天馳星: 'weak',
  天極星: 'weak',
  天報星: 'weak',
  天胡星: 'weak',
  天庫星: 'middle',
  天印星: 'middle',
  天恍星: 'middle',
  天堂星: 'middle',
  天貴星: 'middle',
  天南星: 'strong',
  天禄星: 'strong',
  天将星: 'strong',
};

function calcShinkyoBun(nen: string, get: string, ni: string): string {
  const cats = [nen, get, ni].map(s => JUSEI_CATEGORY[s] ?? 'weak');
  const strong = cats.filter(c => c === 'strong').length;
  const middle = cats.filter(c => c === 'middle').length;
  const weak   = cats.filter(c => c === 'weak').length;

  if (strong >= 2) return '最身強';
  if (strong >= 1) return '身強';
  if (weak === 3)  return '最身弱';
  if (middle === 1 && weak === 2) return '身弱';
  if (middle === 2 && weak === 1) {
    const stars = [nen, get, ni];
    const mid = stars.filter(s => JUSEI_CATEGORY[s] === 'middle');
    return (mid.includes('天印星') || mid.includes('天庫星')) ? '身弱' : '身中';
  }
  if (middle === 3) return '身中';
  return '最身弱';
}

// 従星（十二大従星）の計算テーブル
// 各干を基準に「長生→沐浴→冠帯→臨官→帝旺→衰→病→死→墓→絶→胎→養」の順で従星を定義
// 長生位置: 甲壬=亥, 丙戊=寅, 庚=巳, 乙癸=午(逆行), 丁己=酉(逆行), 辛=子(逆行)
// 十二大従星: 長生=天将星, 沐浴=天禄星, 冠帯=天堂星, 臨官=天胡星, 帝旺=天刃星
//             衰=天南星, 病=天貴星, 死=天馳星, 墓=天庫星, 絶=天極星, 胎=天報星, 養=天恍星
// 配列インデックスは地支の順（子=0,丑=1,...,亥=11）
export const JUNISEI_TABLE: Record<string, string[]> = {
  // 甲（長生=亥=11, 順行）
  甲: ['天恍星', '天南星', '天禄星', '天将星', '天堂星', '天胡星', '天極星', '天庫星', '天馳星', '天報星', '天印星', '天貴星'],
  // 壬（長生=申=8, 順行）
  壬: ['天将星', '天堂星', '天胡星', '天極星', '天庫星', '天馳星', '天報星', '天印星', '天貴星', '天恍星', '天南星', '天禄星'],
  // 丙・戊（長生=寅=2, 順行）
  丙: ['天報星', '天印星', '天貴星', '天恍星', '天南星', '天禄星', '天将星', '天堂星', '天胡星', '天極星', '天庫星', '天馳星'],
  戊: ['天報星', '天印星', '天貴星', '天恍星', '天南星', '天禄星', '天将星', '天堂星', '天胡星', '天極星', '天庫星', '天馳星'],
  // 庚（長生=巳=5, 順行）
  庚: ['天極星', '天庫星', '天馳星', '天報星', '天印星', '天貴星', '天恍星', '天南星', '天禄星', '天将星', '天堂星', '天胡星'],
  // 乙（長生=午=6, 逆行）
  乙: ['天胡星', '天堂星', '天将星', '天禄星', '天南星', '天恍星', '天貴星', '天印星', '天報星', '天馳星', '天庫星', '天極星'],
  // 癸（長生=卯=3, 逆行）
  癸: ['天禄星', '天南星', '天恍星', '天貴星', '天印星', '天報星', '天馳星', '天庫星', '天極星', '天胡星', '天堂星', '天将星'],
  // 丁・己（長生=酉=9, 逆行）
  丁: ['天馳星', '天庫星', '天極星', '天胡星', '天堂星', '天将星', '天禄星', '天南星', '天恍星', '天貴星', '天印星', '天報星'],
  己: ['天馳星', '天庫星', '天極星', '天胡星', '天堂星', '天将星', '天禄星', '天南星', '天恍星', '天貴星', '天印星', '天報星'],
  // 辛（長生=子=0, 逆行）
  辛: ['天貴星', '天印星', '天報星', '天馳星', '天庫星', '天極星', '天胡星', '天堂星', '天将星', '天禄星', '天南星', '天恍星'],
};

// 蔵干中気を取得（3蔵干ある地支のみindex[1]が中気、2つ以下は余気のため本気を使用）
function getChuki(zokkan: string[], fallback: string): string {
  if (zokkan.length >= 3) return zokkan[1] ?? zokkan[0] ?? fallback;
  return zokkan[0] ?? fallback;
}

// 人体星図の中央用: 日干と同じ五行（比肩）の蔵干を優先で返す（なければ先頭）
function getBijuKan(zokkan: string[], nichikan: string, fallback: string): string {
  const myGogyo = GOGYO[nichikan as keyof typeof GOGYO];
  const matched = zokkan.find(k => GOGYO[k as keyof typeof GOGYO] === myGogyo);
  return matched ?? zokkan[0] ?? fallback;
}

// 人体星図の東用: 比劫（日干と同じ五行）の蔵干を除いた最初の蔵干を返す
function getNonBijusei(zokkan: string[], nichikan: string, fallback: string): string {
  const myGogyo = GOGYO[nichikan as keyof typeof GOGYO];
  const filtered = zokkan.filter(k => GOGYO[k as keyof typeof GOGYO] !== myGogyo);
  return filtered[0] ?? zokkan[0] ?? fallback;
}

// 主星を計算（日干と対象干の関係から）
function calcShusei(nichikan: string, targetKan: string): string {
  const index = KANSHI_RELATION[nichikan]?.[targetKan] ?? 0;
  return JUSSEI[index];
}

// 従星を計算（宮の天干を基準に、宮の地支から算出）
// ※算命学では従星は「各宮の天干」を基準に計算する
function calcJunisei(basKan: string, targetShi: string): string {
  const shiIndex = JUNISHI.indexOf(targetShi as typeof JUNISHI[number]);
  if (shiIndex === -1) return '天極星';
  const table = JUNISEI_TABLE[basKan];
  if (!table) return '天極星';
  return table[shiIndex];
}

// 蔵干の主星を計算（地支の本気蔵干から）
function calcSeifromShi(nichikan: string, shi: string): string {
  const zokkan = ZOKKAN[shi];
  if (!zokkan || zokkan.length === 0) return JUSSEI[0];
  return calcShusei(nichikan, zokkan[0]);
}

// 陽占（人体星図）を計算
// 宮と柱・干支の対応（算命学標準）:
//   北=年干/年支, 南=月干/月支
//   中央=月支の蔵干本気/月支, 東=年支の蔵干本気/年支
//   西=日支の蔵干本気/日支, 奥=日干の陰陽反対/日支
//   北東〜南西 = 各蔵干の中気・余気
export function calcYosen(meisei: Meisei): Yosen {
  const { nitchu, nenchu, getchu, nichikanIndex } = meisei;
  const nichikan = nitchu.kan;
  const nichishi = nitchu.shi;
  const nenkan = nenchu.kan;
  const nenshi = nenchu.shi;
  const getkan = getchu.kan;
  const getshi = getchu.shi;

  const nenZokkan = ZOKKAN[nenshi] ?? [];
  const getZokkan = ZOKKAN[getshi] ?? [];
  const niZokkan  = ZOKKAN[nichishi] ?? [];

  // 北（目上・父）: 年干 / 年支
  const kita: SeiBag = {
    sei: calcShusei(nichikan, nenkan),
    junisei: calcJunisei(nenkan, nenshi),
  };

  // 南（目下・子）: 月干 / 月支
  const minami: SeiBag = {
    sei: calcShusei(nichikan, getkan),
    junisei: calcJunisei(getkan, getshi),
  };

  // 中央（自分）: 月支の蔵干から日干と同五行（比肩）を優先で選ぶ
  const chuoKan = getBijuKan(getZokkan, nichikan, getkan);
  const chuo: SeiBag = {
    sei: calcShusei(nichikan, chuoKan),
    junisei: calcJunisei(chuoKan, getshi),
  };

  // 東（兄弟・社会）: 年支の蔵干本気（比劫フィルタなし）
  const higashiKan = nenZokkan[0] ?? nenkan;
  const higashi: SeiBag = {
    sei: calcShusei(nichikan, higashiKan),
    junisei: calcJunisei(higashiKan, nenshi),
  };

  // 西（配偶者）: 日支の蔵干本気 / 日支
  const nishiKan = niZokkan[0] ?? nichikan;
  const nishi: SeiBag = {
    sei: calcShusei(nichikan, nishiKan),
    junisei: calcJunisei(nishiKan, nichishi),
  };

  // 北東（右上）: 年支の従星（日干ベース）= 三柱・年支の十二従星
  const kitahigashi: SeiBag = {
    sei: calcShusei(nichikan, nenZokkan[0] ?? nenkan),
    junisei: calcJunisei(nichikan, nenshi),
  };

  // 西（配偶者）: 日支の蔵干中気 / 日支（蔵干3つの場合のみindex[1]が中気）
  const kitanishiKan = getChuki(niZokkan, nichikan);
  const kitanishi: SeiBag = {
    sei: calcShusei(nichikan, kitanishiKan),
    junisei: calcJunisei(kitanishiKan, nichishi),
  };

  // 南東（右下）: 月支の従星（日干ベース）= 三柱・月支の十二従星
  const minamihigashi: SeiBag = {
    sei: calcShusei(nichikan, chuoKan),
    junisei: calcJunisei(nichikan, getshi),
  };

  // 南西（左下）: 日支の従星（日干ベース）= 三柱・日支の十二従星
  const minamishiKan = nenZokkan[0] ?? nenkan;
  const minamishi: SeiBag = {
    sei: calcShusei(nichikan, minamishiKan),
    junisei: calcJunisei(nichikan, nichishi),
  };

  // 奥（精神）: 日干の陰陽反転 / 日支
  const okuKanIndex = (nichikanIndex % 2 === 0) ? nichikanIndex + 1 : nichikanIndex - 1;
  const okuKan = JIKKAN[(okuKanIndex + 10) % 10];
  const oku: SeiBag = {
    sei: calcShusei(nichikan, okuKan),
    junisei: calcJunisei(okuKan, nichishi),
  };

  // 身強/身弱: 三柱（年支・月支・日支）の十二大従星カテゴリで判定
  const nenJunisei = calcJunisei(nichikan, nenshi);
  const getJunisei = calcJunisei(nichikan, getshi);
  const niJunisei  = calcJunisei(nichikan, nichishi);
  const shinkyoBun = calcShinkyoBun(nenJunisei, getJunisei, niJunisei);

  return { chuo, kita, minami, higashi, nishi, kitahigashi, kitanishi, minamihigashi, minamishi, oku, shinkyoPoints: 0, shinkyoBun };
}
