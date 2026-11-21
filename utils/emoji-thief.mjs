// 表情包小偷的纯函数，便于无云崽环境测试。
const MAX_URL_LENGTH = 4096
const DEFAULT_LIMIT = 50

function normalizeLimit (max) {
  return Number.isSafeInteger(max) && max > 0 ? max : DEFAULT_LIMIT
}

export function parseEmojiList (value, max = DEFAULT_LIMIT) {
  const limit = normalizeLimit(max)
  let parsed
  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const seen = new Set()
  const unique = []
  for (const item of parsed) {
    if (typeof item !== 'string' || !item || item.length > MAX_URL_LENGTH || seen.has(item)) continue
    seen.add(item)
    unique.push(item)
  }
  return unique.slice(-limit)
}

export function mergeEmojiList (existing, incoming, max = DEFAULT_LIMIT) {
  const limit = normalizeLimit(max)
  const list = parseEmojiList(existing, limit)
  if (!Array.isArray(incoming)) return list

  // Set 与列表同步维护，避免每加入一条都重新 includes 造成 O(n²)。
  const seen = new Set(list)
  for (const url of incoming) {
    if (typeof url !== 'string' || !url || url.length > MAX_URL_LENGTH || seen.has(url)) continue
    seen.add(url)
    list.push(url)
    if (list.length > limit) seen.delete(list.shift())
  }
  return list
}

/** 判断两个列表是否完全一致，用于跳过无变化的 Redis 写入。 */
export function listsEqual (a, b) {
  return Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length && a.every((item, index) => item === b[index])
}

export function normalizeRate (value, fallback = 0) {
  const base = Number(fallback)
  const safeFallback = Number.isFinite(base) ? Math.min(1, Math.max(0, base)) : 0
  if (value === null || value === undefined || value === '') return safeFallback
  const rate = Number(value)
  return Number.isFinite(rate) ? Math.min(1, Math.max(0, rate)) : safeFallback
}
