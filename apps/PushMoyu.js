import { getFunctionData, getImageUrl } from '../utils/getdate.js'
import { getMoyuText } from '../utils/daily-api.mjs'

export class example extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]摸鱼日历',
      dsc: '获取摸鱼日历',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(摸鱼日历|摸鱼)$',
          fnc: '摸鱼日历'
        }
      ]
    })
    this.task = {
      // 老配置可能没有 PushTime，缺省时退回每天 08:00，避免插件加载失败。
      cron: this.moyuConfig.PushTime || '0 0 8 * * *',
      name: '推送摸鱼日历',
      fnc: () => this.推送摸鱼日历(),
      log: false
    },
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get moyuConfig () { return getFunctionData('API', 'API', '摸鱼日历') ?? {} }

  // 优先使用内置 JSON 接口生成文字日历；不可用时退回用户配置的图片 API。
  async 获取内容 () {
    try {
      const text = await getMoyuText()
      if (text) { return { text } }
    } catch (error) {
      logger.error(`[摸鱼日历]内置接口失败: ${error}`)
    }

    const source = this.moyuConfig.SourceUrl
    if (source) {
      const imageUrl = await getImageUrl(source).catch(() => null)
      if (imageUrl) { return { imageUrl } }
    }
    return null
  }

  async 推送摸鱼日历 () {
    if (!this.moyuConfig.isAutoPush) { return false }

    const groups = Array.isArray(this.moyuConfig.PushGroupList) ? this.moyuConfig.PushGroupList : []
    if (!groups.length) {
      logger.info('[摸鱼日历]未配置推送群，跳过推送')
      return false
    }

    const content = await this.获取内容()
    if (!content) {
      logger.error('[摸鱼日历]没有可用的内容，跳过推送')
      return false
    }

    logger.info('[摸鱼日历]开始推送……')
    for (let i = 0; i < groups.length; i++) {
      setTimeout(() => {
        const message = content.text ? [content.text] : [segment.image(content.imageUrl)]
        Bot.pickGroup(groups[i]).sendMsg(message)
      }, 1 * 1000)
    }

    return true
  }

  async 摸鱼日历 (e) {
    const content = await this.获取内容()
    if (!content) {
      await e.reply('获取摸鱼日历失败，请稍后再试或配置可用的图片 API')
      return false
    }

    await e.reply(content.text ?? [segment.image(content.imageUrl)])
    return true
  }
}
