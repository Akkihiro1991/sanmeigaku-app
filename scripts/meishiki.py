#!/usr/bin/env python3
"""
算命学 命式算出プログラム
干支・五行・陰占（十大主星・十二大従星）・天中殺を計算する

Usage:
    python meishiki.py                    # 対話入力
    python meishiki.py 1990 5 15          # コマンドライン
"""

import sys
from datetime import date


# =============================================================================
# 定数
# =============================================================================

KAN   = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
SHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
GOGYO = ["木", "火", "土", "金", "水"]

KAN_GOGYO = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
#             甲乙=木  丙丁=火  戊己=土  庚辛=金  壬癸=水

SHI_GOGYO = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]
#             子=水 丑=土 寅=木 卯=木 辰=土 巳=火 午=火 未=土 申=金 酉=金 戌=土 亥=水

KAN_INYO  = ["陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"]
SHI_INYO  = ["陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"]

# 蔵干（各地支に内包される天干インデックス、主蔵干が先頭）
ZOKAN: dict[int, list[int]] = {
    0:  [8],           # 子:  壬
    1:  [9, 7, 5],     # 丑:  癸・辛・己
    2:  [0, 2, 4],     # 寅:  甲・丙・戊
    3:  [1],           # 卯:  乙
    4:  [4, 9, 1],     # 辰:  戊・癸・乙
    5:  [2, 6, 4],     # 巳:  丙・庚・戊
    6:  [3, 5],        # 午:  丁・己
    7:  [5, 1, 3],     # 未:  己・乙・丁
    8:  [6, 8, 4],     # 申:  庚・壬・戊
    9:  [7],           # 酉:  辛
    10: [4, 7, 3],     # 戌:  戊・辛・丁
    11: [8, 0],        # 亥:  壬・甲
}

# 五行サイクル
_GEN = [1, 2, 3, 4, 0]  # 相生: 木→火→土→金→水→木
_OVR = [2, 3, 4, 0, 1]  # 相剋: 木→土→水→火→金→木

# 十二大従星の長生 地支（日干ごと）
_CHOSAI = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]
# 甲=亥(11) 乙=午(6) 丙=寅(2) 丁=酉(9) 戊=寅(2) 己=酉(9) 庚=巳(5) 辛=子(0) 壬=申(8) 癸=卯(3)

JUSSEI_12 = ["天貴星", "天恍星", "天南星", "天禄星", "天将星", "天堂星", "天胡星", "天極星", "天庫星", "天馳星", "天報星", "天印星"]
# 長生=天貴星 沐浴=天恍星 冠帯=天南星 臨官=天禄星 帝旺=天将星
# 衰=天堂星   病=天胡星   死=天極星   墓=天庫星   絶=天馳星   胎=天報星 養=天印星

# 天中殺（年干支の60サイクル位置 // 10）
TENCHUSATSU = [
    ("戌", "亥", "戌亥天中殺"),  # group 0: 甲子〜癸酉
    ("申", "酉", "申酉天中殺"),  # group 1: 甲戌〜癸未
    ("午", "未", "午未天中殺"),  # group 2: 甲申〜癸巳
    ("辰", "巳", "辰巳天中殺"),  # group 3: 甲午〜癸卯
    ("寅", "卯", "寅卯天中殺"),  # group 4: 甲辰〜癸丑
    ("子", "丑", "子丑天中殺"),  # group 5: 甲寅〜癸亥
]

# 納音（60サイクルを2つずつ30ペアに分割）
NAON = [
    "海中金", "炉中火", "大林木", "路傍土", "剣鋒金",
    "山頭火", "涧下水", "城頭土", "白蝋金", "楊柳木",
    "泉中水", "屋上土", "霹靂火", "松柏木", "長流水",
    "沙中金", "山下火", "平地木", "壁上土", "金箔金",
    "覆灯火", "天河水", "大驛土", "釵釧金", "桑柘木",
    "大溪水", "沙中土", "天上火", "石榴木", "大海水",
]

# 節入り概算日 (月, 日, 月支インデックス)  ※年により ±1〜2日の誤差あり
SETSU_LIST = [
    (1,  6,  1),   # 小寒  → 丑月
    (2,  4,  2),   # 立春  → 寅月  ← 算命学の年始
    (3,  6,  3),   # 啓蟄  → 卯月
    (4,  5,  4),   # 清明  → 辰月
    (5,  6,  5),   # 立夏  → 巳月
    (6,  6,  6),   # 芒種  → 午月
    (7,  7,  7),   # 小暑  → 未月
    (8,  7,  8),   # 立秋  → 申月
    (9,  8,  9),   # 白露  → 酉月
    (10, 8,  10),  # 寒露  → 戌月
    (11, 7,  11),  # 立冬  → 亥月
    (12, 7,  0),   # 大雪  → 子月
]

RISSHUN = (2, 4)  # 立春（算命学の年始）概算日


# =============================================================================
# 干支・柱の計算
# =============================================================================

def _jd(year: int, month: int, day: int) -> int:
    return date(year, month, day).toordinal() + 1_721_425


def year_kanshi(birth_year: int, birth_month: int, birth_day: int) -> tuple[int, int]:
    y = birth_year - 1 if (birth_month, birth_day) < RISSHUN else birth_year
    return (y - 4) % 10, (y - 4) % 12


def month_branch(month: int, day: int) -> int:
    b = 0
    for m, d, br in SETSU_LIST:
        if month > m or (month == m and day >= d):
            b = br
    return b


def month_kanshi(y_stem: int, m_branch: int) -> tuple[int, int]:
    offset = (m_branch - 2) % 12
    base   = (y_stem % 5) * 2 + 2
    return (base + offset) % 10, m_branch


def day_kanshi(year: int, month: int, day: int) -> tuple[int, int]:
    jd = _jd(year, month, day)
    return (jd + 49) % 10, (jd + 1) % 12


def cycle60(stem: int, branch: int) -> int:
    return (36 * stem + 25 * branch) % 60


# =============================================================================
# 陰占：十大主星・十二大従星
# =============================================================================

def jussei_10(day_stem: int, target_stem: int) -> str:
    """十大主星を返す（日干 vs 対象天干の五行・陰陽関係）。"""
    d = KAN_GOGYO[day_stem]
    t = KAN_GOGYO[target_stem]
    same = (day_stem % 2 == target_stem % 2)

    if t == d:               return "比肩" if same else "劫財"
    if _GEN[d] == t:         return "食神" if same else "傷官"
    if _OVR[d] == t:         return "偏財" if same else "正財"
    if _OVR[t] == d:         return "偏官" if same else "正官"
    return                          "偏印" if same else "印綬"  # _GEN[t] == d


def jussei_12(day_stem: int, branch: int) -> str:
    """十二大従星を返す（日干の長生位置から順/逆行で決定）。"""
    start = _CHOSAI[day_stem]
    if day_stem % 2 == 1:            # 陰干: 逆行
        offset = (start - branch) % 12
    else:                             # 陽干: 順行
        offset = (branch - start) % 12
    return JUSSEI_12[offset]


# =============================================================================
# 大運（10年運）
# =============================================================================

def _cycle60_to_kanshi(c: int) -> tuple[int, int]:
    """60サイクル位置 → (天干index, 地支index) に変換する。"""
    s = c % 10
    k = (c - 36 * s) % 60
    return s, k % 12


def _next_setsu(y: int, m: int, d: int) -> date:
    """生年月日の次の節入り日（概算）を返す。"""
    bd = date(y, m, d)
    for yr in [y, y + 1]:
        for sm, sd, _ in SETSU_LIST:
            s_date = date(yr, sm, sd)
            if s_date > bd:
                return s_date
    return date(y + 2, 2, 4)


def _prev_setsu(y: int, m: int, d: int) -> date:
    """生年月日の前の節入り日（概算）を返す。"""
    bd = date(y, m, d)
    candidates = [
        date(yr, sm, sd)
        for yr in [y - 1, y]
        for sm, sd, _ in SETSU_LIST
        if date(yr, sm, sd) < bd
    ]
    return max(candidates) if candidates else date(y - 1, 12, 7)


def calc_taiun(
    birth_year: int, birth_month: int, birth_day: int,
    year_stem: int, month_stem: int, month_branch: int, day_stem: int,
) -> dict:
    """大運を計算する（順行/逆行・起運年齢・10年ごとの干支）。"""
    is_forward = (year_stem % 2 == 0)  # 陽年=順行, 陰年=逆行

    setsu = (_next_setsu if is_forward else _prev_setsu)(birth_year, birth_month, birth_day)
    days  = abs((setsu - date(birth_year, birth_month, birth_day)).days)

    kiun_years  = days // 3
    kiun_months = (days % 3) * 4  # 余り1日=4ヶ月, 2日=8ヶ月

    m_cycle = cycle60(month_stem, month_branch)
    taiun   = []
    for i in range(1, 11):
        c = (m_cycle + i) % 60 if is_forward else (m_cycle - i) % 60
        s, b = _cycle60_to_kanshi(c)
        start = kiun_years + (i - 1) * 10
        taiun.append({
            "stem": s, "branch": b,
            "kan_star": jussei_10(day_stem, s),
            "shi_star": jussei_10(day_stem, ZOKAN[b][0]) if ZOKAN[b] else "─",
            "ju12":     jussei_12(day_stem, b),
            "start":    start,
            "end":      start + 9,
        })

    return {
        "is_forward":   is_forward,
        "days":         days,
        "kiun_years":   kiun_years,
        "kiun_months":  kiun_months,
        "taiun":        taiun,
    }


# =============================================================================
# 五行バランス
# =============================================================================

def gogyo_balance(pillars: list[tuple[int, int]]) -> dict[str, int]:
    count: dict[str, int] = {g: 0 for g in GOGYO}
    for s, b in pillars:
        count[GOGYO[KAN_GOGYO[s]]] += 1
        count[GOGYO[SHI_GOGYO[b]]] += 1
        if ZOKAN[b]:
            count[GOGYO[KAN_GOGYO[ZOKAN[b][0]]]] += 1
    return count


# =============================================================================
# 命式まとめ
# =============================================================================

def calc(year: int, month: int, day: int) -> dict:
    ys, yb = year_kanshi(year, month, day)
    mb_    = month_branch(month, day)
    ms, _  = month_kanshi(ys, mb_)
    ds, db = day_kanshi(year, month, day)

    tc1, tc2, tc_name = TENCHUSATSU[cycle60(ys, yb) // 10]
    y_cycle = cycle60(ys, yb)

    # 陰占: 天干主星（年・月）, 地支主星（全柱）, 十二大従星（全柱）
    def shi_shsei(branch: int) -> str:
        return jussei_10(ds, ZOKAN[branch][0]) if ZOKAN[branch] else "─"

    return {
        "birth":         (year, month, day),
        "year":          (ys, yb),
        "month":         (ms, mb_),
        "day":           (ds, db),
        # 天干主星（日柱は日主のため「─」）
        "kan_star": {
            "year":  jussei_10(ds, ys),
            "month": jussei_10(ds, ms),
            "day":   "─",
        },
        # 地支主星（主蔵干 vs 日干）
        "shi_star": {
            "year":  shi_shsei(yb),
            "month": shi_shsei(mb_),
            "day":   shi_shsei(db),
        },
        # 十二大従星
        "ju12": {
            "year":  jussei_12(ds, yb),
            "month": jussei_12(ds, mb_),
            "day":   jussei_12(ds, db),
        },
        "tc":            (tc1, tc2, tc_name),
        "y_cycle":       y_cycle,
        "naon":          NAON[y_cycle // 2],
        "gogyo_balance": gogyo_balance([(ys, yb), (ms, mb_), (ds, db)]),
        "taiun":         calc_taiun(year, month, day, ys, ms, mb_, ds),
    }


# =============================================================================
# 表示
# =============================================================================

def _ks(s: int, b: int) -> str:
    return KAN[s] + SHI[b]


def print_meishiki(m: dict) -> None:
    year, month, day = m["birth"]
    ys, yb = m["year"]
    ms, mb = m["month"]
    ds, db = m["day"]
    tc1, tc2, tc_name = m["tc"]
    gb  = m["gogyo_balance"]
    ks  = m["kan_star"]
    ss  = m["shi_star"]
    j12 = m["ju12"]

    SEP = "=" * 60

    print(SEP)
    print("  算命学 命式")
    print(SEP)
    print(f"  生年月日: {year}年 {month}月 {day}日")
    print()

    # ─── 陰占 命式表 ──────────────────────────────
    print("  ─── 陰占 ──────────────────────────────────────")
    print(f"            年柱      月柱      日柱")
    print(f"  天干主星: {ks['year']:４}    {ks['month']:４}    {ks['day']}")
    print(f"  天  干:   {KAN[ys]}         {KAN[ms]}         {KAN[ds]}")
    print(f"  地  支:   {SHI[yb]}         {SHI[mb]}         {SHI[db]}")
    print(f"  地支主星: {ss['year']:４}    {ss['month']:４}    {ss['day']:４}")
    print(f"  十二従星: {j12['year']:４}    {j12['month']:４}    {j12['day']:４}")
    print()

    # ─── 各柱の詳細 ──────────────────────────────
    print("  ─── 各柱の詳細 ────────────────────────────────")
    for label, s, b in [("年柱", ys, yb), ("月柱", ms, mb), ("日柱", ds, db)]:
        zk = "・".join(KAN[z] for z in ZOKAN[b])
        print(f"  {label} {_ks(s,b)}: "
              f"天干 {KAN[s]}（{KAN_INYO[s]}{GOGYO[KAN_GOGYO[s]]}）  "
              f"地支 {SHI[b]}（{SHI_INYO[b]}{GOGYO[SHI_GOGYO[b]]}）  "
              f"蔵干 [{zk}]")
    print()

    # ─── 十大主星の解説 ──────────────────────────
    stars_shown = {ks["year"], ks["month"], ss["year"], ss["month"], ss["day"]}
    stars_shown.discard("─")
    STAR_DESC = {
        "比肩": "自我・独立・意志の強さ",
        "劫財": "行動力・競争・変動",
        "食神": "才能・楽しむ力・表現",
        "傷官": "革新・芸術・反骨精神",
        "偏財": "行動的財運・交際・取引",
        "正財": "堅実な財運・管理・安定",
        "偏官": "権威・スピード・競争力",
        "正官": "規律・責任・社会的名誉",
        "偏印": "直感・独創・自由",
        "印綬": "知性・学習・保護",
    }
    if stars_shown:
        print("  ─── 主星の意味 ────────────────────────────────")
        for star in sorted(stars_shown):
            if star in STAR_DESC:
                print(f"  {star}: {STAR_DESC[star]}")
        print()

    # ─── 天中殺 ──────────────────────────────────
    print("  ─── 天中殺 ────────────────────────────────────")
    print(f"  {tc_name}")
    print(f"  空亡地支: {tc1}（{GOGYO[SHI_GOGYO[SHI.index(tc1)]]}）・"
          f"{tc2}（{GOGYO[SHI_GOGYO[SHI.index(tc2)]]}）")
    print(f"  → {tc1}年・{tc2}年、{tc1}月・{tc2}月が天中殺期間")
    print()

    # ─── 五行バランス ─────────────────────────────
    print("  ─── 五行バランス ──────────────────────────────")
    total     = sum(gb.values()) or 1
    max_count = max(gb.values()) or 1
    for g in GOGYO:
        cnt = gb[g]
        bar = "█" * round(cnt / max_count * 15)
        print(f"  {g}: {bar:<15s} {cnt}点  ({cnt/total*100:.0f}%)")
    print(f"  → 旺じる五行: {max(gb, key=gb.get)}   "
          f"不足する五行: {min(gb, key=gb.get)}")
    print()

    # ─── 大運 ────────────────────────────────────
    tu = m["taiun"]
    direction = "順行" if tu["is_forward"] else "逆行"
    kiun = tu["kiun_years"]
    km   = tu["kiun_months"]
    kiun_str = f"{kiun}歳" + (f"{km}ヶ月" if km else "")
    print("  ─── 大運（10年運）─────────────────────────────")
    print(f"  方向: {direction}  起運: {kiun_str}  "
          f"（節まで {tu['days']}日）")
    print()
    print(f"  {'年齢':^8}  {'干支':^4}  {'天干主星':^4}  {'地支主星':^4}  {'十二従星':^4}")
    print(f"  {'─'*8}  {'─'*4}  {'─'*6}  {'─'*6}  {'─'*6}")
    birth_year = m["birth"][0]
    for t in tu["taiun"]:
        age_str  = f"{t['start']}〜{t['end']}歳"
        ks_str   = _ks(t["stem"], t["branch"])
        print(f"  {age_str:^10}  {ks_str}    {t['kan_star']:４}    {t['shi_star']:４}    {t['ju12']:４}")
    print()

    # ─── 納音 ────────────────────────────────────
    print(f"  ─── 納音: {m['naon']}（年柱 {_ks(ys,yb)} の音）")
    print()
    print("  ※ 月柱・年柱の節入り日は概算値（±1〜2日の誤差あり）")
    print(SEP)


# =============================================================================
# エントリーポイント
# =============================================================================

def main() -> None:
    args = sys.argv[1:]

    if len(args) >= 3:
        year, month, day = int(args[0]), int(args[1]), int(args[2])
    else:
        print("算命学 命式算出プログラム")
        print("-" * 30)
        year  = int(input("生年 (例: 1990): ").strip())
        month = int(input("生月 (1〜12):    ").strip())
        day   = int(input("生日 (1〜31):    ").strip())
        print()

    try:
        date(year, month, day)
    except ValueError as e:
        print(f"エラー: 無効な日付です ({e})")
        sys.exit(1)

    print_meishiki(calc(year, month, day))


if __name__ == "__main__":
    main()
