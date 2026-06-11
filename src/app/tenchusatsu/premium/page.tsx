'use client';

import { useState } from 'react';
import { calcMeisei } from '@/lib/sanmeigaku/insen';
import { calcTenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';
import { calcTaiUn } from '@/lib/sanmeigaku/taiun';
import { JUNISHI, SETSU_DAYS } from '@/lib/sanmeigaku/constants';
import type { Tenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';
import type { TaiUn } from '@/lib/sanmeigaku/taiun';
import type { Meisei } from '@/lib/sanmeigaku/insen';

const NOTE_FREE_URL = 'https://note.com/tanukichi_sanme/n/n5af38530ecfb';
const NOTE_PAID_URL = 'https://note.com/tanukichi_sanme/n/n40faf9e61e44';

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

// ─── ヘルパー関数 ───────────────────────────────────────────

function calcTenchusatsuPeriods(tc: Tenchusatsu): { year1: number; year2: number; status: 'past' | 'current' | 'future' }[] {
  const currentYear = new Date().getFullYear();
  const shi1Index = JUNISHI.indexOf(tc.voidShi1 as typeof JUNISHI[number]);
  if (shi1Index === -1) return [];
  const kCenter = Math.round((currentYear - 4 - shi1Index) / 12);
  const all: { year1: number; year2: number; status: 'past' | 'current' | 'future' }[] = [];
  for (let i = kCenter - 4; i <= kCenter + 4; i++) {
    const year1 = 4 + shi1Index + 12 * i;
    const year2 = year1 + 1;
    const status: 'past' | 'current' | 'future' =
      year2 < currentYear ? 'past' : year1 <= currentYear ? 'current' : 'future';
    all.push({ year1, year2, status });
  }
  const past = all.filter(p => p.status === 'past').slice(-3);
  const current = all.filter(p => p.status === 'current');
  const future = all.filter(p => p.status === 'future').slice(0, 3);
  return [...past, ...current, ...future];
}

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

// 月支ルックアップ（カレンダー月1〜12 → 算命学月支）
const CAL_MONTH_SHI: Record<number, string> = {
  1: '丑', 2: '寅', 3: '卯', 4: '辰', 5: '巳', 6: '午',
  7: '未', 8: '申', 9: '酉', 10: '戌', 11: '亥', 12: '子',
};

function calcGetsuSchedule(tc: Tenchusatsu) {
  const today = new Date();
  const arr: Array<{ year: number; month: number; shi: string; isTc: boolean }> = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const shi = CAL_MONTH_SHI[m] ?? '';
    arr.push({ year: y, month: m, shi, isTc: shi === tc.voidShi1 || shi === tc.voidShi2 });
  }
  return arr;
}

function calcNichiSchedule(tc: Tenchusatsu) {
  const today = new Date();
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const arr: Array<{ dateStr: string; shi: string }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    try {
      const mei = calcMeisei(y, m, day);
      const shi = mei.nitchu.shi;
      if (shi === tc.voidShi1 || shi === tc.voidShi2) {
        arr.push({ dateStr: `${m}月${day}日（${dayNames[d.getDay()]}）`, shi });
      }
    } catch { /* skip */ }
  }
  return arr;
}

// 五行生剋テーブル
const GOGYO_GENERATES: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};
const GOGYO_GEN_BY: Record<string, string> = {
  '火': '木', '土': '火', '金': '土', '水': '金', '木': '水',
};
const GOGYO_OVERCOME_BY: Record<string, string> = {
  '土': '木', '水': '土', '火': '水', '金': '火', '木': '金',
};
const KAN_GOGYO: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const ZOKKAN_LOCAL: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '辛', '癸'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '乙', '丁'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '丁', '辛'], '亥': ['壬', '甲'],
};

const GOGYO_LABEL: Record<string, string> = {
  '木': '木（もく）', '火': '火（か）', '土': '土（ど）', '金': '金（きん）', '水': '水（すい）',
};
const GOGYO_KANS: Record<string, string> = {
  '木': '甲・乙', '火': '丙・丁', '土': '戊・己', '金': '庚・辛', '水': '壬・癸',
};
const GOGYO_SHIS: Record<string, string> = {
  '木': '寅・卯', '火': '巳・午', '土': '辰・未・戌・丑', '金': '申・酉', '水': '亥・子',
};

function calcShugoshin(meisei: Meisei): {
  shugoshin: string;
  kijin: string;
  isStrong: boolean;
} {
  const niGogyo = KAN_GOGYO[meisei.nitchu.kan] ?? '土';

  const pillars = [
    meisei.nenchu.kan,
    ZOKKAN_LOCAL[meisei.nenchu.shi]?.[0] ?? meisei.nenchu.kan,
    meisei.getchu.kan,
    ZOKKAN_LOCAL[meisei.getchu.shi]?.[0] ?? meisei.getchu.kan,
    meisei.nitchu.kan,
    ZOKKAN_LOCAL[meisei.nitchu.shi]?.[0] ?? meisei.nitchu.kan,
  ];

  let support = 0;
  let opposition = 0;
  for (const k of pillars) {
    const g = KAN_GOGYO[k] ?? niGogyo;
    if (g === niGogyo || g === GOGYO_GEN_BY[niGogyo]) support++;
    else opposition++;
  }

  const isStrong = support >= opposition;
  // 身強: 食傷（日干が生む五行）で余分なエネルギーを流す → 守護神
  //       印星（日干をさらに強める）が忌神
  // 身弱: 印星（日干を生む五行）でエネルギーを補う → 守護神
  //       官星（日干を剋す五行）が忌神
  const shugoshin = isStrong ? GOGYO_GENERATES[niGogyo] : GOGYO_GEN_BY[niGogyo];
  const kijin     = isStrong ? GOGYO_GEN_BY[niGogyo]    : GOGYO_OVERCOME_BY[niGogyo];

  return { shugoshin: shugoshin ?? '土', kijin: kijin ?? '土', isStrong };
}

function getCurrentTaiUnIndex(taiun: TaiUn, birthYear: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return taiun.entries.findIndex(e => e.startAge <= age && age <= e.endAge);
}

// 今年の天干（算命学年）
function getCurrentNenkan(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  let sanmeiYear = year;
  const setsuFeb = SETSU_DAYS[2] ?? 4;
  if (month < 2 || (month === 2 && day < setsuFeb)) sanmeiYear = year - 1;
  const JIKKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return JIKKAN[((sanmeiYear - 4) % 10 + 10) % 10];
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

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('天中殺診断', 540, 130);

    ctx.fillStyle = accent;
    ctx.font = 'bold 200px serif';
    ctx.fillText(tcName.replace('天中殺', ''), 540, 430);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.fillText('天中殺', 540, 540);

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

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '30px sans-serif';
    ctx.fillText(`生年月日: ${birthdate}`, 540, 770);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '26px sans-serif';
    ctx.fillText('@tanukichi_sanme', 540, 980);

    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export default function TenchusatsuPremiumPage() {
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState<{ tc: Tenchusatsu; status: ReturnType<typeof checkStatus> } | null>(null);
  const [taiun, setTaiun] = useState<TaiUn | null>(null);
  const [meiseiData, setMeiseiData] = useState<Meisei | null>(null);
  const [birthYear, setBirthYear] = useState<number>(0);
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
    const ta = calcTaiUn(m, year, month, day);
    setResult({ tc, status });
    setTaiun(ta);
    setMeiseiData(m);
    setBirthYear(year);
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
        <h1 className="text-2xl font-bold text-white tracking-wide">天中殺診断 プレミアム</h1>
        <p className="text-sm text-gray-400 mt-1">天中殺スケジュール ・ 月日天中殺 ・ 大運の流れをまるごと確認</p>
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
          診断する
        </button>
      </div>

      {/* 天中殺とは？解説 */}
      <div className="w-full max-w-lg mb-6">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-gray-300 font-medium select-none hover:bg-white/8 transition-colors">
            <span>🔮 天中殺ってどんな時期？</span>
            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-2 flex flex-col gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs font-bold text-white mb-2">天中殺とは</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                12年サイクルのうち<span className="text-white font-bold">2年間だけ</span>訪れる特別な時期。算命学では「干支が空く（＝宿命のエネルギーが弱まる）時期」と呼ばれます。怖い呪いや罰ではなく、<span className="text-yellow-400">誰にでも平等に訪れる自然な周期</span>です。
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs font-bold text-white mb-3">期間中に起きやすいこと</p>
              <ul className="flex flex-col gap-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">•</span>新しく始めたことが思い通りに進みにくい</li>
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">•</span>人との縁が変わりやすく、環境が動きやすい</li>
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">•</span>感情の波が大きくなりやすい</li>
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">•</span>大きな決断の結果が読みにくい</li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs font-bold text-white mb-3">どう過ごすといい？</p>
              <ul className="flex flex-col gap-2 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>内省・学び・準備に集中する</li>
                <li className="flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>人間関係を整理・深める</li>
                <li className="flex items-start gap-2"><span className="text-green-400 shrink-0">✓</span>「今は種まきの時期」と割り切って積み上げる</li>
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span>大きな投資・契約・結婚などは慎重に</li>
                <li className="flex items-start gap-2"><span className="text-red-400 shrink-0">✗</span>感情的な発言・大きな方向転換は避ける</li>
              </ul>
            </div>
            <a
              href={NOTE_FREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl px-5 py-4 transition-colors group"
            >
              <div>
                <p className="text-xs text-gray-400 mb-0.5">無料で読む</p>
                <p className="text-sm font-medium text-white">天中殺とは？基本から過ごし方まで完全解説</p>
              </div>
              <span className="text-gray-400 group-hover:text-white transition-colors shrink-0 ml-3">→</span>
            </a>
          </div>
        </details>
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
            <div className={`inline-block px-5 py-2 rounded-full text-sm font-bold ${result.status.active ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
              {result.status.active
                ? `🚨 今年（${result.status.shi}年）は天中殺期間中！`
                : `✅ 今年（${result.status.shi}年）は天中殺期間外`}
            </div>
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
            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href={NOTE_PAID_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between hover:opacity-80 transition-opacity group"
              >
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">📖 有料ガイドで深める</p>
                  <p className="text-xs text-white">タイプ別の過ごし方・明けた後の動き方・実例まで完全解説</p>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors shrink-0 ml-3 text-sm">→</span>
              </a>
            </div>
          </div>

          {/* 今の時期のアドバイス */}
          {(() => {
            const { active, shi } = result.status;
            const periods = calcTenchusatsuPeriods(result.tc);
            const nextPeriod = periods.find(p => p.status === 'future');
            const yearsUntilNext = nextPeriod ? nextPeriod.year1 - new Date().getFullYear() : null;
            const soonWarning = !active && yearsUntilNext !== null && yearsUntilNext <= 2;

            const activeAdvice: Record<string, string[]> = {
              子丑天中殺: ['大きな投資・引越し・転職などの決断はいったん保留', '学び・資格取得・スキルアップに集中する絶好機', '身近な人間関係を丁寧に整理・深めていく'],
              寅卯天中殺: ['新規の人間関係より、既存の縁を大切にする', '体調管理を最優先。無理なスケジュールを組まない', '習得・練習・内省に時間を充てると後で活きる'],
              辰巳天中殺: ['大きなビジネス判断・契約事は後回しに', '柔軟さを持って。「計画通り」を手放す練習', '精神的な安定を意識。一人の時間を意図的に作る'],
              午未天中殺: ['SNSや感情的な発言は特に慎重に', '恋愛・対人トラブルは受け流す意識で', '日記・瞑想など、内面を整える習慣を始める'],
              申酉天中殺: ['結果より「プロセス」を楽しむ意識に切り替える', '独立・起業など大きな変化は見極めをしっかりと', '人のサポートや裏方の仕事で力を発揮しやすい'],
              戌亥天中殺: ['お金・財産に関わる大きな動きは慎重に', '孤独な時間を恐れず、自分の信念を見直す', '過去の縁が戻ってきやすい。再会を大切に'],
            };
            const inactiveAdvice = [
              '天中殺外は宿命のエネルギーが充実している時期',
              '新しいことを始める・挑戦する・決断する好機',
              '人間関係を広げ、チャンスを積極的につかみにいく',
            ];

            return (
              <div className={`rounded-xl p-5 border ${active ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{active ? '🚨' : '✅'}</span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {active ? `今（${shi}年）は天中殺期間中` : `今（${shi}年）は天中殺期間外`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {active ? 'この時期の過ごし方のポイント' : 'エネルギーが充実している時期'}
                    </p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {(active ? (activeAdvice[result.tc.name] ?? []) : inactiveAdvice).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <span className={`shrink-0 font-bold text-xs mt-0.5 ${active ? 'text-red-400' : 'text-emerald-400'}`}>{active ? '•' : '✓'}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                {soonWarning && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-yellow-400">
                      ⚠️ {yearsUntilNext === 1 ? '来年' : `${yearsUntilNext}年後`}（{nextPeriod!.year1}年）から天中殺が始まります。今のうちに大きな決断・仕込みを済ませておくと吉。
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 年天中殺スケジュール */}
          {(() => {
            const periods = calcTenchusatsuPeriods(result.tc);

            const periodAdvice: Record<string, { caution: string[]; doNow: string[] }> = {
              子丑天中殺: {
                caution: ['不動産購入・引越しは慎重に（定着しにくい）', '貯蓄・投資など固定資産への大きな動きは保留', '新しいビジネス立ち上げや独立は天中殺明けまで待つ'],
                doNow: ['知識・スキルの習得に集中する', '人間関係を整理して本当の縁を深める', '次の12年に向けた人生設計・ビジネス設計をする'],
              },
              寅卯天中殺: {
                caution: ['新規の人間関係スタート（ビジネスパートナーなど）は慎重に', '転職・就職など環境の大きな変化は時期を選ぶ', '無理なスケジュール・体に負担をかけすぎない'],
                doNow: ['既存の仕事・スキルをひたすら深める', '体調管理に投資する（睡眠・食事・運動）', '明けてからの行動計画を具体的に立てる'],
              },
              辰巳天中殺: {
                caution: ['大きなビジネス契約・重要な決断は後回しに', '計画通りにいかなくても焦って動き直さない', '感情的な発言・SNSでの大きな動きに注意'],
                doNow: ['精神的な軸（価値観・信念）を固める時間にする', '瞑想・日記・内省を習慣にする', '表ではなく裏方・サポートの役割で力を発揮する'],
              },
              午未天中殺: {
                caution: ['恋愛・結婚（入籍）の大きな決断は慎重に', 'SNSや感情的な発言は特に注意', '感情に任せた衝動的な行動・浪費を避ける'],
                doNow: ['感情を日記・創作などで健全に発散する', '自分の内面のテーマと向き合う', '対人関係のパターンを振り返り整理する'],
              },
              申酉天中殺: {
                caution: ['仕事の結果・評価を急ぎすぎない', '独立・起業のスタートタイミングを焦らず見極める', '結果主義になりすぎて燃え尽きない'],
                doNow: ['スキル・専門性を深める時期として使う', '裏方・縁の下の力持ちとして実績を積む', '次の10年のビジネス設計・人生設計を練る'],
              },
              戌亥天中殺: {
                caution: ['お金・財産に関わる大きな動き（投資・借金）は慎重に', '精神的な信念・方針が揺らいでも焦って決断しない', '孤立感を感じやすい時期——無理に人と繋がろうとしない'],
                doNow: ['自分の価値観・人生観を問い直す', '過去の縁を大切に。再会を意味あるものとして受け取る', '静かに深く積み上げる2年間として使う'],
              },
            };

            const futurePrep = [
              '大きな契約・決断・入籍など「根付かせたい行動」は天中殺前に済ませる',
              '人間関係・仕事・住環境などの基盤を今のうちに固める',
              '天中殺中に集中したい「学び・テーマ」を事前に決めておく',
              '天中殺明けにやりたいことのリストを作っておく',
            ];

            const tcProfile: Record<string, {
              direction: string;
              element: string;
              theme: string;
              weakens: string;
              happensCaution: string;
              happensPower: string;
            }> = {
              子丑天中殺: {
                direction: '北方・冬',
                element: '水のエネルギー',
                theme: '「固める・蓄える・堅実に積み上げる」という力が空く天中殺',
                weakens: '物質的な安定（不動産・貯蓄・定着）に関することが揺らぎやすい',
                happensCaution: '変化や環境の流動が起きやすく、「ここに根付く」ことが難しくなる。固めようとすればするほど逃げる感覚になりやすい',
                happensPower: '逆に「変化・流れに乗る・新しい価値観と出会う」力が高まる。守りより適応を意識すると2年間が活きる',
              },
              寅卯天中殺: {
                direction: '東方・春',
                element: '木のエネルギー',
                theme: '「成長・発展・新しく広げる」という力が空く天中殺',
                weakens: '新しいことを始める・拡大する動きが根付きにくく、スタートダッシュが効きにくい',
                happensCaution: '人間関係の新規開拓や環境の大きな変化が裏目に出やすい。体・健康面に影響が出やすい天中殺でもある',
                happensPower: '「深める・磨く・整える」力は落ちない。既存のスキルや縁を丁寧に育てることに特化すると大きな蓄積になる',
              },
              辰巳天中殺: {
                direction: '東南',
                element: '土・火のエネルギー',
                theme: '「計画・実行・達成する」という力が空く天中殺',
                weakens: 'ビジネスの結果・仕事の計画が思い通りに進みにくく、達成感が得にくい時期',
                happensCaution: '精神的な揺らぎ・自分の方向性への疑問が浮かびやすい。表に出て結果を出そうとすると空回りしがち',
                happensPower: '「内側を整える・精神の軸を作る」力が活きる天中殺。裏方・サポート・内省的な役割で大きく深まれる',
              },
              午未天中殺: {
                direction: '南方・夏',
                element: '火のエネルギー',
                theme: '「情熱・感情・対人関係」という力が空く天中殺',
                weakens: '感情的なエネルギーと人間関係のバランスが揺らぎやすく、感情の波が大きくなりやすい',
                happensCaution: '衝動的な発言・恋愛での決断・SNSでの大きなアクションが裏目に出やすい。感情主導の判断に要注意',
                happensPower: '感情を「外に出す」のではなく「内側で昇華する」ことに使うと、深い洞察力・感受性として力に変わる',
              },
              申酉天中殺: {
                direction: '西方・秋',
                element: '金のエネルギー',
                theme: '「結実・収穫・評価を得る」という力が空く天中殺',
                weakens: '努力が結果に直結しにくく、キャリアアップや仕事での評価が遅れがちになる',
                happensCaution: '結果を急いで無理に動くと空回りしやすい。独立・起業・転職など大きな環境変化のタイミングに注意',
                happensPower: '「結果より過程」を生きる2年間。スキルの蓄積・裏方での貢献が、天中殺明けに一気に評価に転じる',
              },
              戌亥天中殺: {
                direction: '北西',
                element: '金・水のエネルギー',
                theme: '「精神的な軸・信念・財産を守る」という力が空く天中殺',
                weakens: '自分の信念・価値観が揺らぎやすく、孤独感・喪失感を感じやすい時期',
                happensCaution: 'お金・財産に関する動きが乱れやすい。孤独を埋めようと衝動的な決断をすると後悔しやすい',
                happensPower: '「自分と向き合う・問い直す・哲学を深める」力が活きる天中殺。孤独を恐れず、内側に潜るほど大きな軸ができる',
              },
            };

            const profile = tcProfile[result.tc.name];

            return (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-xs tracking-widest text-gray-400 mb-1 uppercase">年天中殺 スケジュール</p>

                {/* あなたの天中殺の特徴 */}
                {profile && (
                  <div className={`mb-4 rounded-xl p-4 border ${theme.light} flex flex-col gap-3`}>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{profile.direction} / {profile.element}</p>
                      <p className={`text-sm font-bold ${theme.accent}`}>{profile.theme}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-gray-300">
                      <div>
                        <span className="text-white font-medium">弱まるエネルギー：</span>
                        <span className="text-gray-400">{profile.weakens}</span>
                      </div>
                      <div>
                        <span className="text-red-300 font-medium">起きやすいこと：</span>
                        <span className="text-gray-400">{profile.happensCaution}</span>
                      </div>
                      <div>
                        <span className="text-emerald-300 font-medium">逆に活きる力：</span>
                        <span className="text-gray-400">{profile.happensPower}</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-3">タップすると、その時期の詳細アドバイスが見られます</p>
                <ul className="flex flex-col gap-2">
                  {periods.map(({ year1, year2, status }) => {
                    const currentYear = new Date().getFullYear();
                    const yearsUntil = year1 - currentYear;
                    const advice = periodAdvice[result.tc.name];

                    return (
                      <li key={year1}>
                        <details className="group">
                          <summary className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer select-none list-none transition-all ${
                            status === 'current'
                              ? 'bg-red-500/15 border border-red-500/40 hover:bg-red-500/20'
                              : status === 'future'
                              ? 'bg-white/5 border border-white/10 hover:bg-white/8'
                              : 'border border-white/5 opacity-50 hover:opacity-70'
                          }`}>
                            <span className={`font-medium ${status === 'current' ? 'text-white' : 'text-gray-300'}`}>
                              {year1}年 〜 {year2}年
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                status === 'current' ? 'bg-red-500/30 text-red-300'
                                : status === 'future' ? 'bg-white/10 text-gray-400'
                                : 'text-gray-600'
                              }`}>
                                {status === 'current' ? '🚨 現在' : status === 'future' ? '⏳ 予定' : '終了'}
                              </span>
                              <span className="text-gray-500 text-xs group-open:rotate-180 transition-transform inline-block">▼</span>
                            </div>
                          </summary>

                          <div className={`mt-1 rounded-lg p-4 text-xs leading-relaxed flex flex-col gap-3 ${
                            status === 'current' ? 'bg-red-500/8 border border-red-500/20' : 'bg-white/3 border border-white/8'
                          }`}>

                            {status === 'current' && advice && (
                              <>
                                <div>
                                  <p className="font-bold text-red-300 mb-1">🚨 今まさにこの時期です</p>
                                  <p className="text-gray-400">{result.tc.name}の天中殺中は、天の支援が得られない2年間。エネルギーが外に向かいにくく、新しく始めたことが根付きにくい時期です。</p>
                                </div>
                                <div>
                                  <p className="font-bold text-white mb-2">⚠️ 特に気をつけること</p>
                                  <ul className="flex flex-col gap-1.5">
                                    {advice.caution.map((c, i) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-red-400 shrink-0">✗</span>{c}
                                      </li>
                                    ))}
                                    <li className="flex items-start gap-2 text-gray-300">
                                      <span className="text-red-400 shrink-0">✗</span>重要な人間関係のスタート（新パートナー・新クライアント）
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-bold text-white mb-2">✅ 今できること・仕込むこと</p>
                                  <ul className="flex flex-col gap-1.5">
                                    {advice.doNow.map((d, i) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-emerald-400 shrink-0">✓</span>{d}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p className="text-gray-500 border-t border-white/10 pt-3">
                                  💡 天中殺は「種を蒔かず、内側を整える最高の準備期間」。明け（{year2 + 1}年〜）に一気に動くための仕込みに使いましょう。
                                </p>
                              </>
                            )}

                            {status === 'future' && (
                              <>
                                <div>
                                  <p className="font-bold text-yellow-300 mb-1">
                                    ⏳ {yearsUntil <= 1 ? '来年' : `${yearsUntil}年後`}（{year1}年）から始まります
                                  </p>
                                  <p className="text-gray-400">天中殺前の準備期間が最も大切です。今から動いておくことで、天中殺中の2年間を「安心して仕込める期間」にできます。</p>
                                </div>
                                <div>
                                  <p className="font-bold text-white mb-2">📋 天中殺前に済ませておくこと</p>
                                  <ul className="flex flex-col gap-1.5">
                                    {futurePrep.map((p, i) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-yellow-400 shrink-0">→</span>{p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p className="text-gray-500 border-t border-white/10 pt-3">
                                  💡 準備してから入る天中殺と、何も考えずに入るのでは2年間の質が全然違います。
                                </p>
                              </>
                            )}

                            {status === 'past' && (
                              <>
                                <p className="font-bold text-gray-400 mb-1">✓ {year1}〜{year2}年の天中殺は終わりました</p>
                                <div>
                                  <p className="font-bold text-white mb-2">🔍 振り返りのヒント</p>
                                  <ul className="flex flex-col gap-1.5">
                                    <li className="flex items-start gap-2 text-gray-300"><span className="text-gray-500 shrink-0">•</span>この2年間で手放したもの・変わったことを思い出してみる</li>
                                    <li className="flex items-start gap-2 text-gray-300"><span className="text-gray-500 shrink-0">•</span>うまくいかなかったことは「時期の問題」だった可能性がある</li>
                                    <li className="flex items-start gap-2 text-gray-300"><span className="text-gray-500 shrink-0">•</span>この期間に積み上げたものが、明けてからどう花開いたか振り返る</li>
                                  </ul>
                                </div>
                              </>
                            )}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}

          {/* ━━━ 月・日 天中殺スケジュール ━━━ */}
          {(() => {
            const getsuList = calcGetsuSchedule(result.tc);
            const nichiList = calcNichiSchedule(result.tc);
            const tcMonths = getsuList.filter(g => g.isTc);

            return (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                {/* 説明パネル */}
                <details className="group mb-4">
                  <summary className="flex items-center justify-between cursor-pointer select-none">
                    <p className="text-xs tracking-widest text-gray-400 uppercase">月・日 天中殺スケジュール</p>
                    <span className="text-xs text-purple-400 group-open:hidden">▶ これは何？</span>
                    <span className="text-xs text-purple-400 hidden group-open:inline">▼ 閉じる</span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-3 text-xs text-gray-300 leading-relaxed">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">📅 月天中殺とは？</p>
                      <p>年に2回、約1ヶ月間だけ訪れる「小さな天中殺」です。その月は特定の月支（月の干支）が自分の空亡（くうぼう）地支と重なるため、判断が鈍りやすく、新しい動きが根付きにくい傾向があります。</p>
                      <p className="mt-1 text-gray-400">年天中殺ほど強くはありませんが、重要な決断・契約・スタートは月天中殺外にずらすのがベターです。</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">🗓️ 日天中殺とは？</p>
                      <p>月に2〜4日ある最も小さな天中殺。1日単位の影響なので神経質になりすぎなくてOKですが、重要な契約書へのサインや大きな投資判断のタイミングは、できれば避けると無難です。</p>
                    </div>
                  </div>
                </details>

                {/* 月天中殺リスト */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-300 mb-2">📅 月天中殺（今後24ヶ月）</p>
                  {tcMonths.length === 0 ? (
                    <p className="text-xs text-gray-500">今後24ヶ月以内に月天中殺はありません</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tcMonths.map(({ year, month, shi }) => {
                        const setsuDay = SETSU_DAYS[month] ?? 6;
                        const isThisMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1;
                        return (
                          <span
                            key={`${year}-${month}`}
                            className={`text-xs px-3 py-1.5 rounded-full border ${
                              isThisMonth
                                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                : 'bg-white/5 border-white/15 text-gray-300'
                            }`}
                          >
                            {year}年{month}月{isThisMonth ? '（今月）' : ''}
                            <span className="ml-1 text-gray-500">/ {month}月{setsuDay}日〜 {shi}月</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 日天中殺リスト */}
                <div>
                  <p className="text-xs font-medium text-gray-300 mb-2">🗓️ 日天中殺（今後30日）</p>
                  {nichiList.length === 0 ? (
                    <p className="text-xs text-gray-500">今後30日以内に日天中殺はありません</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {nichiList.map(({ dateStr, shi }) => (
                        <span
                          key={dateStr}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-gray-300"
                        >
                          {dateStr}
                          <span className="ml-1 text-gray-500">/ {shi}日</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ━━━ 大運テーブル ━━━ */}
          {taiun && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              {/* 説明パネル */}
              <details className="group mb-4">
                <summary className="flex items-center justify-between cursor-pointer select-none">
                  <p className="text-xs tracking-widest text-gray-400 uppercase">大運（だいうん）の流れ</p>
                  <span className="text-xs text-purple-400 group-open:hidden">▶ これは何？</span>
                  <span className="text-xs text-purple-400 hidden group-open:inline">▼ 閉じる</span>
                </summary>
                <div className="mt-3 flex flex-col gap-3 text-xs text-gray-300 leading-relaxed">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="font-bold text-white mb-1">🌊 大運とは？</p>
                    <p>人生を10年ごとに区切った「大きな流れ」を示すものです。天中殺が「2年間の注意信号」なら、大運は「10年間の地図」です。</p>
                    <p className="mt-1 text-gray-400">「なぜあの10年はうまくいったのか」「なぜこの10年は空回りするのか」が大運を見ると説明がつくことが多いです。</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="font-bold text-white mb-1">表の見方</p>
                    <ul className="flex flex-col gap-1 text-gray-400">
                      <li>• <span className="text-white">干支</span>：その10年を象徴する干支の組み合わせ</li>
                      <li>• <span className="text-white">天干主星</span>：表に出やすいテーマ（仕事・対外的な動き）</li>
                      <li>• <span className="text-white">地支主星</span>：内側・本質のテーマ（プライベート・内面）</li>
                      <li>• <span className="text-white">従星</span>：その10年のエネルギーの質（勢い・充実・停滞など）</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="font-bold text-white mb-1">起運（きうん）について</p>
                    <p>大運は生まれた直後からではなく、<span className="text-white">起運年齢に達してから</span>始まります。それより前の時期は生まれ持った宿命（命式）が直接影響します。</p>
                  </div>
                </div>
              </details>

              {/* 起運情報 */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{taiun.kiunYears}</p>
                  <p className="text-xs text-gray-400">歳から</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-300">起運（大運の開始年齢）</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {taiun.isForward ? '順行（陽年生まれ）' : '逆行（陰年生まれ）'}
                    {taiun.kiunMonths > 0 ? `・${taiun.kiunMonths}ヶ月端数あり` : ''}
                  </p>
                </div>
              </div>

              {/* 大運テーブル */}
              {(() => {
                const SHUSEI_TAIUN: Record<string, { theme: string; active: string; conscious: string }> = {
                  貫索星: {
                    theme: '自立・独自路線のテーマ',
                    active: '自分のやり方・信念で突き進む力が強まる。一人で考え、一人で決め、一人でやり抜く10年',
                    conscious: '人に頼ることへの抵抗が出やすい。孤軍奮闘になりすぎず、信頼できる人への相談を意識的に取り入れる',
                  },
                  石門星: {
                    theme: '縁・仲間・つながりのテーマ',
                    active: 'グループ・チーム・横のつながりを活かすと開く10年。人との縁が活発になり、協力関係が広がる',
                    conscious: '一人で抱え込まず、周りの人を巻き込む意識を持つ。縁を広げることが直接結果につながる時期',
                  },
                  鳳閣星: {
                    theme: '表現・自由・楽しむテーマ',
                    active: '自分らしく表現することで力が出る10年。楽しさを基準に動くことが正解になりやすい',
                    conscious: '結果より「過程を楽しめているか」を判断基準にする。義務感や我慢から動く行動は空回りしやすい',
                  },
                  調舒星: {
                    theme: '感性・深化・こだわりのテーマ',
                    active: '内面・感性を磨くことで大きな力になる10年。繊細さや独自の審美眼が才能として輝く',
                    conscious: '完璧主義になりすぎず、「7割でGO」の意識を持つ。感情の波に飲み込まれないよう発散の場を作る',
                  },
                  禄存星: {
                    theme: '与える・魅力・人との循環のテーマ',
                    active: '人に与え・尽くすことで巡ってくる10年。人間関係と経済が連動しやすく、人脈が財産になる',
                    conscious: '与えすぎて消耗しないよう境界線を意識する。「与えることで返ってくる」という信頼感を持って動く',
                  },
                  司禄星: {
                    theme: '蓄積・堅実・守り固めるテーマ',
                    active: 'コツコツ積み上げたことが大きな力になる10年。着実な積み重ねが評価され、安定感が増す',
                    conscious: '急がず丁寧に。派手な動きより「地味だけど確かなもの」を積み上げることを優先する',
                  },
                  車騎星: {
                    theme: '行動・スピード・突破力のテーマ',
                    active: '動けば動くほど道が開く10年。スピード感と行動量が成果に直結しやすい時期',
                    conscious: '考えすぎず「まず動く」を意識する。ただし暴走しないよう定期的に立ち止まる場を作る',
                  },
                  牽牛星: {
                    theme: '誇り・責任・プロ意識のテーマ',
                    active: '社会的な役割・信頼・肩書きが重要になる10年。プロとしての姿勢が評価される',
                    conscious: '完璧主義と責任感が強まりすぎないよう注意。「自分がやらねば」を手放し、委任する力も磨く',
                  },
                  龍高星: {
                    theme: '変化・探求・未知への挑戦のテーマ',
                    active: '新しい環境・未知の世界への挑戦が活きる10年。変化を受け入れるほど可能性が広がる',
                    conscious: '変化を恐れず「今と違う自分」を積極的に試す。直感・閃きを大切にして行動に移す',
                  },
                  玉堂星: {
                    theme: '知識・伝承・守護のテーマ',
                    active: '学ぶ・教える・伝えることで力が出る10年。蓄えた知識や経験が財産になる',
                    conscious: '学びへの投資を惜しまない。「知っている」だけで終わらず、人に伝え・教えることで完成する',
                  },
                };

                const JUNISEI_TAIUN: Record<string, { energy: string; keyword: string }> = {
                  天貴星: { energy: '新しい始まり・種まきのエネルギー', keyword: '今まくものが10年後に実る。焦らず丁寧に根を張る時期' },
                  天恍星: { energy: '変化・感情の波が大きいエネルギー', keyword: '柔軟に変化に対応する力が求められる。感情の揺れを楽しむ余裕を持つ' },
                  天南星: { energy: '自立・確立・社会への定着エネルギー', keyword: '自分のスタンスが固まる時期。社会での立ち位置を意識する' },
                  天禄星: { energy: '充実・実力発揮のエネルギー', keyword: 'これまでの積み上げが発揮されやすい好調期。攻めの姿勢で動く' },
                  天将星: { energy: '最大パワー・勝負のエネルギー', keyword: '10年の中でも最もエネルギーが高い時期。大きな勝負・チャレンジを惜しまない' },
                  天堂星: { energy: '安定・維持・守りのエネルギー', keyword: '今あるものを大切に守り育てる時期。攻めより「守りを固めること」が正解' },
                  天胡星: { energy: '鈍化・内省・立て直しのエネルギー', keyword: '無理をしない・焦らない時期。内側を整えることに集中すると後で活きる' },
                  天極星: { energy: '手放し・次の準備のエネルギー', keyword: '古いものを手放し、次のステージへ移行する時期。執着を手放すほど軽くなる' },
                  天庫星: { energy: '蓄積・内側集中のエネルギー', keyword: '表より裏で積み上げる時期。地道な蓄積が次の大運で大きく花開く' },
                  天馳星: { energy: '空白・リセット・移行のエネルギー', keyword: '新しいステージへの移行期。流れに逆らわず、次の章への助走として使う' },
                  天報星: { energy: '潜在力の充電・準備エネルギー', keyword: '表には出にくいが内側で力が蓄えられている時期。準備と学びに専念する' },
                  天印星: { energy: '育まれる・守護・成長エネルギー', keyword: '人の助けを借りながら育つ時期。素直に教えを受け取る姿勢が大切' },
                };

                const currentIdx = getCurrentTaiUnIndex(taiun, birthYear);

                return (
                  <div className="flex flex-col gap-2">
                    {taiun.entries.map((entry, i) => {
                      const isCurrent = i === currentIdx;
                      const isPast = currentIdx !== -1 && i < currentIdx;
                      const kanAdvice = SHUSEI_TAIUN[entry.shusei];
                      const chiAdvice = SHUSEI_TAIUN[entry.chiShusei];
                      const juniseiAdvice = JUNISEI_TAIUN[entry.junisei];

                      return (
                        <details key={i} className="group">
                          <summary className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer select-none list-none transition-all ${
                            isCurrent
                              ? 'bg-indigo-500/15 border border-indigo-400/40 hover:bg-indigo-500/20'
                              : isPast
                              ? 'border border-white/5 opacity-50 hover:opacity-70'
                              : 'bg-white/3 border border-white/10 hover:bg-white/6'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white" style={{ fontFamily: 'serif' }}>
                                {entry.kan}{entry.shi}
                              </span>
                              {isCurrent && (
                                <span className="text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full">現在</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 shrink-0">{entry.startAge}〜{entry.endAge}歳</span>
                              <span className="text-gray-500 text-xs group-open:rotate-180 transition-transform inline-block">▼</span>
                            </div>
                          </summary>

                          <div className={`mt-1 rounded-lg p-4 text-xs leading-relaxed flex flex-col gap-3 ${
                            isCurrent ? 'bg-indigo-500/8 border border-indigo-400/20' : 'bg-white/3 border border-white/8'
                          }`}>
                            {/* 星の情報 */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 pb-3 border-b border-white/10">
                              <span className="text-gray-400">天干: <span className="text-gray-200 font-medium">{entry.shusei}</span></span>
                              <span className="text-gray-400">地支: <span className="text-gray-200 font-medium">{entry.chiShusei}</span></span>
                              <span className="text-gray-400">従星: <span className="text-gray-200 font-medium">{entry.junisei}</span></span>
                            </div>

                            {/* エネルギーの質（従星） */}
                            {juniseiAdvice && (
                              <div>
                                <p className="font-bold text-white mb-1">⚡ この10年のエネルギー</p>
                                <p className="text-indigo-300">{juniseiAdvice.energy}</p>
                                <p className="text-gray-400 mt-1">{juniseiAdvice.keyword}</p>
                              </div>
                            )}

                            {/* 天干主星テーマ（表のテーマ） */}
                            {kanAdvice && (
                              <div>
                                <p className="font-bold text-white mb-1">🌟 表のテーマ（仕事・社会）— {entry.shusei}の大運</p>
                                <p className="text-yellow-300 font-medium mb-1">{kanAdvice.theme}</p>
                                <p className="text-gray-300">{kanAdvice.active}</p>
                              </div>
                            )}

                            {/* 地支主星テーマ（内面のテーマ） */}
                            {chiAdvice && entry.chiShusei !== entry.shusei && (
                              <div>
                                <p className="font-bold text-white mb-1">🔮 内側のテーマ（プライベート・内面）— {entry.chiShusei}の大運</p>
                                <p className="text-purple-300 font-medium mb-1">{chiAdvice.theme}</p>
                                <p className="text-gray-300">{chiAdvice.active}</p>
                              </div>
                            )}

                            {/* 意識すること */}
                            {kanAdvice && (
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="font-bold text-white mb-1">💡 この10年に意識すること</p>
                                <p className="text-gray-300">{kanAdvice.conscious}</p>
                                {chiAdvice && entry.chiShusei !== entry.shusei && (
                                  <p className="text-gray-400 mt-1.5">内面では：{chiAdvice.conscious}</p>
                                )}
                              </div>
                            )}

                            {isCurrent && (
                              <p className="text-indigo-400 text-xs border-t border-indigo-400/20 pt-2">
                                ✨ 今まさにあなたはこの大運の中にいます
                              </p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 有料note CTA */}
          <a
            href={NOTE_PAID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-700/40 rounded-xl p-5 hover:border-purple-500/60 transition-colors group"
          >
            <p className="text-xs tracking-widest text-purple-400 mb-2 uppercase">深く知る</p>
            <h3 className="text-sm font-bold text-white mb-1">天中殺完全ガイド（有料）</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              タイプ別の正しい過ごし方・やってはいけないこと全リスト・明けたら何をするか・鑑定データから見えた実例まで。素人でも100%わかる完全保存版。
            </p>
            <span className="inline-block text-xs font-bold text-purple-300 group-hover:text-white transition-colors">
              記事を読む →
            </span>
          </a>

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
