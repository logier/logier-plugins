import { getFunctionData, getRandomUrl, readAndParseYAMLNotasync } from '../utils/getdate.js'

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
  get switchConfig () { return  readAndParseYAMLNotasync('../config/config.yaml') }

  
// 定时任务
async 定时发图 () {
  if (!this.pushConfig.isAutoPush) {return false}

  logger.info(`[定时发图]开始推送……`);

  if (this.switchConfig.sendpicrandom) {
    // 如果Switch为true，获取随机图片并发送
    const image = await getRandomUrl(this.imageConfig.imageUrls);
    for (let i = 0; i < this.pushConfig.groupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.pushConfig.groupList[i]).sendMsg([segment.image(image)]);
      }, 1 * 3000); 
    }
  } else {
    // 如果Switch为false，遍历imageUrls数组并发送每一张图片
    const imageUrls = this.imageConfig.imageUrls;
    for (let i = 0; i < this.pushConfig.groupList.length; i++) {
      for (let j = 0; j < imageUrls.length; j++) {
        setTimeout(() => {
          Bot.pickGroup(this.pushConfig.groupList[i]).sendMsg([segment.image(imageUrls[j])]);
        }, j * 3000); 
      }
    }
  }

  return true
}


  async 发图 (e) {

    if (this.switchConfig.sendpicrandom) {
      // 如果Switch为true，获取随机图片并发送
      const image = await getRandomUrl(this.imageConfig.imageUrls);
          e.reply([segment.image(image)]);
    } else {
      // 如果Switch为false，遍历imageUrls数组并发送每一张图片
      const imageUrls = this.imageConfig.imageUrls;
        for (let j = 0; j < imageUrls.length; j++) {
          setTimeout(() => {
            e.reply([segment.image(imageUrls[j])]);
          }, j * 3000); 
        }
      
    }

    return true
  }


  }





