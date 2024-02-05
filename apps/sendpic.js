import { getFunctionData, getRandomImage,  getRandomUrl } from '../utils/getdate.js'

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]定时发图',
      dsc: '定时发图',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#?(定时发图|发图)$',
          fnc: '发图'
        }
      ]
    })
    this.task = {
      cron: this.pushConfig.time,
      name: '定时发图',
      fnc: () => this.定时发图()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get pushConfig () { return getFunctionData('push', 'setpush', '定时发图') }
  get imageConfig () { return getFunctionData('url', 'setimage', '定时发图') }

  
  // 定时任务
  async 定时发图 () {

    if (!this.pushConfig.isAutoPush) {return false}
  
    const image = this.imageConfig.Switch ? await getRandomImage() : await getRandomUrl(this.imageConfig.imageUrls); 

    logger.info(`[定时发图]开始推送……`);
    for (let i = 0; i < this.pushConfig.groupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.pushConfig.groupList[i]).sendMsg([segment.image(image)]);
      }, 1 * 1000); 
    }

    return true
  }

  async 发图 (e) {

    const image = this.imageConfig.Switch ? await getRandomImage() : await getRandomUrl(this.imageConfig.imageUrls); 
  
    e.reply([segment.image(image)]);

    return true
  }


  }





