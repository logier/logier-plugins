import { getFunctionData } from '../utils/getdate.js'

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]今日新闻',
      dsc: '获取每日60s新闻',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(60s日报|今日新闻)$',
          fnc: '今日新闻'
        }
      ]
    });
    this.task = {
        cron: this.newsConfig.time,
        name: '推送今日新闻',
        fnc: () => this.推送今日新闻(),
        log: false},
      Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get newsConfig () { return getFunctionData('push', 'setpush', '今日新闻') }


  async 推送今日新闻 () {

    if (!this.newsConfig.isAutoPush) {return false}

    logger.info(`[今日新闻]开始推送……`);
    for (let i = 0; i < this.newsConfig.groupList.length; i++) {
      setTimeout(() => {
        Bot.pickGroup(this.newsConfig.groupList[i]).sendMsg([segment.image(newsimageUrl)]);
      }, 1 * 1000); 
    }

    return true
  }

  async 今日新闻 (e) {

    e.reply([segment.image(newsimageUrl)]);

    return true
  }

}

const newsimageUrl = 'http://bjb.yunwj.top/php/tp/60.jpg';// 60s新闻图片的 URL