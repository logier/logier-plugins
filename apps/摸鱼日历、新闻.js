import schedule from 'node-schedule'
import { readAndParseYAML} from '../utils/getdate.js'

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]摸鱼日历和60s新闻',
      dsc: '获取摸鱼日历和60s新闻',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(#|/)?(摸鱼日历|摸鱼)$',
          fnc: 'getMoyu'
        },
        {
          reg: '^(#|/)?(60s日报|今日新闻)$',
          fnc: 'getNews'
        }
      ]
    });
  }

  async getMoyu(e) {
    pushContent(e, moyuapiUrl);
  }

  async getNews(e) {
    pushContent(e, newsimageUrl);
  }
}

async function pushContent(e, url, isAuto = 0) {

    // 回复消息
    if (isAuto) {
      e.sendMsg([segment.image(url)]);
    } else {
      e.reply([segment.image(url)]);
    }

}



async function autoTask(taskName) {
  const Config = await readAndParseYAML('../config/push.yaml');
  
  let taskConfig;
  let apiUrl;
  
  if (taskName === '摸鱼人日历') {
    taskConfig = {
      isAutoPush: Config.moyuisAutoPush,
      time: Config.moyutime,
      groupList: Config.moyugroupList
    };
    apiUrl = moyuapiUrl;
  } else if (taskName === '60s新闻') {
    taskConfig = {
      isAutoPush: Config.newsisAutoPush,
      time: Config.newstime,
      groupList: Config.newsgroupList
    };
    apiUrl = newsimageUrl;
  }
  
  if (taskConfig && taskConfig.isAutoPush) {
    schedule.scheduleJob(taskConfig.time, () => {
      logger.info(`[${taskName}]：开始自动推送...`);
      for (let i = 0; i < taskConfig.groupList.length; i++) {
        setTimeout(() => {
          let group = Bot.pickGroup(taskConfig.groupList[i]);
          pushContent(group, apiUrl, 1);
        }, i * 1000);  // 延迟 i 秒
      }
    });
  }
}


const moyuapiUrl = 'https://api.vvhan.com/api/moyu';// 摸鱼日历接口地址
const newsimageUrl = 'http://bjb.yunwj.top/php/tp/60.jpg';// 60s新闻图片的 URL

autoTask('摸鱼人日历');
autoTask('60s新闻');