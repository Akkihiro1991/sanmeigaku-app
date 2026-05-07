import { GOGYO_SHI } from './constants';

const TC_LIST = [
  { shi1: '戌', shi2: '亥', name: '戌亥天中殺' },
  { shi1: '申', shi2: '酉', name: '申酉天中殺' },
  { shi1: '午', shi2: '未', name: '午未天中殺' },
  { shi1: '辰', shi2: '巳', name: '辰巳天中殺' },
  { shi1: '寅', shi2: '卯', name: '寅卯天中殺' },
  { shi1: '子', shi2: '丑', name: '子丑天中殺' },
] as const;

export interface Tenchusatsu {
  name: string;
  voidShi1: string;
  voidShi2: string;
  voidGogyo1: string;
  voidGogyo2: string;
  cycle60: number;
}

export function calcTenchusatsu(kanIndex: number, shiIndex: number): Tenchusatsu {
  const cycle60 = (36 * kanIndex + 25 * shiIndex) % 60;
  const { shi1, shi2, name } = TC_LIST[Math.floor(cycle60 / 10)];
  return {
    name,
    voidShi1: shi1,
    voidShi2: shi2,
    voidGogyo1: GOGYO_SHI[shi1 as keyof typeof GOGYO_SHI] ?? '',
    voidGogyo2: GOGYO_SHI[shi2 as keyof typeof GOGYO_SHI] ?? '',
    cycle60,
  };
}
