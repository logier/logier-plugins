import { getemoji } from '../utils/getdate.js'
import setting from '../model/setting.js'
import { listsEqual, mergeEmojiList, parseEmojiList, normalizeRate } from '../utils/emoji-thief.mjs'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]表情包小偷',
      dsc: '表情包小偷',
      event: 'message',
      priority: 9999,
      rule: [
        {
          reg: '',
          fnc: '表情包小偷',
          log: false
        }
      ]
    })
  }

  get appconfig () {
    return setting.getConfig('EmojiThief')
  }

  async 表情包小偷 (e) {
    // 私聊没有群配置和群缓存键，避免意外混用。
    if (!e.group_id || !Array.isArray(e.message)) return false

    const config = this.appconfig ?? {}
    // 配置文件中长期使用 Defalut* 拼写，旧代码读取 Default* 必然得到 undefined，
    // 导致概率判断永远不成立；这里同时兼容两种拼写，已有配置无需迁移。
    let rate = normalizeRate(config.DefaultReplyRate ?? config.DefalutReplyRate)
    let emojiRate = normalizeRate(config.DefaultEmojiRate ?? config.DefalutEmojiRate)
    const overrides = Array.isArray(config.ETGroupRate) ? config.ETGroupRate : []
    if (overrides.length) {
      const group = overrides.find(item =>
        Array.isArray(item?.groupList) && item.groupList.some(id => String(id) === String(e.group_id)))
      if (!group) return false
      rate = normalizeRate(group.rate ?? group.ReplyRate, rate)
      emojiRate = normalizeRate(group.EmojiRate ?? group.DefaultEmojiRate, emojiRate)
    }

    const images = e.message
      .filter(item => item?.asface && typeof item.url === 'string')
      .map(item => item.url)

    // 既不记录也不回复时，完全不需要访问 Redis。
    if (!images.length && rate <= 0) return false

    const key = `Yunzai:EmojiThief:${e.group_id}_EmojiThief`
    let stored = []
    let readFailed = false
    try {
      stored = parseEmojiList(await redis.get(key))
    } catch (error) {
      readFailed = true
      logger.error(`[表情包小偷]Redis数据库出错: ${error}`)
    }

    // 读取失败时不要写回，否则会用空列表覆盖原数据。
    if (images.length && !readFailed) {
      try {
        // 一条消息只进行一次读-改-写，避免逐条 await 时的并发覆盖。
        const updated = mergeEmojiList(stored, images)
        if (!listsEqual(stored, updated)) {
          await redis.set(key, JSON.stringify(updated))
          stored = updated
          logger.info(`[表情包小偷]记录了${images.length}张表情包`)
        }
      } catch (error) {
        logger.error(`[表情包小偷]Redis数据库出错: ${error}`)
      }
    }

    if (Math.random() >= rate) return false
    try {
      let emojiUrl
      let fromCache = false
      // 随机值达到阈值时优先复用群友的表情包，否则访问表情包仓库。
      if (stored.length && Math.random() >= emojiRate) {
        emojiUrl = stored[Math.floor(Math.random() * stored.length)]
        fromCache = true
      }
      if (!emojiUrl) emojiUrl = await getemoji(e, config.ETEmojihubCategory)
      if (!emojiUrl) return false

      if (!fromCache) {
        await e.reply([segment.image(emojiUrl)])
        return false
      }

      try {
        await e.reply([segment.image(emojiUrl)])
      } catch (error) {
        // QQ 图片链接带有时效性的 rkey，缓存的表情包可能已经过期。
        // 发送失败时删除过期链接，并改用表情包仓库兜底。
        logger.info(`[表情包小偷]缓存图片已失效，改用表情包仓库: ${error}`)
        stored = stored.filter(url => url !== emojiUrl)
        try {
          await redis.set(key, JSON.stringify(stored))
        } catch (writeError) {
          logger.error(`[表情包小偷]清理过期表情包失败: ${writeError}`)
        }
        const fresh = await getemoji(e, config.ETEmojihubCategory)
        if (fresh) await e.reply([segment.image(fresh)])
      }
    } catch (error) {
      logger.error(`[表情包小偷]表情包发送失败: ${error}`)
    }
    return false
  }
}
