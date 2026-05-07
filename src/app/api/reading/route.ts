import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { calcMeisei } from '@/lib/sanmeigaku/insen';
import { calcTaiUn } from '@/lib/sanmeigaku/taiun';
import { calcTenchusatsu } from '@/lib/sanmeigaku/tenchusatsu';

const GOGYO_KAN: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

export interface ReadingResponse {
  shusei: { target: string; meaning: string };
  junisei: { target: string; energy: number; meaning: string };
  guardian_deity: string;
  daily_energy: string;
  daily_advice: string;
  target_date: string;
  visual_prompt: string;
}

function buildPrompt(
  birthYear: number, birthMonth: number, birthDay: number,
  nenchu: { kan: string; shi: string },
  getchu: { kan: string; shi: string },
  nitchu: { kan: string; shi: string },
  tenchusatsu: string,
  taiun: { kan: string; shi: string; startAge: number; endAge: number }[],
  targetYear: number, targetMonth: number, targetDay: number,
  targetNitchu: { kan: string; shi: string },
): string {
  const taiUnLines = taiun.slice(0, 3).map(
    (t) => `  ${t.startAge}〜${t.endAge}歳: ${t.kan}${t.shi}`,
  ).join('\n');

  const targetDateStr = `${targetYear}年${targetMonth}月${targetDay}日`;

  return `あなたはプロの算命学鑑定士です。
以下の命式データと選択された日付をもとに鑑定し、**JSONのみ** で返してください（前置き・説明・コードブロック不要）。
算命学の定義に基づき、四柱推命の「十二運」や「通変星」との混同を避けること。
十大主星は算命学固有の星名（貫索星・石門星・鳳閣星・調舒星・禄存星・司禄星・車騎星・牽牛星・龍高星・玉堂星）を使用すること。
十二大従星は算命学固有の星名（天貴星・天恍星・天南星・天禄星・天将星・天堂星・天胡星・天極星・天庫星・天馳星・天報星・天印星）を使用すること。

【命式（生年月日: ${birthYear}年${birthMonth}月${birthDay}日）】
年柱: ${nenchu.kan}${nenchu.shi}
月柱: ${getchu.kan}${getchu.shi}
日柱: ${nitchu.kan}${nitchu.shi}（日干: ${nitchu.kan}・${GOGYO_KAN[nitchu.kan] ?? ''}）
天中殺: ${tenchusatsu}
大運（直近3運）:
${taiUnLines}

【選択日】
日付: ${targetDateStr}
選択日の日干支: ${targetNitchu.kan}${targetNitchu.shi}

【出力形式（JSON）】
{
  "shusei": {
    "target": "日干から見た命式全体の中心となる十大主星名",
    "meaning": "その星が示す宿命・性格の解説（80字以内）"
  },
  "junisei": {
    "target": "日支の十二大従星名",
    "energy": エネルギー点数（1〜10の整数）,
    "meaning": "その従星が示すエネルギー傾向の解説（80字以内）"
  },
  "guardian_deity": "守護神となる五行・天干・その象徴（例: 金性・庚辛・秋の鉄）",
  "daily_energy": "${targetDateStr}のこの人の運気の周り方（選択日の日干支と命式の関係をもとに200字以内で解説）",
  "daily_advice": "${targetDateStr}にすると良いこと・避けるべきこと（具体的なアドバイスを150字以内）",
  "visual_prompt": "この人の宿命を象徴する風景の画像生成プロンプト（英語・50語以内）"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const {
      year, month, day,
      targetYear, targetMonth, targetDay,
    } = await req.json() as {
      year: number; month: number; day: number;
      targetYear?: number; targetMonth?: number; targetDay?: number;
    };

    if (!year || !month || !day) {
      return NextResponse.json({ error: '年・月・日は必須です' }, { status: 400 });
    }

    const now = new Date();
    const resolvedTargetYear  = targetYear  ?? now.getFullYear();
    const resolvedTargetMonth = targetMonth ?? (now.getMonth() + 1);
    const resolvedTargetDay   = targetDay   ?? now.getDate();

    const meisei = calcMeisei(year, month, day);
    const taiun  = calcTaiUn(meisei, year, month, day);
    const tc     = calcTenchusatsu(meisei.nichikanIndex, meisei.nichishiIndex);

    // 選択日の日干支を算出
    const targetMeisei = calcMeisei(resolvedTargetYear, resolvedTargetMonth, resolvedTargetDay);
    const targetNitchu = targetMeisei.nitchu;

    const prompt = buildPrompt(
      year, month, day,
      meisei.nenchu, meisei.getchu, meisei.nitchu,
      tc.name,
      taiun.entries,
      resolvedTargetYear, resolvedTargetMonth, resolvedTargetDay,
      targetNitchu,
    );

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : raw;
    const reading = JSON.parse(jsonStr) as Omit<ReadingResponse, 'target_date'>;

    const targetDateStr = `${resolvedTargetYear}年${resolvedTargetMonth}月${resolvedTargetDay}日`;
    return NextResponse.json({ ...reading, target_date: targetDateStr });
  } catch (err) {
    console.error('[/api/reading]', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
