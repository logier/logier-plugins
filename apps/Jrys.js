import puppeteer from 'puppeteer'
import { readAndParseJSON, getFunctionData, numToChinese, getImageUrl } from '../utils/getdate.js'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日运势', // 插件名称
      dsc: '今日运势', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(今日运势|运势)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '今日运势' // 执行方法
        },
        {
          reg: '^#?(悔签|重新抽取运势)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '悔签' // 执行方法
        }
      ]
    })
  }

  async 今日运势 (e) {
    let jrys = await readAndParseJSON('../data/jrys.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
    let replymessage = '正在为您测算今日的运势……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('未读取到运势数据，随机抽取')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    if (now === data.time) {
      logger.info('[今日运势]今日已抽取运势，读取保存的数据')
      replymessage = '今日已抽取运势，让我帮你找找签……'
    } else {
      logger.info('[今日运势]日期已改变，重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }

  async 悔签 (e) {
    let jrys = await readAndParseJSON('../data/jrys.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
    let replymessage = '正在为您测算今日的运势……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('[今日运势]未读取到运势数据，悔签转为重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    }

    if (now !== data.time) {
      logger.info('[今日运势]日期变更，重新抽取运势')
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: false
      }
    } else if (data.isRe) {
      logger.info('[今日运势]今日已悔签，不重新抽取')
      replymessage = '今天已经悔过签了,再给你看一眼吧……'
    } else {
      logger.info('[今日运势]悔签')
      replymessage = '异象骤生，运势竟然改变了……'
      data = {
        fortune: jrys[Math.floor(Math.random() * jrys.length)],
        time: now,
        isRe: true
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }
}

async function generateFortune (e) {
  const UrlsConfig = getFunctionData('Urls', 'Urls', '今日运势')
  const imageUrl = await getImageUrl(UrlsConfig.imageUrls)

  let nickname = e.nickname ? e.nickname : e.sender.card

  let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`)
  const fortune = JSON.parse(data).fortune

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
          /* jrys.css */
          html {
              background: rgba(255, 255, 255, 0.6);
          }
          .fortune {
              width: 30%;
              height: 65rem;
              float: left;
              text-align: center;
              background: rgba(255, 255, 255, 0.6);
          }
          .content {
              margin: 0 auto;
              padding: 12px 12px;
              height: 49rem;
              max-width: 980px;
              max-height: 1024px;
              background: rgba(255, 255, 255, 0.6);
              border-radius: 15px;
              backdrop-filter: blur(3px);
              box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3);
              writing-mode: vertical-lr;
              text-orientation: mixed;
          }
          .image {
              height: 65rem;
              width: 70%;
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
           <p>${nickname}的${await numToChinese(new Date().getDate())}号运势为</p>
           <h2>${fortune.fortuneSummary}</h2>
           <p>${fortune.luckyStar}</p>
           <div class="content">
             <p>${fortune.signText}</p>
             <p>${fortune.unsignText}</p>
           </div>
           <p>| 相信科学，请勿迷信 |</p>
           <p>Create By 鸢尾花插件 </p>
         </div>
         <div class="image">
           <img src=${imageUrl} />
         </div>
       </body>
     </html>
  `

  let browser
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(Html)
    const image = Buffer.from(await page.screenshot({ fullPage: true }))
    e.reply(segment.image(image))
  } catch (error) {
    logger.info('图片渲染失败，使用文本发送')
    e.reply([segment.at(e.user_id), `的${await numToChinese(new Date().getDate())}号运势为……\n${fortune.fortuneSummary}\n${fortune.luckyStar}\n${fortune.signText}\n${fortune.unsignText}`])
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
