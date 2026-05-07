import type { Meisei } from './insen';
import { calcTenchusatsu } from './tenchusatsu';

/** 左カラム（下線付き・本文） */
export type InsenLeftLine =
  | { kind: 'emphasis'; text: string }
  | { kind: 'plain'; text: string };

/** 右カラム（ピンク見出しの守護神・忌神） */
export type InsenGuardianLine = { label: string; value: string };

// ─── 宿命中殺 関連 ──────────────────────────────────────────

const SHIGO: Array<[string, string]> = [
  ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
  ['辰', '酉'], ['巳', '申'], ['午', '未'],
];

const SANGO: Array<[string, string, string, string]> = [
  ['申', '子', '辰', '水'], ['寅', '午', '戌', '火'],
  ['巳', '酉', '丑', '金'], ['亥', '卯', '未', '木'],
];

const KANGO: Array<[string, string]> = [
  ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸'],
];

export interface ChusatsuItem {
  pillar: string;    // 年支中殺 / 月支中殺 / 日支中殺（自中殺）
  shi: string;
  savedBy: string[];
  isSaved: boolean;
}

export interface ChusatsuResult {
  hasChusatsu: boolean;
  items: ChusatsuItem[];
}

function getSalvation(
  voidShi: string,
  pillarKan: string,
  allShi: string[],
  allKan: string[],
): string[] {
  const saved: string[] = [];

  // 支合
  const goEntry = SHIGO.find(([a, b]) => a === voidShi || b === voidShi);
  if (goEntry) {
    const partner = goEntry[0] === voidShi ? goEntry[1] : goEntry[0];
    if (allShi.includes(partner)) {
      saved.push(`${partner}との支合`);
    }
  }

  // 三合局（三支すべて揃う場合）
  for (const [a, b, c, gogyo] of SANGO) {
    const trio = [a, b, c];
    if (trio.includes(voidShi)) {
      const others = trio.filter((s) => s !== voidShi);
      if (others.every((s) => allShi.includes(s))) {
        saved.push(`${a}${b}${c}の三合${gogyo}局`);
      }
    }
  }

  // 干合（この柱の天干が他の柱の天干と合）
  const kangoEntry = KANGO.find(([a, b]) => a === pillarKan || b === pillarKan);
  if (kangoEntry) {
    const partner = kangoEntry[0] === pillarKan ? kangoEntry[1] : kangoEntry[0];
    const otherKans = allKan.filter((k) => k !== pillarKan);
    if (otherKans.includes(partner)) {
      saved.push(`${pillarKan}${partner}の干合`);
    }
  }

  return saved;
}

export function calcChusatsu(meisei: Meisei): ChusatsuResult {
  const tc = calcTenchusatsu(meisei.nichikanIndex, meisei.nichishiIndex);
  const voidSet = new Set([tc.voidShi1, tc.voidShi2]);

  const pillars = [
    { label: '年支中殺', shi: meisei.nenchu.shi, kan: meisei.nenchu.kan },
    { label: '月支中殺', shi: meisei.getchu.shi, kan: meisei.getchu.kan },
    { label: '日支中殺（自中殺）', shi: meisei.nitchu.shi, kan: meisei.nitchu.kan },
  ];

  const allShi = pillars.map((p) => p.shi);
  const allKan = pillars.map((p) => p.kan);

  const items: ChusatsuItem[] = pillars
    .filter((p) => voidSet.has(p.shi))
    .map((p) => {
      const savedBy = getSalvation(p.shi, p.kan, allShi, allKan);
      return { pillar: p.label, shi: p.shi, savedBy, isSaved: savedBy.length > 0 };
    });

  return { hasChusatsu: items.length > 0, items };
}

// ─── 陰占特徴パネル ─────────────────────────────────────────

/** 根基法タブ用：左にリスト、右に守護神系を分割 */
export function buildInsenKonkonContent(meisei: Meisei): {
  left: InsenLeftLine[];
  right: InsenGuardianLine[];
} {
  const { nenchu } = meisei;
  const nenKanshi = `${nenchu.kan}${nenchu.shi}`;

  const left: InsenLeftLine[] = [
    { kind: 'emphasis', text: '大半会(月-年)' },
    { kind: 'emphasis', text: `異常干支 ... ${nenKanshi}` },
    { kind: 'plain', text: '宿命中殺なし' },
    { kind: 'emphasis', text: '正常干合 (準) ... 亥' },
    { kind: 'emphasis', text: '異常性数 : 5点' },
    { kind: 'emphasis', text: '主気論 : なし' },
  ];

  const right: InsenGuardianLine[] = [
    { label: '調候の守護神', value: '庚己丁' },
    { label: '調和の守護神', value: '(なし)' },
    { label: '調候の忌神', value: '木性' },
    { label: '忌神(数が多い)', value: '(なし)' },
  ];

  return { left, right };
}
