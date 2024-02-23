import { getFunctionData } from '../utils/getdate.js'
import fetch from 'node-fetch';

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]摸鱼日历',
      dsc: '获取摸鱼日历',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(摸鱼日历|摸鱼)$',
          fnc: '摸鱼日历'
        },
      ]
    });
    this.task = {
        cron: this.moyuConfig.PushTime,
        name: '推送摸鱼日历',
        fnc: () => this.推送摸鱼日历(),
        log: false},
      Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get moyuConfig () { return getFunctionData('Push', 'Push', '摸鱼日历') }


  // 定时任务
  async 推送摸鱼日历 () {

    if (!this.moyuConfig.isAutoPush) {return false}
  
    
    let fetchUrl = await fetch(moyuapiUrl).catch(err => logger.error(err));
    let imgUrl = await fetchUrl.json();
    imgUrl = await imgUrl.url;

    logger.info(`[摸鱼日历]开始推送……`);
    for (let i = 0; i < this.moyuConfig.PushGroupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.moyuConfig.PushGroupList[i]).sendMsg([segment.image(imgUrl)]);
      }, 1 * 1000); 
    }

    return true
  }

  async 摸鱼日历 (e) {
    let fetchUrl = await fetch(moyuapiUrl).catch(err => logger.error(err));
    let imgUrl = await fetchUrl.json();
    imgUrl = await imgUrl.url;

    e.reply([segment.image(imgUrl)]);

    return true
  }

}

const moyuapiUrl = 'https://api.vvhan.com/api/moyu?type=json';// 摸鱼日历接口地址


