'use client';

import { useState } from 'react';
import { calcMeisei } from '@/lib/sanmeigaku/insen';
import { calcTenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';
import { JUNISHI, SETSU_DAYS } from '@/lib/sanmeigaku/constants';
import type { Tenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';

const ADVICE: Record<string, string[]> = {
  子丑天中殺: [
    '北方・冬のエネルギーが空き、堅実さが揺らぎやすい時期です',
    '不動産・貯蓄など「固定」に関わる大きな決断は慎重に',
    '新しい視点や人との出会いを大切にすると好転しやすい',
    '内省と学びに時間を使うと、後の大きな力になります',
    '「守る」より「流れに乗る」意識で過ごすのがコツ',
    '準備期間として種をまいておくと、天中殺明けに実ります',
  ],
  寅卯天中殺: [
    '東方・春のエネルギーが空き、成長・発展が鈍化しやすい',
    '新しいことを急いで始めるより、今の積み上げを整理する時期',
    '人間関係の新規開拓より、既存の縁を深める方が吉',
    '体調管理を丁寧に。無理は禁物な時期です',
    '学び・習得に集中するとエネルギーが活きます',
    '焦らず内側を固めることで、次の10年の基盤になります',
  ],
  辰巳天中殺: [
    '東南のエネルギーが空き、計画が思い通りに進みにくい',
    '大きなビジネス判断・契約は慎重に見極めること',
    '「計画通り」を求めすぎず、柔軟に対応する意識を持つ',
    '人との縁が変わりやすい時期。環境の変化を受け入れて',
    '精神面の安定を意識する。休息・瞑想を大切に',
    '表に出るより裏方・サポートで力を発揮しやすい時期',
  ],
  午未天中殺: [
    '南方・夏のエネルギーが空き、情熱・対人関係が揺らぐ',
    '感情的な発言・SNS投稿には特に注意が必要な時期',
    '恋愛・結婚など感情が絡む決断はゆっくり慎重に',
    'エネルギーを外に向けすぎず、内省の時間を意識して',
    '人間関係の摩擦が起きやすい。受け流す練習をすると楽',
    '自分の気持ちを日記などで整理すると気持ちが楽になります',
  ],
  申酉天中殺: [
    '西方・秋のエネルギーが空き、結実・収穫が鈍化しやすい',
    '結果を急がず、プロセスを大切にする時期です',
    '仕事での結果・評価にこだわりすぎないことが大切',
    '独立・起業など大きな変化は見極めをしっかりと',
    '既存のスキルを磨く・深める時間に充てると吉',
    '「今は種まき」と思って地道に積み上げることが正解',
  ],
  戌亥天中殺: [
    '北西のエネルギーが空き、精神・信念が揺らぎやすい',
    '精神的な支柱（信念・哲学）に迷いが出やすい時期',
    'お金・財産に関わる大きな動きは慎重に判断すること',
    '孤独な時間を恐れず、自分と向き合うチャンス',
    '過去の縁が戻ってきやすい。人との再会を大切に',
    '「答えが出ない時期」と割り切り、焦らず過ごすのが吉',
  ],
};

const TC_THEME: Record<string, { gradient: string; accent: string; light: string; kanji: string }> = {
  子丑天中殺: { gradient: 'from-blue-950 to-indigo-900', accent: 'text-blue-400', light: 'bg-blue-900/30 border-blue-700', kanji: '子丑' },
  寅卯天中殺: { gradient: 'from-emerald-950 to-green-900', accent: 'text-emerald-400', light: 'bg-emerald-900/30 border-emerald-700', kanji: '寅卯' },
  辰巳天中殺: { gradient: 'from-yellow-950 to-amber-900', accent: 'text-yellow-400', light: 'bg-yellow-900/30 border-yellow-700', kanji: '辰巳' },
  午未天中殺: { gradient: 'from-red-950 to-rose-900', accent: 'text-red-400', light: 'bg-red-900/30 border-red-700', kanji: '午未' },
  申酉天中殺: { gradient: 'from-purple-950 to-violet-900', accent: 'text-purple-400', light: 'bg-purple-900/30 border-purple-700', kanji: '申酉' },
  戌亥天中殺: { gradient: 'from-cyan-950 to-teal-900', accent: 'text-cyan-400', light: 'bg-cyan-900/30 border-cyan-700', kanji: '戌亥' },
};

function getCurrentNenshi(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  let sanmeiYear = year;
  const setsuFeb = SETSU_DAYS[2] ?? 4;
  if (month < 2 || (month === 2 && day < setsuFeb)) sanmeiYear = year - 1;
  const shiIndex = ((sanmeiYear - 4) % 12 + 12) % 12;
  return JUNISHI[shiIndex];
}

function checkStatus(tc: Tenchusatsu): { active: boolean; shi: string } {
  const shi = getCurrentNenshi();
  const active = shi === tc.voidShi1 || shi === tc.voidShi2;
  return { active, shi };
}

function generateShareImage(
  tcName: string,
  active: boolean,
  shi: string,
  birthdate: string,
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    const bgColors: Record<string, [string, string]> = {
      子丑天中殺: ['#0d1b4b', '#1e3a8a'],
      寅卯天中殺: ['#052e16', '#166534'],
      辰巳天中殺: ['#422006', '#78350f'],
      午未天中殺: ['#450a0a', '#991b1b'],
      申酉天中殺: ['#2e1065', '#5b21b6'],
      戌亥天中殺: ['#042f2e', '#134e4a'],
    };
    const accentColors: Record<string, string> = {
      子丑天中殺: '#60a5fa',
      寅卯天中殺: '#34d399',
      辰巳天中殺: '#fbbf24',
      午未天中殺: '#f87171',
      申酉天中殺: '#a78bfa',
      戌亥天中殺: '#22d3ee',
    };

    const [c1, c2] = bgColors[tcName] ?? ['#1a1a2e', '#16213e'];
    const accent = accentColors[tcName] ?? '#818cf8';

    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Outer ring
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(540, 500, 430, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(540, 500, 370, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Header label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('天中殺診断', 540, 130);

    // Big kanji
    ctx.fillStyle = accent;
    ctx.font = 'bold 200px serif';
    ctx.fillText(tcName.replace('天中殺', ''), 540, 430);

    // 天中殺 label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.fillText('天中殺', 540, 540);

    // Status badge
    ctx.fillStyle = active ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)';
    ctx.beginPath();
    ctx.roundRect(240, 600, 600, 90, 45);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(
      active ? `${shi}年 — 天中殺期間中` : `${shi}年 — 天中殺期間外`,
      540,
      656,
    );

    // Birthdate
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '30px sans-serif';
    ctx.fillText(`生年月日: ${birthdate}`, 540, 770);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '26px sans-serif';
    ctx.fillText('@tanukichi_sanme', 540, 980);

    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export default function TenchusatsuPage() {
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState<{ tc: Tenchusatsu; status: ReturnType<typeof checkStatus> } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgBlob, setImgBlob] = useState<Blob | null>(null);

  const handleCalc = async () => {
    if (!birthdate) { setError('生年月日を入力してください'); return; }
    setError('');
    const [year, month, day] = birthdate.split('-').map(Number);
    if (!year || !month || !day) { setError('正しい日付を入力してください'); return; }
    const m = calcMeisei(year, month, day);
    const tc = calcTenchusatsu(m.nichikanIndex, m.nichishiIndex);
    const status = checkStatus(tc);
    setResult({ tc, status });
    setImgUrl(null);
    setImgBlob(null);

    const blob = await generateShareImage(tc.name, status.active, status.shi, birthdate);
    setImgBlob(blob);
    setImgUrl(URL.createObjectURL(blob));
  };

  const shareText = result
    ? `🦝 天中殺診断してみた！\n\nわたしは「${result.tc.name}」\n${result.status.active ? `🚨 今年（${result.status.shi}年）は天中殺期間中！` : `✅ 今年（${result.status.shi}年）は天中殺期間外！`}\n\n算命学の12年周期の空き時期を知って\n流れに逆らわない生き方を🔮\n\n無料で診断はプロフから\n\n#天中殺 #算命学`
    : '';

  const handleShare = async (platform: 'x' | 'threads' | 'line' | 'copy') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + '\n' + url)}`, '_blank');
    }
    if (platform === 'threads') {
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + '\n' + url)}`, '_blank');
    }
    if (platform === 'line') {
      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `tenchusatsu-${birthdate}.png`;
    a.click();
  };

  const handleNativeShare = async () => {
    if (!imgBlob) return;
    const file = new File([imgBlob], `tenchusatsu-${birthdate}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: '天中殺診断', text: shareText, files: [file] });
    } else {
      handleDownload();
    }
  };

  const theme = result ? (TC_THEME[result.tc.name] ?? TC_THEME['子丑天中殺']) : null;

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center py-10 px-4 pb-20">
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <p className="text-3xl mb-2">🦝</p>
        <h1 className="text-2xl font-bold text-white tracking-wide">天中殺診断</h1>
        <p className="text-sm text-gray-400 mt-1">生年月日から天中殺の種類と今の状況を一発で確認</p>
      </div>

      {/* 無料利用の注意書き */}
      <div className="w-full max-w-lg mb-6 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-center">
        <p className="text-xs text-gray-300 leading-relaxed">
          ✨ このツールは<span className="text-white font-bold">無料</span>でご利用いただけます<br />
          気に入ったら<span className="text-yellow-400 font-bold">X・Threads・LINEでシェア</span>していただけると嬉しいです🦝<br />
          <span className="text-gray-400">シェアで広まるほど、より多くの人の役に立てます</span>
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-full max-w-lg mb-6">
        <label className="block text-sm text-gray-300 mb-1 font-medium">生年月日</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <button
          onClick={handleCalc}
          className="mt-3 w-full bg-white text-gray-900 rounded-lg py-2.5 text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          天中殺を診断する
        </button>
      </div>

      {/* 結果 */}
      {result && theme && (
        <div className="w-full max-w-lg flex flex-col gap-5">
          {/* 天中殺タイプカード */}
          <div className={`bg-gradient-to-br ${theme.gradient} rounded-2xl p-7 text-center border border-white/10`}>
            <p className="text-xs tracking-widest text-white/40 mb-3 uppercase">Your Tenchusatsu</p>
            <p className={`text-7xl font-bold ${theme.accent} mb-1`} style={{ fontFamily: 'serif' }}>
              {theme.kanji}
            </p>
            <p className="text-2xl font-bold text-white mb-4">{result.tc.name}</p>

            {/* 今の状態 */}
            <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold ${result.status.active ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
              {result.status.active
                ? `🚨 今年（${result.status.shi}年）は天中殺期間中！`
                : `✅ 今年（${result.status.shi}年）は天中殺期間外`}
            </div>

            {/* 空の五行 */}
            <div className="mt-4 flex justify-center gap-3">
              <span className={`text-xs ${theme.light} border rounded-full px-3 py-1 text-white/70`}>
                空亡: {result.tc.voidShi1}（{result.tc.voidGogyo1}）
              </span>
              <span className={`text-xs ${theme.light} border rounded-full px-3 py-1 text-white/70`}>
                空亡: {result.tc.voidShi2}（{result.tc.voidGogyo2}）
              </span>
            </div>
          </div>

          {/* アドバイス */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs tracking-widest text-gray-400 mb-3 uppercase">Advice</p>
            <ul className="flex flex-col gap-2">
              {(ADVICE[result.tc.name] ?? []).map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                  <span className={`mt-0.5 text-xs font-bold ${theme.accent} shrink-0`}>{i + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-gray-400">
                🔒 <span className="text-white font-bold">有料版</span>では恋愛・仕事・健康・大運との重なりまで<br />
                徹底解説したフル鑑定が読めます（近日公開）
              </p>
            </div>
          </div>

          {/* シェア画像 */}
          {imgUrl && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs tracking-widest text-gray-400 mb-3 uppercase">Share Image</p>
              <img src={imgUrl} alt="シェア用画像" className="w-full rounded-lg mb-4" />
              <button
                onClick={handleDownload}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2 text-sm font-medium transition-colors mb-2"
              >
                画像を保存する
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  画像をシェアする
                </button>
              )}
            </div>
          )}

          {/* シェアボタン */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs tracking-widest text-gray-400 mb-1 uppercase">Share</p>
            <p className="text-xs text-gray-400 mb-4">画像を保存してから投稿に添付するとより効果的🦝</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('x')}
                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium transition-colors border border-white/10"
              >
                <span className="font-bold">𝕏</span> Xでシェア
              </button>
              <button
                onClick={() => handleShare('threads')}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors border border-white/10"
              >
                <span>@</span> Threadsでシェア
              </button>
              <button
                onClick={() => handleShare('line')}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                LINEで送る
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2.5 text-sm font-medium transition-colors border border-white/10"
              >
                {copied ? '✅ コピー済み' : '🔗 リンクをコピー'}
              </button>
            </div>
          </div>

          {/* 命式鑑定CTA */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white text-center border border-white/10">
            <p className="text-xs tracking-widest text-gray-400 mb-1">FULL READING</p>
            <h2 className="text-base font-bold mb-1">命式（陰占・陽占）も無料で見る</h2>
            <p className="text-xs text-gray-400 mb-4">天中殺だけでなく、あなたの本質・才能・大運の流れもわかります</p>
            <a
              href="/"
              className="inline-block bg-white text-gray-900 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              命式を診断する →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
