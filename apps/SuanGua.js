import puppeteer from 'puppeteer'
import { readAndParseJSON, getFunctionData, getImageUrl } from '../utils/getdate.js'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]算一卦', // 插件名称
      dsc: '算一卦', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(算一卦|算卦).*$', // 正则表达式,有关正则表达式请自行百度
          fnc: '算一卦' // 执行方法
        },
        {
          reg: '^#?(悔卦|逆天改命).*$', // 正则表达式,有关正则表达式请自行百度
          fnc: '悔卦' // 执行方法
        }
      ]
    })
  }

  async 算一卦 (e) {
    let suangua = await readAndParseJSON('../data/suangua.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_suangua`)
    let replymessage = '正在为您算卦……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('[算一卦]未读取到卦象，随机抽取')
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: false
      }
    }

    if (now === data.time) {
      logger.info('[算一卦]今日已算过卦，读取保存的数据')
      replymessage = '今日已算卦，再给你看一眼吧……'
    } else {
      logger.info('[算一卦]日期已改变，重新算卦')
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: false
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_suangua`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }

  async 悔卦 (e) {
    let suangua = await readAndParseJSON('../data/suangua.json')
    let now = new Date().toLocaleDateString('zh-CN')
    let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_suangua`)
    let replymessage = '正在为您算卦……'

    if (data) {
      data = JSON.parse(data)
    } else {
      logger.info('[算一卦]未读取到卦象数据，悔卦转为重新算卦')
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: false
      }
    }

    if (now !== data.time) {
      logger.info('[算一卦]日期变更，重新抽取卦象')
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: false
      }
    } else if (data.isRe) {
      logger.info('[算一卦]今日已悔卦，不重新抽取')
      replymessage = '今天已经悔过卦了,再给你看一眼吧……'
    } else {
      logger.info('[算一卦]悔卦')
      replymessage = '异象骤生，卦象竟然改变了……'
      data = {
        fortune: suangua[Math.floor(Math.random() * suangua.length)],
        time: now,
        isRe: true
      }
    }

    e.reply(replymessage, true, { recallMsg: 10 })
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_suangua`, JSON.stringify(data))

    await generateFortune(e)

    return true
  }
}

async function generateFortune (e) {
  const UrlsConfig = getFunctionData('Urls', 'Urls', '算一卦')
  const imageUrl = await getImageUrl(UrlsConfig.imageUrls)

  let data = await redis.get(`Yunzai:logier-plugin:${e.user_id}_suangua`)
  const fortune = JSON.parse(data).fortune
  logger.info(fortune)

  let nickname = e.nickname ? e.nickname : e.sender.card

  let replacedMsg = e.msg.replace(/^#?(算一卦|算卦)/, '')
  let content = [nickname + '心中所念' + (replacedMsg ? '“' + replacedMsg + '”' : '') + '卦象如下:']

  let Html = `
    <!DOCTYPE html>
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
           
           /* suangua.css */
           body{
               position:absolute;
           }
           .nei{
               float: left;
               box-shadow: 3px 3px 3px #666666;
               width: 50%;
               min-width: 400px;
               height:100%;
               display:flex;
               flex-direction: column;
               justify-content: space-between;
               border-radius:10px 10px 10px 10px;
               border:1px solid #a1a1a1;
               background: rgba(255, 255, 255, 0.6);
               z-index:1;
               position:absolute;
           }
           p {
               color : rgba(0,0,0, 0.5);
               font-size:1.5rem;
               padding: 2px;
               word-wrap: break-word;
               white-space: pre-wrap;
               text-align: center;
               font-weight: bold;
           }
           .centered-content {
               display: flex;
               flex-direction: column;
               justify-content: flex-start;
               padding: 1em;
               height: 100%;
           }
           .tu{
               float: left;
               border:1px solid #00000;
           }
           img{
               border:1px solid #00000;
               border-radius:10px 10px 10px 10px;
           }
    
      </style>
    </head>
    <body>
    <div class="tu">
        <img src ="${imageUrl}" height=1024px>
    </div>
    <div class="nei">
      <div class="centered-content">
      <br>
        <b style="font-size: 1.5em">${content}</b>
        <br>
        <br>
        <p style="text-shadow:3px 3px 2px rgba(-20,-10,4,.3)">${fortune.guayao}</p>
        <br>
        <br>
        <p>${fortune.guachi}</p>
        <p>${fortune.name}\n${fortune.Poetry}</p>
        <br>
        <br>
        <p>${fortune.description}</p>
      </div>
      <br>
      <p style="font-weight: bold; margin-bottom: 20px;">Create By 鸢尾花插件 </p>
    </div>
    </body>
    </html>
  `

  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-proxy-server']
    })

    const page = await browser.newPage()
    await page.setContent(Html)

    const imgElement = await page.$('.tu img')
    // 对图片元素进行截图
    const image = Buffer.from(await imgElement.screenshot())
    e.reply(segment.image(image))
  } catch (error) {
    logger.info('图片渲染失败')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
