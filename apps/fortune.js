import puppeteer from "puppeteer";
import { readAndParseJSON, readAndParseYAML, numToChinese, getRandomImage, getImageUrl } from '../utils/getdate.js'




export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]今日运势', // 插件名称
            dsc: '今日运势',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(今日运势|运势)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '今日运势'  // 执行方法
                },
                {
                  reg: '^#?(悔签|重新抽取运势)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '悔签'  // 执行方法
              }
            ]
        })

    }
    async 今日运势(e) {
        push今日运势(e)
      }
    async 悔签(e) {
      push今日运势(e, true)
    }
}



async function push今日运势(e, isRejrys = false) {

  let jrys = await readAndParseJSON('../data/jrys.json');

  // 获取当前日期
  let now = new Date();
  let day = now.getDate();
  
  let yunshi = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`);
  let item;
  let data;

  if (yunshi) {
    data = JSON.parse(yunshi);
    let lastUpdated = new Date(data.time).toLocaleDateString('zh-CN');
    let now = new Date().toLocaleDateString('zh-CN');
    // 检查是否是新的一天
    if (lastUpdated !== now) {
        data.isRejrys = false;
    }
    if (isRejrys) {
        if (!data.isRejrys && lastUpdated === now) {
            logger.info('[今日运势]：悔签，重新抽取');
            let newJrys = jrys.filter(j => j !== data.item);
            data.item = newJrys[Math.floor(Math.random() * newJrys.length)];
            data.time = new Date();
            data.isRejrys = true;
        } else if (data.isRejrys && lastUpdated === now) {
            e.reply(['小小', segment.at(e.user_id), '竟敢不自量力，一天只可以悔签一次'], true);
            return;
        }
    }
    item = data.item;
  } else {
      logger.info('[今日运势]：未读取到运势数据，直接写入');
      item = jrys[Math.floor(Math.random() * jrys.length)];
      data = {
          item: item,
          time: new Date(),
          isRejrys: false
      };
  }

  await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data));

  const Config = await readAndParseYAML('../config/url.yaml');
  
  let imageUrl;
  if (Config.jrysSwitch) {
      imageUrl = await getRandomImage('mb');
  } else {
      imageUrl = await getImageUrl(Config.jrysimageUrls);
  }
  logger.info(imageUrl)
        

      let Html = `
        <html style="background: rgba(255, 255, 255, 0.6)">
        <head>
        <style>
        html, body {
            margin: 0;
            padding: 0;
        }        
        </style>
        </head>
        <div class="fortune" style="width: 30%; height: 65rem; float: left; text-align: center; background: rgba(255, 255, 255, 0.6);">
          <p>${e.nickname}的${await numToChinese(day)}日运势为</p>
          <h2>${item.fortuneSummary}</h2>
          <p>${item.luckyStar}</p>
          <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
            <p >${item.signText}</p>
            <p >${item.unsignText}</p>
          </div>
          <p>| 相信科学，请勿迷信 |</p>
          <p>Create By 鸢尾花插件 </p>
        </div>
        <div class="image" style="height:65rem; width: 70%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
          <img src=${imageUrl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
        </div>
        </html>
        `;

      let browser;
      try {
        const imageUrl = await getImageUrl(Config.jrysimageUrls);
        if (!imageUrl) {
          throw new Error('无法获取图片URL');
        }
        // 根据 isRejrys 参数更改消息内容
        let message = isRejrys ? ["异变骤生！", segment.at(e.user_id), '的运势竟然变为了……'] : "正在为您测算今日的运势……";
        e.reply(message, true, { recallMsg: 5 });
        browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(Html)
        const image = await page.screenshot({fullPage: true })
        e.reply(segment.image(image))
      } catch (error) {
        logger.info('[今日运势]：图片渲染失败，使用文本发送');
        let prefix = isRejrys ? ['异变骤生！', segment.at(e.user_id), `的${await numToChinese(day)}日运势竟然变为了……\n${item.fortuneSummary}\n${item.luckyStar}\n${item.signText}\n${item.unsignText}`] : [segment.at(e.user_id), `的${await numToChinese(day)}日运势为……\n${item.fortuneSummary}\n${item.luckyStar}\n${item.signText}\n${item.unsignText}`];
        e.reply(prefix)
      } finally {
        if (browser) {
          await browser.close();
        }
      }
      return true;

  }











 