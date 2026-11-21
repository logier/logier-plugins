#!/usr/bin/env node
// 外部依赖体检：逐个探测插件用到的接口与本地资源，输出可用性表格。
// 用法：node scripts/audit-api.mjs [--timeout 8000]
import { existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const timeoutArg = process.argv.indexOf('--timeout')
const TIMEOUT = timeoutArg > -1 ? Number(process.argv[timeoutArg + 1]) || 8000 : 8000

const ENDPOINTS = [
  { name: '60s 摸鱼日历（内置）', url: 'https://60s.viki.moe/v2/moyu', expect: 'json' },
  { name: '60s 每日新闻（内置）', url: 'https://60s.viki.moe/v2/60s', expect: 'json' },
  { name: '一言 hitokoto', url: 'https://v1.hitokoto.cn', expect: 'json' },
  { name: 'CP 生成图', url: 'https://api.xingzhige.com/API/cp_generate_2/?name1=a&name2=b&data=img', expect: 'image' },
  { name: '和风天气 GeoAPI（需 key）', url: 'https://geoapi.qweather.com/v2/city/lookup?location=beijing&key=test', expect: 'any' },
  { name: 'Bangumi 日历', url: 'https://api.bgm.tv/calendar', expect: 'json' },
]

const ASSETS = [
  'resources/font/qweather-icons.css',
  'resources/font/fonts/qweather-icons.woff2',
  'resources/img/塔罗牌.webp',
  'resources/nijitarot/0.webp',
  'data/tarot.json'
]

async function probe (endpoint) {
  const started = Date.now()
  try {
    const response = await fetch(endpoint.url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': 'logier-plugin-audit' }
    })
    const elapsed = Date.now() - started
    const type = response.headers.get('content-type') || ''
    let verdict = '可用'
    if (response.status >= 400) {
      // 4xx 说明域名与服务仍存活，只是缺少参数/key。
      verdict = response.status === 401 || response.status === 403 || response.status === 404 ? '存活（需参数/key）' : '异常'
    } else if (endpoint.expect === 'image' && !type.startsWith('image/')) {
      verdict = '返回类型不符'
    } else if (endpoint.expect === 'json' && !type.includes('json')) {
      verdict = '返回类型不符'
    }
    await response.arrayBuffer()
    return { ...endpoint, status: response.status, type, elapsed, verdict }
  } catch (error) {
    return { ...endpoint, status: 'ERR', type: '', elapsed: Date.now() - started, verdict: error.name === 'TimeoutError' ? '超时' : '不可达' }
  }
}

function checkAssets () {
  return ASSETS.map((file) => {
    const full = join(root, file)
    if (!existsSync(full)) { return { file, ok: false, size: 0 } }
    return { file, ok: true, size: statSync(full).size }
  })
}

async function main () {
  console.log(`接口体检（超时 ${TIMEOUT}ms）\n`)
  for (const endpoint of ENDPOINTS) {
    const result = await probe(endpoint)
    const status = String(result.status).padEnd(4)
    console.log(`${status} ${String(result.elapsed + 'ms').padEnd(8)} ${result.verdict.padEnd(14)} ${endpoint.name}`)
    if (result.status === 'ERR' || result.verdict === '返回类型不符') {
      console.log(`     ${endpoint.url} -> ${result.type || 'no content-type'}`)
    }
  }

  console.log('\n本地资源\n')
  let missing = 0
  for (const asset of checkAssets()) {
    if (!asset.ok) { missing++ }
    console.log(`${asset.ok ? 'OK  ' : 'MISS'} ${String(asset.size).padStart(9)} B  ${asset.file}`)
  }

  console.log(`\n结论：本地资源缺失 ${missing} 个；失效接口只影响对应可选功能，核心命令有本地兜底。`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
