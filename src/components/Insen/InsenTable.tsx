'use client';

import { Meisei, getGogyoKan, getGogyoShi, getInyo, getZokkan, getZokkan28 } from '@/lib/sanmeigaku/insen';
import { KANSHI_RELATION, JUSSEI, JUNISHI } from '@/lib/sanmeigaku/constants';
import { JUNISEI_TABLE } from '@/lib/sanmeigaku/yosen';
import { calcTenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';

interface Props {
  meisei: Meisei;
}

/* true: 日柱と主星のみ表示（計算は全柱ぶん行う） */
const SIMPLE_VIEW = true;

function getShusei(nichikan: string, targetKan: string): string {
  const index = KANSHI_RELATION[nichikan]?.[targetKan] ?? 0;
  return JUSSEI[index];
}

// 地支の主星：二十八元で選んだ蔵干から算出（陽占の東・中央・西と同じ）
function getChiShusei(nichikan: string, shi: string, daysFromSetsu: number): string {
  const kan = getZokkan28(shi, daysFromSetsu);
  if (!kan) return '─';
  return getShusei(nichikan, kan);
}

function getJunisei(nichikan: string, shi: string): string {
  const shiIndex = JUNISHI.indexOf(shi as typeof JUNISHI[number]);
  if (shiIndex === -1) return '─';
  return JUNISEI_TABLE[nichikan]?.[shiIndex] ?? '─';
}

export default function InsenTable({ meisei }: Props) {
  const { nenchu, getchu, nitchu, nichikanIndex, nichishiIndex } = meisei;
  const nichikan = nitchu.kan;

  const tc = calcTenchusatsu(nichikanIndex, nichishiIndex);

  const voidSet = new Set([tc.voidShi1, tc.voidShi2]);

  /* 左から 日柱・月柱・年柱 */
  const cols = [
    { label: '日柱', kan: nitchu.kan, shi: nitchu.shi, isNichi: true },
    { label: '月柱', kan: getchu.kan, shi: getchu.shi, isNichi: false },
    { label: '年柱', kan: nenchu.kan, shi: nenchu.shi, isNichi: false },
  ].map((col) => ({ ...col, isChusatsu: voidSet.has(col.shi) }));
  const visibleCols = SIMPLE_VIEW ? cols.filter((col) => col.isNichi) : cols;

  return (
    <div className="card-wafu p-5 sm:p-6 w-full min-w-0 flex flex-col">
      <h2 className="heading-wafu mb-5">陰占</h2>

      {/* 命式グリッド */}
      <div className="flex items-start justify-center gap-3 mb-5 flex-1">
        {/* 左ラベル（天中殺空亡支） */}
        <span
          className="text-[11px] text-shu/70 tracking-widest pt-9 select-none shrink-0 font-serif"
          style={{ writingMode: 'vertical-rl' }}
        >
          {tc.voidShi1}{tc.voidShi2}
        </span>

        <div className={`grid gap-3 ${SIMPLE_VIEW ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {visibleCols.map((col) => {
            const kanShusei = col.isNichi ? '' : getShusei(nichikan, col.kan);
            const chiShusei = getChiShusei(nichikan, col.shi, meisei.daysFromSetsu);
            const junisei   = getJunisei(nichikan, col.shi);
            const cs = col.isChusatsu;
            const box = `w-16 h-16 sm:w-[72px] sm:h-[72px] border flex flex-col items-center justify-center rounded-lg ${
              cs ? 'border-shu/70 bg-shu/10' : 'border-kin/40 bg-ai-950/60'
            }`;

            return (
              <div key={col.label} className="flex flex-col items-center gap-1.5">
                <span className={`font-serif text-xs tracking-widest ${cs ? 'text-shu' : 'text-washi-dim'}`}>
                  {col.label}
                </span>

                {/* 天干主星 */}
                {!SIMPLE_VIEW && (
                  <span className="text-xs text-kin-soft h-4 leading-none">{kanShusei || '─'}</span>
                )}

                {/* 天干 */}
                <div className={box}>
                  <span className="font-serif text-3xl font-bold text-washi leading-none">{col.kan}</span>
                  <span className="text-[10px] text-washi-dim mt-1">{getGogyoKan(col.kan)}</span>
                </div>

                {/* 地支 */}
                <div className={box}>
                  <span className="font-serif text-3xl font-bold text-washi leading-none">{col.shi}</span>
                  <span className="text-[10px] text-washi-dim mt-1">{getGogyoShi(col.shi)}</span>
                </div>

                {/* 地支主星 */}
                <span className="mt-1 font-serif text-base font-bold text-kin tracking-wider">
                  {chiShusei}
                </span>

                {/* 十二大従星 */}
                {!SIMPLE_VIEW && (
                  <span className="text-xs text-washi-dim h-4 leading-none">{junisei}</span>
                )}

                {/* 蔵干 */}
                {!SIMPLE_VIEW && (
                  <div className="text-[10px] text-washi-dim/70 text-center leading-tight">
                    {getZokkan(col.shi).join(' ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 右ラベル（天中殺名） */}
        <span
          className="text-[11px] text-shu/70 tracking-widest pt-9 select-none shrink-0 font-serif"
          style={{ writingMode: 'vertical-rl' }}
        >
          {tc.name.replace('天中殺', '')}
        </span>
      </div>

      {/* 基本情報 */}
      <div className="border-t border-kin/20 pt-3 text-sm flex justify-between">
        <span className="text-washi-dim font-serif tracking-widest">日干</span>
        <span className="text-washi">{nitchu.kan}（{getGogyoKan(nitchu.kan)}・{getInyo(nitchu.kan)}）</span>
      </div>
    </div>
  );
}
