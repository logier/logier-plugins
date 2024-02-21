import puppeteer from "puppeteer";
import common from '../../../lib/common/common.js' 
import { readAndParseJSON, readAndParseYAML, gpt } from '../utils/getdate.js'

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 5000,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(塔罗牌|塔罗)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '塔罗牌'  // 执行方法
                },
                {
                  reg: '^#?(占卜)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '占卜'  // 执行方法
                },
                {
                  reg: '^#?(彩虹塔罗牌)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '彩虹塔罗牌'  // 执行方法
                },
            ]
        })


}

async 塔罗牌(e) {
  const replacedMsg = e.msg.replace(/^#?(塔罗牌|塔罗)/, '');
  const key = await readAndParseYAML('../config/key.yaml');

  if (replacedMsg && key.gptkey) {
    e.reply(`大占卜家正在为您占卜“${replacedMsg}”`, true, { recallMsg: 10 });
    await 抽塔罗牌(e, replacedMsg, key, true);
  } else {
    e.reply('正在为您抽塔罗牌（配置gpt后发送 塔罗牌+占卜内容 可以使用AI占卜）', true, { recallMsg: 10 });
    await 抽塔罗牌(e);
  }
  return true;
}

async 占卜(e) {

  const replacedMsg = e.msg.replace(/^#?(占卜)/, '');
  const key = await readAndParseYAML('../config/key.yaml');

  if (replacedMsg && key.gptkey) {
    e.reply(`大占卜家正在为您占卜“${replacedMsg}”`, true, { recallMsg: 10 });
    await 占卜塔罗牌(e, replacedMsg, key, true);
  } else {
    e.reply('正在为您抽三张塔罗牌（配置gpt后发送 占卜+占卜内容 可以抽三张AI占卜）', true, { recallMsg: 10 });
    await 占卜塔罗牌(e);
  }
  return true;
  }

  async 彩虹塔罗牌(e) {

    const keys = Object.keys(tarot.cards).filter(key => key >= 0 && key <= 21);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomCard = tarot.cards[randomKey];

    logger.info(randomCard);

    // 创建塔罗牌的正位和逆位选项并随机选择一个选项
    const options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`];
    const selection = options[Math.floor(Math.random() * options.length)];
    let [position, meaning] = selection.split(': ');

    e.reply([`你抽到的牌是……\n第${randomKey}位\n${randomCard.name_cn}（${randomCard.name_en}）\n${position}：\n${meaning}`,segment.image(`./plugins/logier-plugin/resources/nijitarot/${randomKey}.webp`)])

    return true;
  }

}

const tarot = await readAndParseJSON('../data/tarot.json');

async function 抽塔罗牌(e, replacedMsg = '', key = {}, isGPT = false) {
  // 获取所有塔罗牌的键并随机选择一张塔罗牌
  const keys = Object.keys(tarot.cards);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const randomCard = tarot.cards[randomKey];

  // 记录选择的塔罗牌
  logger.info(randomCard);

  // 获取塔罗牌的图片URL
  const imageUrl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;

  // 创建塔罗牌的正位和逆位选项并随机选择一个选项
  const options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`];
  const selection = options[Math.floor(Math.random() * options.length)];
  let [position, meaning] = selection.split(': ');

  if (isGPT) {
    // 创建GPT的输入内容
    const gptInput = [
      {
        "role": "system",
        "content": `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${replacedMsg}，我抽到的牌是${randomCard.name_cn}，并且是${selection}，请您结合我想占卜的内容来解释含义,话语尽可能简洁。`
      },
    ];

    // 使用GPT生成内容
    meaning = await gpt(key.gptkey, key.gpturl, key.model, gptInput);

    // 如果没有生成内容，记录错误并结束进程
    if (!meaning) {
      logger.info('gptkey错误，结束进程');
      return false;
    }
  }


let browser;
try {
  browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

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
  <div class="fortune" style="width: 35%; height: 65rem; float: left; text-align: center; background: rgba(255, 255, 255, 0.6);">
    <h2>${randomCard.name_cn}</h2>
    <p>${randomCard.name_en}</p>
    <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 22px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
    <p style="font-size: 20px;">${meaning}</p>
    </div>
    <h2>${position}</h2>
    <br>
    <p>Create By 鸢尾花插件</p>
  </div>
  <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
    <img src=${imageUrl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
  </div>
</html>
  `

  await page.setContent(Html)
  const tarotimage = await page.screenshot({fullPage: true })
  e.reply([segment.image(tarotimage)])

} catch (error) {
    logger.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
return true;

}


async function 占卜塔罗牌(e, replacedMsg = '', key = {}, isGPT = false) {
  const forward = ["正在为您抽牌……"];
  const keys = Object.keys(tarot.cards);
  const randomCards = [];
  const cardPositions = [];

  for(let i = 0; i < 3; i++) {
    let randomCard;
    do {
      const randomIndex = Math.floor(Math.random() * keys.length);
      const randomKey = keys[randomIndex];
      randomCard = tarot.cards[randomKey];
    } while(randomCards.includes(randomCard));

    randomCards.push(randomCard);

    const position = Math.random() < 0.5 ? 'up' : 'down';
    cardPositions.push(position);

    const imageUrl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
    logger.info(randomCard);

    const forwardMsg = [
      `你抽到的第${i+1}张牌是 ${randomCard.name_cn} (${randomCard.name_en})\n\n${position === 'up' ? '正位' : '逆位'}:  ${randomCard.meaning[position]}\n\n卡牌描述： ${position === 'up' ? randomCard.info.description : randomCard.info.reverseDescription}`,
      segment.image(imageUrl)
    ];

    forward.push(forwardMsg);
  }

  if(isGPT) {
    const message = [
      {"role": "system", "content": `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${replacedMsg}，请你根据我抽到的三张牌，帮我解释其含义，并给我一些建议。`},
      ...randomCards.map((card, i) => ({
        "role": "user",
        "content": `我抽到的第${i+1}张牌是${card.name_cn}，并且是${cardPositions[i] === 'up' ? '正位' : '逆位'}，这代表${card.meaning[cardPositions[i]]}`
      }))
    ];

    const content = await gpt(key.gptkey, key.gpturl, key.model, message);

    if (!content) {
      logger.info('gpt出错，没有返回内容');
    } else {
      forward.push(content);
    }
    
  }

  const msg = await common.makeForwardMsg(e, forward, `${e.nickname}的${replacedMsg}占卜`);
  await e.reply(msg);

  return true;
}
