#!/usr/bin/env python3
"""
算命学鑑定ブリッジ

使い方:
    python bridge.py 1991 3 25
    ANTHROPIC_API_KEY=sk-... python bridge.py 1991 3 25
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))

import anthropic
from meishiki import calc, KAN, SHI, GOGYO, KAN_GOGYO


# --------------------------------------------------------------------------- #
# 干支算出（既存 calc のラッパー）
# --------------------------------------------------------------------------- #

def get_kanchi(year: int, month: int, day: int) -> dict:
    """生年月日 → 命式データ（干支・天中殺・大運など）を返す。"""
    return calc(year, month, day)


# --------------------------------------------------------------------------- #
# プロンプト生成
# --------------------------------------------------------------------------- #

def _build_prompt(kanchi: dict) -> str:
    ys, yb = kanchi["year"]
    ms, mb = kanchi["month"]
    ds, db = kanchi["day"]
    _, _, tc_name = kanchi["tc"]
    gb = kanchi["gogyo_balance"]

    gogyo_str = "・".join(f"{g}:{v}点" for g, v in gb.items())

    return f"""\
あなたはプロの算命学鑑定士です。
以下の命式データをもとに、十大主星・十二大従星・守護神・2026年の運勢を判定し、
**JSONのみ** で返してください（前置き・説明・コードブロック不要）。

【命式】
年柱: {KAN[ys]}{SHI[yb]}　月柱: {KAN[ms]}{SHI[mb]}　日柱: {KAN[ds]}{SHI[db]}
日干: {KAN[ds]}（{GOGYO[KAN_GOGYO[ds]]}）
天中殺: {tc_name}
五行バランス: {gogyo_str}

【出力形式（JSON）】
{{
  "shusei": {{
    "target": "日柱の十大主星名（算命学の星名）",
    "meaning": "その星が示す宿命・性格の解説（100字以内）"
  }},
  "junisei": {{
    "target": "日柱の十二大従星名（算命学の星名）",
    "energy": "エネルギー点数（1〜10の整数）",
    "meaning": "その従星が示すエネルギー傾向・生き方の解説（100字以内）"
  }},
  "guardian_deity": "守護神となる五行・天干・その象徴（例: 金性・庚辛・秋の鉄）",
  "fortune_2026": "ビジネス運を中心とした2026年の戦略アドバイス（150字以内）",
  "visual_prompt": "この人の宿命を象徴する風景の画像生成プロンプト（英語・50語以内）"
}}"""


# --------------------------------------------------------------------------- #
# Claude API 呼び出し
# --------------------------------------------------------------------------- #

def generate_reading(kanchi: dict, model: str = "claude-sonnet-4-6") -> dict:
    """
    命式データを受け取り、Claude API で鑑定 JSON を返す。

    Args:
        kanchi: get_kanchi() の戻り値
        model:  使用するモデル（デフォルト: claude-sonnet-4-6）

    Returns:
        鑑定結果の dict
    """
    client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 環境変数から読む

    prompt = _build_prompt(kanchi)

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # ```json ... ``` ブロックがあれば中身だけ取り出す
    m = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", raw)
    if m:
        raw = m.group(1)

    return json.loads(raw)


# --------------------------------------------------------------------------- #
# CLI エントリーポイント
# --------------------------------------------------------------------------- #

def main() -> None:
    args = sys.argv[1:]
    if len(args) < 3:
        print("使い方: python bridge.py 年 月 日")
        print("例:     python bridge.py 1991 3 25")
        sys.exit(1)

    year, month, day = int(args[0]), int(args[1]), int(args[2])

    print(f"命式算出中: {year}年{month}月{day}日 ...", flush=True)
    kanchi = get_kanchi(year, month, day)

    ys, yb = kanchi["year"]
    ms, mb = kanchi["month"]
    ds, db = kanchi["day"]
    print(f"年柱: {KAN[ys]}{SHI[yb]}  月柱: {KAN[ms]}{SHI[mb]}  日柱: {KAN[ds]}{SHI[db]}")
    print("鑑定中 (Claude API) ...", flush=True)

    result = generate_reading(kanchi)

    print("\n── 鑑定結果 ─────────────────────────────────")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
