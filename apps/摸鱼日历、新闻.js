import schedule from 'node-schedule'

import { readAndParseYAML} from '../utils/getdate.js'
const Config = await readAndParseYAML('../config/push.yaml');

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
  let msg;
  let maxAttempts = 3;
  for(let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (url === moyuapiUrl) {
        let fetchUrl = await fetch(url).catch(err => logger.error(err));
        let imgUrl = await fetchUrl.json();
        url = await imgUrl.url;
      }
      msg = [segment.image(url, false, 120)];
      // 如果图片获取成功，就跳出循环
      break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed. Retrying...`);
    }
  }
  // 如果尝试了最大次数后仍然失败，就记录错误并退出
  if(!msg) {
    console.error('Failed to get image after maximum attempts');
    return;
  }

  // 回复消息
  if (isAuto) {
    e.sendMsg(msg);
  } else {
    e.reply(msg);
  }
}


function autoTask(time, groupList, isAutoPush, url, taskName) {
  if (isAutoPush) {
    schedule.scheduleJob(time, () => {
      logger.info(`[${taskName}]：开始自动推送...`);
      for (let i = 0; i < groupList.length; i++) {
        setTimeout(() => {
          let group = Bot.pickGroup(groupList[i]);
          pushContent(group, url, 1);
        }, i * 1000);  // 延迟 i 秒
      }
    });
  }
}


const moyuapiUrl = 'https://api.vvhan.com/api/moyu?type=json';// 摸鱼日历接口地址
const newsimageUrl = 'http://bjb.yunwj.top/php/tp/60.jpg';// 60s新闻图片的 URL

autoTask(Config.moyutime, Config.moyugroupList, Config.moyuisAutoPush, moyuapiUrl, '摸鱼人日历');
autoTask(Config.newstime, Config.newsgroupList, Config.newsisAutoPush, newsimageUrl, '60s新闻');