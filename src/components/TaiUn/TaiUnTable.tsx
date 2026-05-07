'use client';

import type { TaiUn } from '@/lib/sanmeigaku/taiun';

interface Props {
  taiun: TaiUn;
}

export default function TaiUnTable({ taiun }: Props) {
  const { isForward, daysToSetsu, kiunYears, kiunMonths, entries } = taiun;

  const kiunStr = kiunMonths > 0
    ? `${kiunYears}歳${kiunMonths}ヶ月`
    : `${kiunYears}歳`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 w-full">
      <h2 className="text-sm font-bold text-gray-500 mb-3 tracking-widest">大 運</h2>

      {/* メタ情報 */}
      <div className="flex gap-4 text-xs text-gray-600 mb-4 border-b border-gray-100 pb-3">
        <span>
          <span className="text-gray-400 mr-1">方向</span>
          <span className={isForward ? 'text-blue-600 font-medium' : 'text-rose-600 font-medium'}>
            {isForward ? '順行（陽年生）' : '逆行（陰年生）'}
          </span>
        </span>
        <span>
          <span className="text-gray-400 mr-1">起運</span>
          <span className="font-medium">{kiunStr}</span>
        </span>
        <span className="text-gray-400">節まで{daysToSetsu}日</span>
      </div>

      {/* 大運テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-left py-1 pr-3 font-normal whitespace-nowrap">年齢</th>
              <th className="text-center py-1 px-2 font-normal">干支</th>
              <th className="text-center py-1 px-2 font-normal whitespace-nowrap">天干主星</th>
              <th className="text-center py-1 px-2 font-normal whitespace-nowrap">地支主星</th>
              <th className="text-center py-1 px-2 font-normal whitespace-nowrap">十二従星</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.startAge}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-1.5 pr-3 text-gray-500 whitespace-nowrap">
                  {e.startAge}〜{e.endAge}歳
                </td>
                <td className="py-1.5 px-2 text-center">
                  <span className="font-bold text-gray-800 text-sm">{e.kan}</span>
                  <span className="font-bold text-gray-600 text-sm">{e.shi}</span>
                </td>
                <td className="py-1.5 px-2 text-center text-gray-700">{e.shusei}</td>
                <td className="py-1.5 px-2 text-center text-gray-700">{e.chiShusei}</td>
                <td className="py-1.5 px-2 text-center text-gray-700">{e.junisei}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
