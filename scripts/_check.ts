import { calcMeisei } from '../src/lib/sanmeigaku/insen';
import { calcYosen } from '../src/lib/sanmeigaku/yosen';
import { calcStrongHonno } from '../src/lib/sanmeigaku/yosenDisplay';
for (const d of process.argv.slice(2)) {
  const [y,m,dd] = d.split('-').map(Number);
  const me = calcMeisei(y,m,dd); const yo = calcYosen(me);
  const p = (c: {kan:string;shi:string}) => c.kan + c.shi;
  console.log(d, `日${p(me.nitchu)} 月${p(me.getchu)} 年${p(me.nenchu)} 節入${me.daysFromSetsu}日目`,
    `| 北${yo.kita.sei} 西${yo.nishi.sei} 中${yo.chuo.sei} 東${yo.higashi.sei} 南${yo.minami.sei}`,
    `| ${yo.kitahigashi.junisei} ${yo.minamihigashi.junisei} ${yo.minamishi.junisei} | ${yo.shinkyoBun} ${calcStrongHonno(yo)}`);
}
