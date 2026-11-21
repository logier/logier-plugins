// 与云崽版 utils/daily-api.mjs 保持同一数据源和输出格式。
const MOYU_API = 'https://60s.viki.moe/v2/moyu';
const NEWS_API = 'https://60s.viki.moe/v2/60s';
const MAX_NEWS = 15;

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'logier-alemonjs/0.1' },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function formatMoyu(payload: any): string | null {
  const data = payload?.data;
  if (!data?.date) return null;
  const week = data.progress?.week;
  const year = data.progress?.year;
  const lunar = data.date.lunar
    ? `${data.date.lunar.monthCN ?? ''}${data.date.lunar.dayCN ?? ''}`
    : '';
  return [
    `📅 ${data.date.gregorian} ${data.date.weekday}${lunar ? `（农历${lunar}）` : ''}`,
    week ? `本周已过 ${week.passed}/${week.total} 天，距离周末 ${data.countdown?.toWeekEnd ?? 0} 天` : '',
    year ? `今年已过 ${year.percentage}%` : '',
    '',
    `「${data.moyuQuote || '今天也要好好摸鱼'}」`
  ].filter(Boolean).join('\n');
}

export function formatNews(payload: any): string | null {
  const data = payload?.data;
  const list = Array.isArray(data?.news) ? data.news.slice(0, MAX_NEWS) : [];
  if (!list.length) return null;
  return [
    `📰 60 秒读懂世界 · ${data.date ?? ''}`,
    ...list.map((item: string, index: number) => `${index + 1}. ${item}`)
  ].join('\n');
}

export async function getMoyuText(): Promise<string | null> {
  try {
    return formatMoyu(await fetchJson(MOYU_API));
  } catch {
    return null;
  }
}

export async function getNewsText(): Promise<string | null> {
  try {
    return formatNews(await fetchJson(NEWS_API));
  } catch {
    return null;
  }
}
