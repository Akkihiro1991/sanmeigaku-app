'use client';

import type { Yosen } from '@/lib/sanmeigaku/yosen';
import {
  buildYosenTokuchoLines,
  buildPersonDescription,
  buildPersonCategories,
  type YosenLine,
} from '@/lib/sanmeigaku/yosenDisplay';

interface Props {
  yosen: Yosen;
}

function TokuchoBody({ lines }: { lines: YosenLine[] }) {
  return (
    <div className="space-y-2 text-sm text-gray-800 leading-relaxed">
      {lines.map((line, i) =>
        line.kind === 'emphasis' ? (
          <p key={i} className="border-b border-dotted border-gray-300 pb-1 w-full max-w-[320px]">
            {line.text}
          </p>
        ) : (
          <p key={i} className="text-gray-600">{line.text}</p>
        )
      )}
    </div>
  );
}

const CATEGORY_CONFIG = [
  { key: 'work',      label: '仕事',     color: 'border-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  { key: 'relations', label: '人間関係', color: 'border-green-400',  bg: 'bg-green-50',  text: 'text-green-700' },
  { key: 'romance',   label: '恋愛',     color: 'border-pink-400',   bg: 'bg-pink-50',   text: 'text-pink-700' },
  { key: 'family',    label: '家庭',     color: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
] as const;

export default function YosenRightPanel({ yosen }: Props) {
  const tokuchoLines = buildYosenTokuchoLines(yosen);
  const personDesc = buildPersonDescription(yosen);
  const categories = buildPersonCategories(yosen);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-0 flex-1">
      <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-widest">陽 占 特 徴</h2>

      {/* どんな人？（総合） */}
      {personDesc && (
        <div className="mb-4 bg-indigo-50 rounded-lg px-3 py-2.5">
          <p className="text-[11px] text-indigo-400 font-medium mb-1">どんな人？</p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{personDesc}</p>
        </div>
      )}

      {/* カテゴリー別 */}
      {categories && (
        <div className="mb-4 space-y-3">
          {CATEGORY_CONFIG.map(({ key, label, color, bg, text }) => {
            const cat = categories[key];
            return (
              <div key={key} className={`border-l-4 ${color} ${bg} rounded-r-lg px-3 py-2.5`}>
                <p className={`text-[11px] font-bold ${text} mb-1`}>{label}</p>
                <p className="text-xs text-gray-700 leading-relaxed mb-1.5">{cat.desc}</p>
                <div className="flex items-start gap-1">
                  <span className={`text-[10px] font-bold ${text} shrink-0 mt-0.5`}>◎ 吉</span>
                  <p className={`text-[11px] ${text} leading-relaxed`}>{cat.good}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TokuchoBody lines={tokuchoLines} />
    </div>
  );
}
