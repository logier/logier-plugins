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
          cron: this.newsConfig.PushTime,
          name: '推送今日新闻',
          fnc: () => this.推送今日新闻(),
          log: false},
        Object.defineProperty(this.task, 'log', { get: () => false })
    }
  
    get newsConfig () { return getFunctionData('Push', 'Push', '今日新闻') }
  
  
    async 推送今日新闻 () {
      try {
          // 检查是否启用自动推送
          if (!this.newsConfig.isAutoPush) {
              logger.info(`[今日新闻]自动推送未启用。`);
              return false;
          }
  
          logger.info(`[今日新闻]开始推送……`);
          for (let i = 0; i < this.newsConfig.PushGroupList.length; i++) {
              // 添加延迟以防止消息发送过快
              setTimeout(async () => {
                  const group = Bot.pickGroup(this.newsConfig.PushGroupList[i]);
                  logger.info(`[今日新闻]正在向群组 ${group} 推送新闻。`);
                  await group.sendMsg([segment.image(newsimageUrl)]);
                  logger.info(`[今日新闻]新闻已成功推送到群组 ${group}。`);
              }, i * 1000); 
          }
  
          logger.info(`[今日新闻]推送完成。`);
          return true;
      } catch (error) {
          logger.error(`[今日新闻]推送过程中出现错误: ${error}`);
      }
  }
  
  
    async 今日新闻 (e) {
  
      e.reply([segment.image(newsimageUrl)]);
  
      return true
    }
  
  }
  
  const newsimageUrl = 'https://dayu.qqsuu.cn/weiyujianbao/apis.php';// 60s新闻图片的 URL
  //打工人日历 