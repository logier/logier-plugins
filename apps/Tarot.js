import puppeteer from 'puppeteer'
import common from '../../../lib/common/common.js'
import { readAndParseJSON, gpt } from '../utils/getdate.js'
import setting from '../model/setting.js'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]塔罗牌', // 插件名称
      dsc: '塔罗牌', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(塔罗牌|塔罗)(.*)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '塔罗牌' // 执行方法
        },
        {
          reg: '^#?(占卜)(.*)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '占卜' // 执行方法
        },
        {
          reg: '^#?(彩虹塔罗牌)(.*)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '彩虹塔罗牌' // 执行方法
        }
      ]
    })
  }

  get GPTconfig () {
    return setting.getConfig('GPTconfig')
  }

  async 塔罗牌 (e) {
    const replacedMsg = e.msg.replace(/^#?(塔罗牌|塔罗)/, '')

    if (replacedMsg && this.GPTconfig.GPTKey) {
      e.reply(`大占卜家正在为您占卜“${replacedMsg}”`, true, { recallMsg: 10 })
      await 抽塔罗牌(e, replacedMsg, true)
    } else {
      e.reply('正在为您抽塔罗牌（配置gpt后发送 塔罗牌+占卜内容 可以使用AI占卜）', true, { recallMsg: 10 })
      await 抽塔罗牌(e)
    }
    return true
  }

  async 占卜 (e) {
    const replacedMsg = e.msg.replace(/^#?(占卜)/, '')

    if (replacedMsg && this.GPTconfig.GPTKey) {
      e.reply(`大占卜家正在为您占卜“${replacedMsg}”`, true, { recallMsg: 10 })
      await 占卜塔罗牌(e, replacedMsg, true)
    } else {
      e.reply('正在为您抽三张塔罗牌（配置gpt后发送 占卜+占卜内容 可以抽三张AI占卜）', true, { recallMsg: 10 })
      await 占卜塔罗牌(e)
    }
    return true
  }

  async 彩虹塔罗牌 (e) {
    const keys = Object.keys(tarot.cards).filter(key => key >= 0 && key <= 21)
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    const randomCard = tarot.cards[randomKey]

    logger.info(randomCard)

    // 创建塔罗牌的正位和逆位选项并随机选择一个选项
    const options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`]
    const selection = options[Math.floor(Math.random() * options.length)]
    let [position, meaning] = selection.split(': ')

    e.reply([`你抽到的牌是……\n第${randomKey}位\n${randomCard.name_cn}（${randomCard.name_en}）\n${position}：\n${meaning}`, segment.image(`./plugins/logier-plugin/resources/nijitarot/${randomKey}.webp`)])

    return true
  }
}

const tarot = await readAndParseJSON('../data/tarot.json')

async function 抽塔罗牌 (e, replacedMsg = '', isGPT = false) {
  // 获取所有塔罗牌的键并随机选择一张塔罗牌
  const keys = Object.keys(tarot.cards)
  const randomKey = keys[Math.floor(Math.random() * keys.length)]
  const randomCard = tarot.cards[randomKey]

  // 获取塔罗牌的图片URL
  const imageUrl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`

  // 创建塔罗牌的正位和逆位选项并随机选择一个选项
  const options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`]
  const selection = options[Math.floor(Math.random() * options.length)]
  let [position, meaning] = selection.split(': ')

  if (isGPT) {
    // 创建GPT的输入内容
    const gptInput = [
      {
        role: 'system',
        content: `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${replacedMsg}，我抽到的牌是${randomCard.name_cn}，并且是${selection}，请您结合我想占卜的内容来解释含义,话语尽可能简洁。`
      }
    ]

    // 使用GPT生成内容
    meaning = await gpt(gptInput)

    // 如果没有生成内容，记录错误并结束进程
    if (meaning == true) {
      logger.info('[鸢尾花插件]key或url配置错误，')
      return false
    }
  }

  let browser
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()

    let Html = `
      <html>
       <head>
          <style>
          /* 定义自定义字体 */
           @font-face {
               font-family: 'HarmonyOS';
               src: url('https://dd.atxrom.com/font/HarmonyOS.woff2') format('woff2');
               font-weight: normal; /* 可以添加，如果字体有特定的重量 */
               font-style: normal;  /* 可以添加，如果字体有特定的样式（如斜体） */
           }                
           /* 基础样式重置 */
           html, body {
               margin: 0;
               padding: 0;
               box-sizing: border-box; /* 添加此属性可以简化元素宽度和高度的计算 */
               font-family: 'HarmonyOS', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
               line-height: 2.0; /* 可以添加一个默认的行高，使文本更易读 */
               /* 其他基础样式，如字体颜色、背景颜色等，也可以在这里设置 */
           }              
           /* Tarot.css */
           body, html {
               background: rgba(255, 255, 255, 0.6);
           }
           
           .fortune {
               width: 35%;
               height: 65rem;
               float: left;
               text-align: center;
               background: rgba(255, 255, 255, 0.6);
           }
           
           .fortune .content {
               margin: 0 auto;
               padding: 12px;
               height: 49rem;
               max-width: 980px;
               max-height: 1024px;
               background: rgba(255, 255, 255, 0.6);
               border-radius: 22px;
               backdrop-filter: blur(3px);
               box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
               writing-mode: vertical-rl;
               text-orientation: mixed;
           }
           
           .fortune .content p {
               font-size: 20px;
           }
           
           .image {
               height: 65rem;
               width: 65%;
               float: right;
               box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
               text-align: center;
           }
           
           .image img {
               height: 100%;
               filter: brightness(100%);
               overflow: hidden;
               display: inline-block;
               vertical-align: middle;
               margin: 0;
               padding: 0;
           }             
          </style>
       </head>
          <body>
              <div class="fortune">
                  <h2>${randomCard.name_cn}</h2>
                  <p>${randomCard.name_en}</p>
                  <div class="content">
                      <p>${meaning}</p>
                  </div>
                  <h2>${position}</h2>
                  <br>
                  <p>Create By 鸢尾花插件</p>
              </div>
              <div class="image">
                  <img src=${imageUrl} />
              </div>
          </body>
      </html>        
  `

    await page.setContent(Html)
    const tarotimage = Buffer.from(await page.screenshot({ fullPage: true }))
    e.reply([segment.image(tarotimage)])
  } catch (error) {
    logger.error(error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
  return true
}

async function 占卜塔罗牌 (e, replacedMsg = '', isGPT = false) {
  const forward = ['正在为您抽牌……']
  const keys = Object.keys(tarot.cards)
  const randomCards = []
  const cardPositions = []

  for (let i = 0; i < 3; i++) {
    let randomCard
    do {
      const randomIndex = Math.floor(Math.random() * keys.length)
      const randomKey = keys[randomIndex]
      randomCard = tarot.cards[randomKey]
    } while (randomCards.includes(randomCard))

    randomCards.push(randomCard)

    const position = Math.random() < 0.5 ? 'up' : 'down'
    cardPositions.push(position)

    const imageUrl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`

    const forwardMsg = [
      `你抽到的第${i + 1}张牌是 ${randomCard.name_cn} (${randomCard.name_en})\n\n${position === 'up' ? '正位' : '逆位'}:  ${randomCard.meaning[position]}\n\n卡牌描述： ${position === 'up' ? randomCard.info.description : randomCard.info.reverseDescription}`,
      segment.image(imageUrl)
    ]

    forward.push(forwardMsg)
  }

  if (isGPT) {
    const message = [
      { role: 'system', content: `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${replacedMsg}，请你根据我抽到的三张牌，帮我解释其含义，并给我一些建议。` },
      ...randomCards.map((card, i) => ({
        role: 'user',
        content: `我抽到的第${i + 1}张牌是${card.name_cn}，并且是${cardPositions[i] === 'up' ? '正位' : '逆位'}，这代表${card.meaning[cardPositions[i]]}`
      }))
    ]

    const content = await gpt(message)

    if (content == true) {
      logger.info('gpt出错，没有返回内容')
    } else {
      forward.push(content)
    }
  }

  let nickname = e.nickname ? e.nickname : e.sender.card

  const msg = await common.makeForwardMsg(e, forward, `${nickname}的${replacedMsg}占卜`)
  await e.reply(msg)

  return true
}
