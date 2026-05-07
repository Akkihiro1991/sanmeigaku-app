'use client';

import { useState } from 'react';
import type { ReadingResponse } from '@/app/api/reading/route';

interface Props {
  year: number;
  month: number;
  day: number;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

export default function ReadingPanel({ year, month, day }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calendarDays = buildCalendarDays(viewYear, viewMonth);
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();

  const prevMonth = () => {
    const d = viewMonth === 1 ? { y: viewYear - 1, m: 12 } : { y: viewYear, m: viewMonth - 1 };
    setViewYear(d.y); setViewMonth(d.m); setSelectedDay(null); setReading(null);
  };
  const nextMonth = () => {
    const d = viewMonth === 12 ? { y: viewYear + 1, m: 1 } : { y: viewYear, m: viewMonth + 1 };
    setViewYear(d.y); setViewMonth(d.m); setSelectedDay(null); setReading(null);
  };

  const handleFetch = async () => {
    if (!selectedDay) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day,
          targetYear: viewYear,
          targetMonth: viewMonth,
          targetDay: selectedDay,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? res.statusText);
      }
      setReading(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : '鑑定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const isToday = (d: number) =>
    d === today.getDate() &&
    viewMonth === today.getMonth() + 1 &&
    viewYear === today.getFullYear();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
      <h2 className="text-sm font-bold text-gray-500 mb-4 tracking-widest">簡 単 鑑 定</h2>

      {/* カレンダー */}
      <div className="mb-4 border border-gray-100 rounded-lg p-3">
        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-gray-700">{viewYear}年 {viewMonth}月</span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
          >
            ›
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`text-center text-[11px] font-medium py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日グリッド */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {calendarDays.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            const dow = (firstDow + d - 1) % 7;
            const selected = d === selectedDay;
            const todayFlag = isToday(d);

            let cls = 'text-xs py-1.5 rounded text-center transition-colors cursor-pointer ';
            if (selected) {
              cls += 'bg-indigo-600 text-white font-bold';
            } else if (todayFlag) {
              cls += 'bg-indigo-100 text-indigo-700 font-bold';
            } else if (dow === 0) {
              cls += 'text-red-400 hover:bg-red-50';
            } else if (dow === 6) {
              cls += 'text-blue-400 hover:bg-blue-50';
            } else {
              cls += 'text-gray-700 hover:bg-gray-100';
            }

            return (
              <button
                key={d}
                onClick={() => { setSelectedDay(d); setReading(null); }}
                className={cls}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択日 & 鑑定ボタン */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-xs text-gray-500">
          {selectedDay
            ? `${viewYear}年${viewMonth}月${selectedDay}日 を選択`
            : '日付をクリックしてください'}
        </span>
        <button
          onClick={handleFetch}
          disabled={!selectedDay || loading}
          className="shrink-0 px-4 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          {loading ? '鑑定中…' : '鑑定する'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
          <span className="animate-spin">◌</span>
          鑑定中…
        </div>
      )}

      {reading && (
        <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
          {/* 十大主星 */}
          <div className="border-l-4 border-indigo-400 pl-3">
            <div className="text-[11px] text-gray-400 mb-0.5">十大主星</div>
            <div className="font-bold text-indigo-700 text-base">{reading.shusei.target}</div>
            <div className="text-gray-600 text-xs mt-0.5">{reading.shusei.meaning}</div>
          </div>

          {/* 十二大従星 */}
          <div className="border-l-4 border-amber-400 pl-3">
            <div className="text-[11px] text-gray-400 mb-0.5">
              十二大従星
              <span className="ml-2 text-amber-600 font-medium">
                エネルギー {reading.junisei.energy}/10
              </span>
            </div>
            <div className="font-bold text-amber-700 text-base">{reading.junisei.target}</div>
            <div className="text-gray-600 text-xs mt-0.5">{reading.junisei.meaning}</div>
          </div>

          {/* 守護神 */}
          <div className="border-l-4 border-emerald-400 pl-3">
            <div className="text-[11px] text-gray-400 mb-0.5">守護神</div>
            <div className="text-gray-700 text-xs">{reading.guardian_deity}</div>
          </div>

          {/* 運気の周り方 */}
          <div className="border-l-4 border-violet-400 pl-3">
            <div className="text-[11px] text-gray-400 mb-0.5">{reading.target_date} の運気</div>
            <div className="text-gray-700 text-xs leading-relaxed">{reading.daily_energy}</div>
          </div>

          {/* アドバイス */}
          <div className="border-l-4 border-rose-400 pl-3">
            <div className="text-[11px] text-gray-400 mb-0.5">アドバイス</div>
            <div className="text-gray-700 text-xs leading-relaxed">{reading.daily_advice}</div>
          </div>

          {/* 画像プロンプト */}
          <div className="bg-gray-50 rounded p-2">
            <div className="text-[10px] text-gray-400 mb-1">宿命イメージ（画像生成プロンプト）</div>
            <div className="text-[11px] text-gray-500 italic leading-relaxed">
              {reading.visual_prompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
