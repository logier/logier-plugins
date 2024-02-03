import schedule from 'node-schedule'
import { readAndParseYAML, getRandomUrl, getRandomImage } from '../utils/getdate.js'



export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]定时发图',
      dsc: '定时发图',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#?定时发图$',
          fnc: '自定义'
        }
      ]
    })
  }

  async 自定义(e) {
    await sendImage(e)
  }
}

async function sendImage(e, isAuto = 0) {
  const Config = await readAndParseYAML('../config/url.yaml');
  for (let i = 0; i < 3; i++) {
    try {
      let image;
      if (Config.Switch) {
        image = await getRandomImage();
      } else {
        image = await getRandomUrl(Config.GalleryimageUrls);
      }
      if (isAuto) {
        e.sendMsg([segment.image(image)]);
      } else {
        e.reply([segment.image(image)]);
      }
      // 如果成功发送图片，就跳出循环
      break;
    } catch (error) {
      console.error(error);
      // 如果是最后一次尝试仍然失败，可以抛出错误或者发送一条错误消息
      if (i === 2) {
        e.reply("图片获取失败。");
      }
    }
  }
}



async function autogallery() {
  const Config = await readAndParseYAML('../config/push.yaml');
  if (Config.GalleryisAutoPush) {
    schedule.scheduleJob(Config.Gallerytime, async () => {
      logger.info('[定时发图]：开始自动推送...')
      const promises = Config.GallerygroupList.map(groupID => {
        let group = Bot.pickGroup(groupID)
        return sendImage(group, 1)
      });
      await Promise.all(promises);
    })
  }
}

autogallery()


