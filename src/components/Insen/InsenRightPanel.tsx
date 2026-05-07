'use client';

import type { Meisei } from '@/lib/sanmeigaku/insen';
import { buildInsenKonkonContent } from '@/lib/sanmeigaku/insenDisplay';

interface Props {
  meisei: Meisei;
}

export default function InsenRightPanel({ meisei }: Props) {
  const { left, right } = buildInsenKonkonContent(meisei);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0 flex-1">
      <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-widest">陰 占 特 徴</h2>

      <div className="flex flex-col sm:flex-row gap-4 text-sm">
        {/* 左: 特徴リスト */}
        <div className="space-y-2 text-gray-800 leading-relaxed flex-1 min-w-0">
          {left.map((line, i) =>
            line.kind === 'emphasis' ? (
              <p
                key={i}
                className="border-b border-dotted border-gray-300 pb-1 w-full max-w-[280px]"
              >
                {line.text}
              </p>
            ) : (
              <p key={i} className="text-gray-600">
                {line.text}
              </p>
            )
          )}
        </div>

        {/* 右: 守護神・忌神 */}
        <div className="shrink-0 sm:min-w-[160px]">
          <p className="text-[11px] text-gray-400 mb-2 font-medium tracking-wide">守護神 / 忌神</p>
          <div className="space-y-2">
            {right.map((g, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] text-gray-400">{g.label}</span>
                <span className="text-sm text-pink-600 font-medium">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
