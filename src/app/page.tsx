'use client';

import { useState } from 'react';
import InsenTable from '@/components/Insen/InsenTable';
import InsenRightPanel from '@/components/Insen/InsenRightPanel';
import YosenChart from '@/components/Yosen/YosenChart';
import YosenRightPanel from '@/components/Yosen/YosenRightPanel';
import TaiUnTable from '@/components/TaiUn/TaiUnTable';
import { calcMeisei } from '@/lib/sanmeigaku/insen';
import { calcYosen } from '@/lib/sanmeigaku/yosen';
import { calcTaiUn } from '@/lib/sanmeigaku/taiun';
import type { Meisei } from '@/lib/sanmeigaku/insen';
import type { Yosen } from '@/lib/sanmeigaku/yosen';
import type { TaiUn } from '@/lib/sanmeigaku/taiun';

export default function Home() {
  const [birthdate, setBirthdate] = useState('');
  const [parsedDate, setParsedDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [meisei, setMeisei] = useState<Meisei | null>(null);
  const [yosen, setYosen] = useState<Yosen | null>(null);
  const [taiun, setTaiun] = useState<TaiUn | null>(null);
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
    const t = calcTaiUn(m, year, month, day);
    setParsedDate({ year, month, day });
    setMeisei(m);
    setYosen(y);
    setTaiun(t);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 pb-16">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">算命学 命式鑑定</h1>
        <p className="text-sm text-gray-500 mt-1">生年月日から陰占・陽占を算出します</p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 w-full max-w-2xl mb-6 shadow-sm">
        <label className="block text-sm text-gray-600 mb-1 font-medium">生年月日</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <button
          onClick={handleCalc}
          className="mt-3 w-full bg-gray-800 text-white rounded py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          命式を算出する
        </button>
      </div>

      {/* 結果表示 */}
      {meisei && yosen && taiun && parsedDate && (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
          {/* 陰占: 左グリッド + 右タブ */}
          <section className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
            <InsenTable meisei={meisei} />
            <InsenRightPanel meisei={meisei} />
          </section>
          {/* 陽占: 左星図 + 右タブ */}
          <section className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
            <YosenChart yosen={yosen} />
            <YosenRightPanel yosen={yosen} />
          </section>
          {/* 大運 */}
          <section className="w-full">
            <TaiUnTable taiun={taiun} />
          </section>

          {/* 鑑定CTA */}
          <section className="w-full">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white text-center shadow-lg">
              <p className="text-xs tracking-widest text-gray-400 mb-1">READING SERVICE</p>
              <h2 className="text-lg font-bold mb-1">この命式をもっと深く読み解きたい方へ</h2>
              <p className="text-sm text-gray-300 mb-6">算命学のプロが、あなたの宿命・才能・運気の流れを丁寧に鑑定します</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <div className="bg-white/10 rounded-lg px-6 py-4 flex-1 max-w-xs mx-auto sm:mx-0">
                  <p className="text-xs text-gray-400 mb-1">テキスト鑑定</p>
                  <p className="text-2xl font-bold mb-1">¥3,000</p>
                  <p className="text-xs text-gray-300">詳細な鑑定文をメッセージでお届け</p>
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-4 flex-1 max-w-xs mx-auto sm:mx-0">
                  <p className="text-xs text-gray-400 mb-1">オンライン鑑定</p>
                  <p className="text-2xl font-bold mb-1">¥6,000</p>
                  <p className="text-xs text-gray-300">30分 / ビデオ通話で直接ご相談</p>
                </div>
              </div>
              <a
                href="#"
                className="inline-block bg-white text-gray-900 font-bold text-sm px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                お申し込み・お問い合わせ
              </a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
