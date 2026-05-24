'use client';

import { Meisei, getGogyoKan, getGogyoShi, getInyo, getZokkan } from '@/lib/sanmeigaku/insen';
import { KANSHI_RELATION, JUSSEI, JUNISHI, ZOKKAN } from '@/lib/sanmeigaku/constants';
import { JUNISEI_TABLE } from '@/lib/sanmeigaku/yosen';
import { calcTenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';

interface Props {
  meisei: Meisei;
}

function getShusei(nichikan: string, targetKan: string): string {
  const index = KANSHI_RELATION[nichikan]?.[targetKan] ?? 0;
  return JUSSEI[index];
}

function getChiShusei(nichikan: string, shi: string): string {
  const zk = ZOKKAN[shi];
  if (!zk || zk.length === 0) return '─';
  return getShusei(nichikan, zk[0]);
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full min-w-0 max-w-md">
      <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-widest">陰 占</h2>

      {/* 命式グリッド */}
      <div className="flex items-start justify-center gap-1 mb-4">
        {/* 左ラベル（天中殺空亡支） */}
        <span
          className="text-[10px] text-rose-300 tracking-widest pt-8 select-none shrink-0"
          style={{ writingMode: 'vertical-rl' }}
        >
          {tc.voidShi1}{tc.voidShi2}
        </span>

        <div className="grid grid-cols-3 gap-2 flex-1 max-w-[240px]">
          {cols.map((col) => {
            const kanShusei = col.isNichi ? '─' : getShusei(nichikan, col.kan);
            const chiShusei = getChiShusei(nichikan, col.shi);
            const junisei   = getJunisei(nichikan, col.shi);
            const cs = col.isChusatsu;

            return (
              <div key={col.label} className="flex flex-col items-center gap-0.5">
                <span className={`text-[10px] font-medium ${cs ? 'text-rose-500' : 'text-gray-400'}`}>
                  {col.label}
                </span>

                {/* 天干主星 */}
                <span className="text-[11px] text-indigo-500 font-medium h-4 leading-none">
                  {kanShusei}
                </span>

                {/* 天干 */}
                <div className={`w-12 h-12 border flex flex-col items-center justify-center rounded ${cs ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}>
                  <span className={`text-xl font-bold ${cs ? 'text-rose-700' : 'text-gray-800'}`}>{col.kan}</span>
                  <span className={`text-[10px] ${cs ? 'text-rose-400' : 'text-gray-400'}`}>{getGogyoKan(col.kan)}</span>
                </div>

                {/* 地支 */}
                <div className={`w-12 h-12 border flex flex-col items-center justify-center rounded ${cs ? 'border-rose-500 bg-rose-100' : 'border-gray-300'}`}>
                  <span className={`text-xl font-bold ${cs ? 'text-rose-700' : 'text-gray-600'}`}>{col.shi}</span>
                  <span className={`text-[10px] ${cs ? 'text-rose-400' : 'text-gray-400'}`}>{getGogyoShi(col.shi)}</span>
                </div>

                {/* 地支主星 */}
                <span className="text-[11px] text-rose-500 font-medium h-4 leading-none">
                  {chiShusei}
                </span>

                {/* 十二大従星 */}
                <span className="text-[11px] text-amber-600 font-medium h-4 leading-none">
                  {junisei}
                </span>

                {/* 蔵干 */}
                <div className="text-[9px] text-gray-400 text-center leading-tight mt-0.5">
                  {getZokkan(col.shi).join(' ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* 右ラベル（天中殺名） */}
        <span
          className="text-[10px] text-rose-300 tracking-widest pt-8 select-none shrink-0"
          style={{ writingMode: 'vertical-rl' }}
        >
          {tc.name.replace('天中殺', '')}
        </span>
      </div>

      {/* 凡例 */}
      <div className="flex gap-3 text-[10px] mb-3 justify-center">
        <span className="text-indigo-500">■ 天干主星</span>
        <span className="text-rose-500">■ 地支主星</span>
        <span className="text-amber-600">■ 十二従星</span>
      </div>

      {/* 基本情報 */}
      <div className="border-t border-gray-100 pt-3 text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">日干</span>
          <span>{nitchu.kan}（{getGogyoKan(nitchu.kan)}・{getInyo(nitchu.kan)}）</span>
        </div>
      </div>
    </div>
  );
}
