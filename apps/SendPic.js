import { getFunctionData, getRandomUrl } from '../utils/getdate.js'
import setting from "../model/setting.js";
import common from '../../../lib/common/common.js' 

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
      cron: this.PushConfig.PushTime,
      name: '定时发图',
      fnc: () => this.定时发图()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get PushConfig () { return getFunctionData('Push', 'Push', '定时发图') }
  get UrlsConfig () { return getFunctionData('Urls', 'Urls', '定时发图') }

  get appconfig () {
    return setting.getConfig("Config");
  }

// 定时任务
async 定时发图 (e) {
  if (!this.PushConfig.isAutoPush) {return false}

  logger.info(`[定时发图]开始推送……`);


  if (this.appconfig.SendPicRandom) {
    // 如果Switch为true，获取随机图片并发送
    const image = await getRandomUrl(this.UrlsConfig.imageUrls);
    for (let i = 0; i < this.PushConfig.PushGroupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.PushConfig.PushGroupList[i]).sendMsg([segment.image(image)]);
      }, i * 3000); 
    }
  } else {
    // 如果Switch为false，遍历imageUrls数组并发送每一张图片
    const imageUrls = this.UrlsConfig.imageUrls;
    for (let i = 0; i < this.PushConfig.PushGroupList.length; i++) {
      const forward = []
      for (let j = 0; j < imageUrls.length; j++) {
        forward.push(segment.image(imageUrls[j]));
      }
      e = {"app":"com.tencent.imagetextbot","desc":"","bizsrc":"","view":"index","ver":"1.0.0.14","prompt":"[图转卡]","appID":"","sourceName":"","actionData":"","actionData_A":"","sourceUrl":"","meta":{"robot":{"cover":"https:\/\/api.mrgnb.cn\/api\/tz.php?url=https:\/\/gchat.qpic.cn\/gchatpic_new\/0\/0-0-30BD3157BB29837CF69054960D6AEEB9\/0","jump_url":"","subtitle":"","title":""}},"config":{"autosize":1,"ctime":1708753437,"token":"1eccb106ac4eee9f08b855b4337caffc"},"text":"","sourceAd":"","extra":""}
      logger.info(e)
      const msg = await common.makeForwardMsg(e, forward, '定时发图');
      await Bot.pickGroup(this.PushConfig.PushGroupList[i]).sendMsg(msg);
    }

  }

  return true
}


  async 发图 (e) {

    d = e ;

    if (this.appconfig.SendPicRandom) {
      // 如果Switch为true，获取随机图片并发送
      const image = await getRandomUrl(this.UrlsConfig.imageUrls);
          e.reply([segment.image(image)]);
    } else {
      // 如果Switch为false，遍历imageUrls数组并发送每一张图片
      const imageUrls = this.UrlsConfig.imageUrls;
      const forward = []
        for (let j = 0; j < imageUrls.length; j++) {
            forward.push(segment.image(imageUrls[j]))
        }
      const msg = await common.makeForwardMsg(e, forward, '定时发图')
      await e.reply(msg)
    }

    return true
  }
}


