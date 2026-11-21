import { getemoji } from '../utils/getdate.js'
import setting from '../model/setting.js'
import { mergeEmojiList, parseEmojiList, normalizeRate } from '../utils/emoji-thief.mjs'

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
    // 导致概率判断永远不成立；这里同时兼容两种拼写。
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

    const key = `Yunzai:EmojiThief:${e.group_id}_EmojiThief`
    const images = e.message
      .filter(item => item?.asface && typeof item.url === 'string')
      .map(item => item.url)

    if (images.length) {
      try {
        // 一条消息只进行一次读-改-写，避免逐条 await 时的并发覆盖。
        const previous = await redis.get(key)
        const updated = mergeEmojiList(previous, images)
        if (JSON.stringify(updated) !== JSON.stringify(parseEmojiList(previous))) {
          await redis.set(key, JSON.stringify(updated))
          logger.info(`[表情包小偷]记录了${images.length}张表情包`)
        }
      } catch (error) {
        logger.error(`[表情包小偷]Redis数据库出错: ${error}`)
      }
    }

    if (Math.random() >= rate) return false
    try {
      const stored = parseEmojiList(await redis.get(key))
      let emojiUrl
      if (stored.length && Math.random() >= emojiRate) {
        emojiUrl = stored[Math.floor(Math.random() * stored.length)]
      }
      // 有缓存命中时无需再访问表情包仓库。
      if (!emojiUrl) emojiUrl = await getemoji(e, config.ETEmojihubCategory)
      if (emojiUrl) await e.reply([segment.image(emojiUrl)])
    } catch (error) {
      logger.error(`[表情包小偷]表情包发送失败: ${error}`)
    }
    return false
  }
}
