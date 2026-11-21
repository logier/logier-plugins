import https from 'node:https'
import { readFileSync } from 'node:fs'

// 内置的每日数据接口（开源项目 60s API，返回 JSON，不依赖图片图床）。
// 这样摸鱼日历/日报在默认配置下也能离线于第三方图床失效而工作。
export const MOYU_API = 'https://60s.viki.moe/v2/moyu'
export const NEWS_API = 'https://60s.viki.moe/v2/60s'

// 接口不可用时的本地兜底（随仓库分发，避免完全离线时无内容）。
const FALLBACK_FILE = new URL('../data/daily-fallback.json', import.meta.url)
const MAX_NEWS = 15
let fallbackCache

export function fetchJson (url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'logier-plugin/1.2' } }, (response) => {
      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => { raw += chunk })
      response.on('end', () => {
        try {
          resolve(JSON.parse(raw))
        } catch (error) {
          reject(new Error(`响应不是合法 JSON: ${error.message}`))
        }
      })
    })
    request.setTimeout(timeoutMs, () => request.destroy(new Error('请求超时')))
    request.on('error', reject)
  })
}

export function formatMoyu (payload) {
  const data = payload?.data
  if (!data?.date) { return null }
  const week = data.progress?.week
  const year = data.progress?.year
  const lunar = data.date.lunar ? `${data.date.lunar.monthCN ?? ''}${data.date.lunar.dayCN ?? ''}` : ''
  return [
    `📅 ${data.date.gregorian} ${data.date.weekday}${lunar ? `（农历${lunar}）` : ''}`,
    week ? `本周已过 ${week.passed}/${week.total} 天，距离周末 ${data.countdown?.toWeekEnd ?? 0} 天` : '',
    year ? `今年已过 ${year.percentage}%` : '',
    '',
    `「${data.moyuQuote || '今天也要好好摸鱼'}」`
  ].filter(Boolean).join('\n')
}

export function formatNews (payload) {
  const data = payload?.data
  const list = Array.isArray(data?.news) ? data.news.slice(0, MAX_NEWS) : []
  if (!list.length) { return null }
  return [`📰 60 秒读懂世界 · ${data.date ?? ''}`, ...list.map((item, index) => `${index + 1}. ${item}`)].join('\n')
}

function readFallback (kind) {
  try {
    if (!fallbackCache) { fallbackCache = JSON.parse(readFileSync(FALLBACK_FILE, 'utf8')) }
    return fallbackCache?.[kind] ?? null
  } catch { return null }
}

async function loadDaily (kind, url, formatter) {
  try {
    const text = formatter(await fetchJson(url))
    if (text) { return text }
  } catch { /* 接口不可用时使用本地兜底 */ }
  const cached = readFallback(kind)
  return cached ? formatter(cached) : null
}

export async function getMoyuText () {
  return loadDaily('moyu', MOYU_API, formatMoyu)
}

export async function getNewsText () {
  return loadDaily('news', NEWS_API, formatNews)
}
