import puppeteer from "puppeteer";
import common from '../../../lib/common/common.js' 
import { readAndParseJSON, readAndParseYAML, gpt } from '../utils/getdate.js'


export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(塔罗牌|抽塔罗牌)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '塔罗牌'  // 执行方法
                },
                {
                  reg: '^#?(占卜)\\s(.*)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '占卜'  // 执行方法
              },

            ]
        })


}

async 塔罗牌(e) {

  const key = await readAndParseYAML('../config/key.yaml');


  let replacedMsg = this.e.msg.replace(/^#?(塔罗牌|抽塔罗牌|占卜)/, '');

  if (replacedMsg) {
    const 占卜内容 = replacedMsg;
    // 回复用户
    e.reply(`正在为您占卜${replacedMsg}`, true);


    if (!key.gptkey){
      await 抽塔罗牌nogpt(e);
    }else {
      await 抽塔罗牌(e, 占卜内容);
    }

    // 停止循环
    return true
  } else {
    this.setContext('占卜内容')
    e.reply(`请发送你想要占卜的内容`, true)
  }
    return true;
}

async 占卜内容(e) {
    this.finish('占卜内容')

    // 回复用户
    e.reply(`正在为您占卜${this.e.msg}`, true);

    const key = await readAndParseYAML('../config/key.yaml');

    if (!key.gptkey){
      await 抽塔罗牌nogpt(e);
    }else {
      await 抽塔罗牌(e, this.e.msg);
    }

}

async 占卜(e) {

const key = await readAndParseYAML('../config/key.yaml');

if (!key.gptkey){
  logger.info('未配置gptkey，取消占卜')
  return false
}

  let 占卜内容 = this.e.msg.replace(/^#?(占卜)/, '');
  const tarot = await readAndParseJSON('../data/tarot.json');
  e.reply(`正在为您占卜${占卜内容}……`)
  // 收集需要转发的消息，存入数组之内，数组内一个元素为一条消息
  const forward = [
      "正在为您抽牌……", 
  ]
  let keys = Object.keys(tarot.cards);
  let randomCards = [];
  let randomMeanings = [];
  let randomDescriptions = [];
  let cardposition = [];
  
  for(let i = 0; i < 3; i++) {
      let randomIndex = Math.floor(Math.random() * keys.length);
      let randomKey = keys[randomIndex];
      let randomCard = tarot.cards[randomKey];
  
      // 确保不会抽到重复的卡
      while(randomCards.includes(randomCard)) {
          randomIndex = Math.floor(Math.random() * keys.length);
          randomKey = keys[randomIndex];
          randomCard = tarot.cards[randomKey];
      }
  
      randomCards.push(randomCard);
  
      // 随机抽取up或down
      let position = Math.random() < 0.5 ? 'up' : 'down';
      cardposition.push(position);
      randomMeanings.push(randomCard.meaning[position]);
  
      // 根据抽取的位置(up或down)选择对应的描述
      if(position === 'up') {
          randomDescriptions.push(randomCard.info.description);
      } else {
          randomDescriptions.push(randomCard.info.reverseDescription);
      }
  
      let imageurl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
  
      logger.info(randomCard);
  
      let forwardmsg = [`你抽到的第${i+1}张牌是\n${randomCard.name_cn} (${randomCard.name_en})\n${position === 'up' ? '正位' : '逆位'}:  ${randomMeanings[i]}\n\n卡牌描述： ${randomDescriptions[i]}`, segment.image(imageurl)]
  
      forward.push(forwardmsg)
  }
  
  let translatedCardPosition = cardposition.map(position => {
      if (position === 'up') {
          return '正位';
      } else if (position === 'down') {
          return '逆位';
      } else {
          return position; // 如果有其他值，保持原样
      }
  });
  
  let message =        
  [ {"role": "system", "content": `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${占卜内容}，请你根据我抽到的三张牌，帮我解释其含义，并给我一些建议。`},
    {"role": "user", "content": `我抽到的第一张牌是${randomCards[0].name_cn}，并且是${translatedCardPosition[0]}，这代表${randomMeanings[0]}`},
    {"role": "user", "content": `我抽到的第二张牌是${randomCards[1].name_cn}，并且是${translatedCardPosition[1]}，这代表${randomMeanings[1]}`},
    {"role": "user", "content": `我抽到的最后一张牌是${randomCards[2].name_cn}，并且是${translatedCardPosition[2]}，这代表${randomMeanings[2]}`},]
  
    const content = await gpt(key.gptkey, key.gpturl, key.model, message);

    if (!content) {
      logger.info('gptkey错误，结束进程')
      return false
  }

    forward.push(content)

    const msg = await common.makeForwardMsg(e, forward, `${e.nickname}的${占卜内容}占卜`)
    await this.reply(msg)
  
 return true;
}

}



async function 抽塔罗牌(e, 占卜内容) {

    const key = await readAndParseYAML('../config/key.yaml');

    const tarot = await readAndParseJSON('../data/tarot.json');
    
    let keys = Object.keys(tarot.cards);
    let randomIndex = Math.floor(Math.random() * keys.length);
    let randomKey = keys[randomIndex];
    let randomCard = tarot.cards[randomKey];
    logger.info(randomCard);
    

  let imageurl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
  var options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`];
  var selection = options[Math.floor(Math.random() * options.length)];
  var selectedOption = selection.split(': ');
  var position = selectedOption[0]; // 正位 或 逆位
  var meaning = selectedOption[1]; // 对应的含义

  const 内容 = [ {"role": "system", "content": `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${占卜内容}，我抽到的牌是${randomCard.name_cn}，并且是${selection}，请您结合我想占卜的内容来解释含义,话语尽可能简洁。`},]

  const content = await gpt(key.gptkey, key.gpturl, key.model, 内容);

  if (!content) {
    logger.info('gptkey错误，结束进程')
    return false
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
      <h2>${randomCard.name_cn}(${randomCard.name_en})</h2>
      <p>${position}</p>
      <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
      <p style="font-size: 25px;">${content}</p>
      </div>
      <p>${meaning}</p>
      <p>Create By 鸢尾花插件</p>
    </div>
    <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
      <img src=${imageurl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
    </div>
  </html>
    `

    await page.setContent(Html)
    const tarotimage = await page.screenshot({fullPage: true })
    e.reply([segment.image(tarotimage)], true)

  } catch (error) {
      logger.error(error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
 return true;
 
}







async function 抽塔罗牌nogpt(e) {

  const key = await readAndParseYAML('../config/key.yaml');
  const tarot = await readAndParseJSON('../data/tarot.json');
  
  let keys = Object.keys(tarot.cards);
  let randomIndex = Math.floor(Math.random() * keys.length);
  let randomKey = keys[randomIndex];
  let randomCard = tarot.cards[randomKey];
  logger.info(randomCard);
  
  let imageurl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
  var options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`];
  var selection = options[Math.floor(Math.random() * options.length)];
  var selectedOption = selection.split(': ');
  var position = selectedOption[0]; // 正位 或 逆位
  var meaning = selectedOption[1]; // 对应的含义



  var content;
  if (position === '正位') {
    content = randomCard.info.description;
  } else if (position === '逆位') {
    content = randomCard.info.reverseDescription;
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
    <h2>${randomCard.name_cn}(${randomCard.name_en})</h2>
    <p>${position}</p>
    <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
    <p style="font-size: 20px;">${content}</p>
    </div>
    <p>${meaning}</p>
    <p>Create By 鸢尾花插件</p>
  </div>
  <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
    <img src=${imageurl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
  </div>
</html>
  `

  await page.setContent(Html)
  const tarotimage = await page.screenshot({fullPage: true })
  e.reply([segment.image(tarotimage)], true)

} catch (error) {
    logger.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
return true;

}

