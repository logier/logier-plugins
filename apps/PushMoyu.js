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
      cron: this.moyuConfig.PushTime,
      name: '推送摸鱼日历',
      fnc: () => this.推送摸鱼日历(),
      log: false
    },
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get moyuConfig () { return getFunctionData('API', 'API', '摸鱼日历') }

  // 定时任务
  async 推送摸鱼日历 () {
    if (!this.moyuConfig.isAutoPush) { return false }

    logger.info('[摸鱼日历]开始推送……')
    let imageUrl = await getImageUrl(this.moyuConfig.SourceUrl)

    for (let i = 0; i < this.moyuConfig.PushGroupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.moyuConfig.PushGroupList[i]).sendMsg([segment.image(imageUrl)])
      }, 1 * 1000)
    }

    return true
  }

  async 摸鱼日历 (e) {
    let imageUrl = await getImageUrl(this.moyuConfig.SourceUrl)
    // let fetchUrl= await getImageUrl(this.moyuConfig.SourceUrl).catch(err => logger.error(err));
    // let imageUrl = await fetchUrl.json();
    //  imageUrl = await imageUrl.img;

    // 判断是否为 Base64 图片
    if (imageUrl.startsWith('data:image/') && imageUrl.includes(';base64,')) {
      // 如果是 Base64 图片 也发不出去

      e.reply([segment.image(imageUrl)]) // 直接发送 Base64 图片
    } else {
      // 如果不是 Base64 图片
      e.reply([segment.image(imageUrl)]) // 直接发送普通图片
    }

    return true
  }
}
