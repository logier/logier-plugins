import { getFunctionData, getImageUrl } from '../utils/getdate.js'

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
      cron: this.moyuConfig.PushTime || '0 8 * * *',
      name: '推送摸鱼日历',
      fnc: () => this.推送摸鱼日历(),
      log: false
    },
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get moyuConfig () { return getFunctionData('API', 'API', '摸鱼日历') ?? {} }

  // 定时任务
  async 推送摸鱼日历 () {
    if (!this.moyuConfig.isAutoPush) { return false }
    if (!this.moyuConfig.SourceUrl) {
      logger.error('[摸鱼日历]未配置 SourceUrl，跳过推送')
      return false
    }

    logger.info('[摸鱼日历]开始推送……')
    const imageUrl = await getImageUrl(this.moyuConfig.SourceUrl)
    if (!imageUrl) {
      logger.error('[摸鱼日历]获取图片失败，跳过推送')
      return false
    }

    const groups = Array.isArray(this.moyuConfig.PushGroupList) ? this.moyuConfig.PushGroupList : []
    for (let i = 0; i < groups.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(groups[i]).sendMsg([segment.image(imageUrl)])
      }, 1 * 1000)
    }

    return true
  }

  async 摸鱼日历 (e) {
    const imageUrl = await getImageUrl(this.moyuConfig.SourceUrl)
    if (!imageUrl) {
      await e.reply('获取摸鱼日历失败，请稍后再试')
      return false
    }

    await e.reply([segment.image(imageUrl)])
    return true
  }
}
