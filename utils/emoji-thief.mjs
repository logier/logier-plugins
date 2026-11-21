// 表情包小偷的纯函数，便于无云崽环境测试。
export function parseEmojiList(value, max = 50) {
  let parsed;
  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const unique = [];
  for (const item of parsed) {
    if (typeof item === 'string' && item.length > 0 && item.length <= 4096 && !unique.includes(item)) {
      unique.push(item);
    }
  }
  return unique.slice(-max);
}

export function mergeEmojiList(existing, incoming, max = 50) {
  const list = parseEmojiList(existing, max);
  for (const url of incoming) {
    if (typeof url !== 'string' || !url || url.length > 4096) continue;
    if (list.includes(url)) continue;
    list.push(url);
    if (list.length > max) list.shift();
  }
  return list;
}

export function normalizeRate(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const rate = Number(value);
  return Number.isFinite(rate) ? Math.min(1, Math.max(0, rate)) : fallback;
}
