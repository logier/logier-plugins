import schedule from 'node-schedule'
import { readAndParseYAML, getRandomImage, getRandomUrl } from '../utils/getdate.js'



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
          fnc: '定时发图'
        }
      ]
    })
  }

  async 定时发图(e) {
    await sendImage(e)
  }
}

async function sendImage(e, isAuto = 0) {
  const Config = await readAndParseYAML('../config/url.yaml');
  const functionData = Config.setimage.find(item => item.功能 === '定时发图') || Config.setimage.find(item => item.功能 === 'default');
  logger.info(functionData);
  
  const image = functionData.Switch ? await getRandomImage() : await getRandomUrl(functionData.imageUrls);  
  
  if (isAuto) {
    e.sendMsg([segment.image(image)]);
  } else {
    e.reply([segment.image(image)]);
  }
  return true;
}




async function autogallery() {
  const Config = await readAndParseYAML('../config/push.yaml');
  const functionData = Config.setpush.find(item => item.功能 === '定时发图');

  if (functionData && functionData.isAutoPush) {
    schedule.scheduleJob(functionData.time, () => {
      logger.info(`[定时发图]：开始自动推送...`);
      for (let i = 0; i < functionData.groupList.length; i++) {
        setTimeout(() => {
          let group = Bot.pickGroup(functionData.groupList[i]);
          sendImage(group, 1)
        }, i * 1000);  // 延迟 i 秒
      }
    });
  }
}


autogallery()


