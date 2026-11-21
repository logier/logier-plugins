import test from 'node:test'
import assert from 'node:assert/strict'
import { formatMoyu, formatNews } from '../utils/daily-api.mjs'

const moyuPayload = {
  code: 200,
  data: {
    date: {
      gregorian: '2026-11-21',
      weekday: '星期六',
      lunar: { monthCN: '十月', dayCN: '十三' }
    },
    progress: {
      week: { passed: 6, total: 7, remaining: 1, percentage: 86 },
      year: { passed: 325, total: 365, remaining: 40, percentage: 89 }
    },
    countdown: { toWeekEnd: 0, toFriday: 6 },
    moyuQuote: '别人上班赚工资，我上班只为摸鱼。'
  }
}

test('formatMoyu renders date, progress and quote', () => {
  const text = formatMoyu(moyuPayload)
  assert.match(text, /2026-11-21 星期六/)
  assert.match(text, /农历十月十三/)
  assert.match(text, /本周已过 6\/7 天/)
  assert.match(text, /今年已过 89%/)
  assert.match(text, /别人上班赚工资/)
})

test('formatMoyu returns null for malformed payloads', () => {
  assert.equal(formatMoyu(null), null)
  assert.equal(formatMoyu({}), null)
  assert.equal(formatMoyu({ data: {} }), null)
})

test('formatNews caps at 15 items and tolerates missing data', () => {
  const news = Array.from({ length: 20 }, (_, i) => `新闻 ${i + 1}`)
  const text = formatNews({ data: { date: '2026-11-21', news } })
  assert.match(text, /60 秒读懂世界 · 2026-11-21/)
  assert.match(text, /1\. 新闻 1/)
  assert.match(text, /15\. 新闻 15/)
  assert.doesNotMatch(text, /16\. 新闻 16/)

  assert.equal(formatNews({ data: { news: [] } }), null)
  assert.equal(formatNews(null), null)
})
