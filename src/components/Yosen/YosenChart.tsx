'use client';

import { Yosen, SeiBag } from '@/lib/sanmeigaku/yosen';

interface Props {
  yosen: Yosen;
}

type SeiBagKey = { [K in keyof Yosen]: Yosen[K] extends SeiBag ? K : never }[keyof Yosen];
type StarCell = { kind: 'star'; key: SeiBagKey; circle?: string };
type CornerCell = { kind: 'corner'; junisei: string };
type EmptyCell = { kind: 'empty' };
type Cell = EmptyCell | StarCell | CornerCell;

export default function YosenChart({ yosen }: Props) {
  const oku = yosen.oku;

  // グリッド：コーナーは各々の固有従星を使用
  // 右上(北東)=日干/年支, 右下(南東)=中央干/日支, 左下(南西)=月干/月支
  const GRID: Cell[][] = [
    [
      { kind: 'empty' },
      { kind: 'star', key: 'kita', circle: '①' },
      { kind: 'corner', junisei: yosen.kitahigashi.junisei },
    ],
    [
      { kind: 'star', key: 'nishi', circle: '④' },
      { kind: 'star', key: 'chuo', circle: '②' },
      { kind: 'star', key: 'higashi', circle: '③' },
    ],
    [
      { kind: 'corner', junisei: yosen.minamishi.junisei },
      { kind: 'star', key: 'minami', circle: '④' },
      { kind: 'corner', junisei: yosen.minamihigashi.junisei },
    ],
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full min-w-0 max-w-md">
      <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-widest">陽 占</h2>

      <div className="grid grid-cols-3 gap-1 mb-2">
        {GRID.map((row, ri) =>
          row.map((cell, ci) => {
            if (cell.kind === 'empty') {
              return (
                <div
                  key={`e-${ri}-${ci}`}
                  className="border border-dashed border-gray-100 rounded min-h-[64px] bg-gray-50/50"
                />
              );
            }

            if (cell.kind === 'corner') {
              return (
                <div
                  key={`c-${ri}-${ci}`}
                  className="border border-gray-100 rounded min-h-[64px] flex items-center justify-center bg-gray-50/30"
                >
                  <span className="text-[11px] text-gray-500">{cell.junisei}</span>
                </div>
              );
            }

            // StarCell
            const data = yosen[cell.key];
            const isCenter = cell.key === 'chuo';
            return (
              <div
                key={cell.key}
                className={`
                  border rounded p-1.5 flex flex-col items-center text-center min-h-[64px] justify-center
                  ${isCenter ? 'border-gray-700 bg-gray-50' : 'border-gray-200 bg-white'}
                `}
              >
                <span className="text-[13px] font-bold text-gray-800 leading-tight inline-flex items-baseline gap-0.5 flex-wrap justify-center">
                  <span>{data.sei}</span>
                  {cell.circle && (
                    <span className="text-[10px] font-normal text-gray-500 align-super">{cell.circle}</span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="border border-gray-200 rounded p-2 flex flex-col items-center bg-gray-50">
        <span className="text-[9px] text-gray-400 mb-0.5">奥（精神）</span>
        <span className="text-[13px] font-bold text-gray-800">{oku.sei}</span>
        <span className="text-[9px] text-gray-500">{oku.junisei}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-400">
        {[
          { label: '北', rel: '父・目上' },
          { label: '南', rel: '子・目下' },
          { label: '東', rel: '兄弟・同僚' },
          { label: '西', rel: '配偶者' },
          { label: '中', rel: '自分' },
          { label: '奥', rel: '精神' },
        ].map(({ label, rel }) => (
          <div key={label} className="flex gap-1">
            <span className="text-gray-500 font-medium">{label}:</span>
            <span>{rel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
