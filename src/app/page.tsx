'use client';

import { useState } from 'react';
import InsenTable from '@/components/Insen/InsenTable';
import YosenChart from '@/components/Yosen/YosenChart';
import YosenRightPanel from '@/components/Yosen/YosenRightPanel';
import { calcMeisei } from '@/lib/sanmeigaku/insen';
import { calcYosen } from '@/lib/sanmeigaku/yosen';
import type { Meisei } from '@/lib/sanmeigaku/insen';
import type { Yosen } from '@/lib/sanmeigaku/yosen';

export default function Home() {
  const [birthdate, setBirthdate] = useState('');
  const [parsedDate, setParsedDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [meisei, setMeisei] = useState<Meisei | null>(null);
  const [yosen, setYosen] = useState<Yosen | null>(null);
  const [error, setError] = useState('');

  const handleCalc = () => {
    if (!birthdate) {
      setError('生年月日を入力してください');
      return;
    }
    setError('');
    const [year, month, day] = birthdate.split('-').map(Number);
    if (!year || !month || !day) {
      setError('正しい日付を入力してください');
      return;
    }
    const m = calcMeisei(year, month, day);
    const y = calcYosen(m);
    setParsedDate({ year, month, day });
    setMeisei(m);
    setYosen(y);
  };

  return (
    <main className="bg-wafu min-h-screen flex flex-col items-center py-12 sm:py-16 px-4 pb-20">
      {/* ヘッダー */}
      <header className="mb-10 text-center fade-up">
        <p className="text-[10px] sm:text-xs tracking-[0.5em] text-kin/80 mb-3">SANMEIGAKU</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-washi tracking-[0.2em]">
          算命学 命式鑑定
        </h1>
        <div className="mx-auto mt-4 mb-3 flex items-center justify-center gap-2 text-kin">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-kin/70" />
          <span className="text-xs">◆</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-kin/70" />
        </div>
        <p className="text-sm text-washi-dim tracking-wider">生まれた日に宿る、あなたの星を読み解く</p>
      </header>

      {/* 入力フォーム */}
      <div className="card-wafu p-5 sm:p-7 w-full max-w-xl mb-10 fade-up">
        <label className="block font-serif text-sm text-kin-soft mb-2 tracking-widest">生年月日</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full bg-ai-950/70 border border-kin/30 text-washi rounded-lg px-4 py-3 text-base focus:outline-none focus:border-kin focus:ring-1 focus:ring-kin/60 transition"
        />
        {error && <p className="text-shu text-xs mt-2">{error}</p>}
        <button
          onClick={handleCalc}
          className="mt-4 w-full rounded-lg py-3 font-serif text-base font-bold tracking-[0.3em] text-ai-950 bg-gradient-to-r from-kin via-kin-soft to-kin shadow-[0_4px_20px_rgba(201,169,110,0.25)] hover:brightness-110 active:scale-[0.99] transition"
        >
          命式を算出する
        </button>
      </div>

      {/* 結果表示 */}
      {meisei && yosen && parsedDate && (
        <div key={`${parsedDate.year}-${parsedDate.month}-${parsedDate.day}`} className="flex flex-col gap-6 sm:gap-8 w-full max-w-5xl fade-up">
          <p className="text-center font-serif text-washi-dim tracking-widest text-sm">
            {parsedDate.year}年{parsedDate.month}月{parsedDate.day}日 生まれ
          </p>

          {/* 陰占 + 陽占 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            <InsenTable meisei={meisei} />
            <YosenChart yosen={yosen} />
          </section>

          {/* 陽占特徴 */}
          <section className="w-full">
            <YosenRightPanel yosen={yosen} />
          </section>
        </div>
      )}
    </main>
  );
}
