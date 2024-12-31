import { getemoji } from '../utils/getdate.js'
import setting from '../model/setting.js'

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
    let rate = this.appconfig.DefaultReplyRate // 默认概率
    let EmojiRate = this.appconfig.DefaultEmojiRate
    let groupMatched = false

    // 如果 ETGroupRate 配置存在且不为空
    if (this.appconfig.ETGroupRate && this.appconfig.ETGroupRate.length > 0) {
      for (let config of this.appconfig.ETGroupRate) {
        // 确保 config.groupList 是数组，以避免 undefined 的情况
        if (Array.isArray(config.groupList) && config.groupList.includes(e.group_id)) {
          rate = config.rate
          EmojiRate = config.EmojiRate
          groupMatched = true
          break
        }
      }
      // 如果没有匹配到任何组，直接返回
      if (!groupMatched) return false
    }

    let key = `Yunzai:EmojiThief:${e.group_id}_EmojiThief`

    // 处理消息的每一项
    for (const item of e.message) {
      if (item.asface) {
        try {
          let listStr = await redis.get(key)
          let list = listStr ? JSON.parse(listStr) : []
          if (!list.includes(item.url)) {
            logger.info('[表情包小偷]偷取表情包')
            list.push(item.url)
            if (list.length > 50) {
              list.shift()
            }
            await redis.set(key, JSON.stringify(list))
          }
        } catch (error) {
          logger.error(`[表情包小偷]Redis数据库出错: ${error}`)
        }
      }
    }

    // 发送表情包的概率判断
    if (Math.random() < rate) {
      try {
        let emojiUrl = await getemoji(e, this.appconfig.ETEmojihubCategory)
        let listStr = await redis.get(key)

        // 只有在获取到 listStr 的情况下才继续
        if (listStr && Math.random() >= Number(EmojiRate)) {
          let list = JSON.parse(listStr)
          if (Array.isArray(list) && list.length) {
            let randomIndex = Math.floor(Math.random() * list.length)
            emojiUrl = list[randomIndex]
          }
        }
        logger.info(`[鸢尾花插件] 发送表情包: ${emojiUrl}`)
        e.reply([segment.image(emojiUrl)])
      } catch (error) {
        logger.error(`[表情包小偷]表情包发送失败: ${error}`)
      }
    }

    return false
  }
}
