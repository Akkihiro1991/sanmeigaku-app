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
    <div className="space-y-2.5 text-sm text-washi leading-loose">
      {lines.map((line, i) =>
        line.kind === 'emphasis' ? (
          <p key={i} className="font-serif text-kin-soft border-b border-dotted border-kin/30 pb-1 pt-2 w-full">
            {line.text}
          </p>
        ) : (
          <p key={i} className="text-washi/85">{line.text}</p>
        )
      )}
    </div>
  );
}

const CATEGORY_CONFIG = [
  { key: 'work',      label: '仕事',     mark: '壱' },
  { key: 'relations', label: '人間関係', mark: '弐' },
  { key: 'romance',   label: '恋愛',     mark: '参' },
  { key: 'family',    label: '家庭',     mark: '肆' },
] as const;

export default function YosenRightPanel({ yosen }: Props) {
  const tokuchoLines = buildYosenTokuchoLines(yosen);
  const personDesc = buildPersonDescription(yosen);
  const categories = buildPersonCategories(yosen);

  return (
    <div className="card-wafu p-5 sm:p-8 min-w-0 flex-1">
      <h2 className="heading-wafu mb-6">陽占特徴</h2>

      {/* どんな人？（総合） */}
      {personDesc && (
        <div className="mb-6 rounded-xl border border-kin/30 bg-ai-950/50 px-4 sm:px-6 py-5">
          <p className="font-serif text-sm text-kin tracking-[0.3em] mb-3">どんな人？</p>
          <p className="text-sm text-washi leading-loose whitespace-pre-line">{personDesc}</p>
        </div>
      )}

      {/* カテゴリー別 */}
      {categories && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORY_CONFIG.map(({ key, label, mark }) => {
            const cat = categories[key];
            return (
              <div key={key} className="rounded-xl border border-kin/20 bg-ai-800/40 px-4 py-4">
                <p className="flex items-center gap-2 font-serif text-sm font-bold text-washi tracking-widest mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-kin/50 text-kin text-[11px]">{mark}</span>
                  {label}
                </p>
                <p className="text-[13px] text-washi/85 leading-relaxed mb-3">{cat.desc}</p>
                <div className="flex items-start gap-2 border-t border-kin/15 pt-2">
                  <span className="font-serif text-xs font-bold text-kin shrink-0 mt-0.5">吉</span>
                  <p className="text-xs text-kin-soft leading-relaxed">{cat.good}</p>
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
