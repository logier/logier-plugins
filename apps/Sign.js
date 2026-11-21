import puppeteer from 'puppeteer'
import { getTimeOfDay, getImageUrl, getFunctionData } from '../utils/getdate.js'
import fetch from 'node-fetch'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日签到',
      dsc: '今日签到',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(今日)?(签到|打卡)$',
          fnc: '今日签到'
        }
      ]
    })
  }

  get UrlsConfig () { return getFunctionData('Urls', 'Urls', '今日签到') }

  async 今日签到 (e) {
    let now = new Date()
    let datatime = now.toLocaleDateString('zh-CN') 

    // 一言接口偶尔超时，失败时使用默认文案，不影响签到。
    let content = '今天也要开心呀'
    try {
      const response = await fetch('https://v1.hitokoto.cn', { signal: AbortSignal.timeout(8000) })
      if (response.ok) {
        const hitokodata = await response.json()
        content = hitokodata.hitokoto || content
      }
    } catch { /* 忽略一言接口异常 */ }

    let imageUrl = await getImageUrl(this.UrlsConfig.imageUrls, './plugins/logier-plugin/resources/gallery/114388636.webp')

    let data = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`))
    const addfavor = Math.floor(Math.random() * 10) + 1
    let issign = `好感度+${addfavor}`
    if (!data) {
      data = { favor: addfavor, time: datatime }
    } else if (data.time !== datatime) {
      data.favor += addfavor
      data.time = datatime
    } else if (data.time == datatime) {
      issign = '今日已经签到了'
    }

    await redis.set(`Yunzai:logier-plugin:${e.user_id}_sign`, JSON.stringify(data))
    let finaldata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`))

    let groupdata = JSON.parse(await redis.get(`Yunzai:logier-plugin:group${e.group_id}_sign`)) || {}
    groupdata[e.user_id] = data.favor

    await redis.set(`Yunzai:logier-plugin:group${e.group_id}_sign`, JSON.stringify(groupdata))

    let favorValues = Object.values(groupdata)
    favorValues.sort((a, b) => b - a)

    let position = favorValues.indexOf(data.favor) + 1

    let nickname = e.nickname ? e.nickname : e.sender.card

    let Html = `
  <!DOCTYPE html>
  <html lang="zh">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>签到结果</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
        }

        #main {
          width: 800px;
          margin: 20px auto;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background: #ffffff;
          overflow: hidden;
        }

        #header {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #f0f8ff, #cce7ff);
          padding: 20px;
        }

        #header img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin-right: 20px;
        }

        #header .user-info {
          font-size: 1rem;
          color: #555;
        }

        #header .user-info span {
          font-size: 1.2rem;
          font-weight: bold;
          color: #0078d7;
        }

        #content {
          padding: 20px;
        }

        #content .date-text {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
          color: #333;
        }

        #content img {
          width: 100%;
          border-radius: 10px;
          margin: 10px 0;
        }

        .quote {
          margin-top: 15px;
          font-style: italic;
          text-align: center;
          color: #777;
        }

        #footer {
          padding: 20px;
          background-color: #f8f9fa;
          text-align: center;
          border-top: 1px solid #eee;
          color: #555;
        }

        #footer .highlight {
          font-weight: bold;
          color: #0078d7;
        }
      </style>
    </head>
    <body>
      <div id="main">
        <div id="header">
          <img src="https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}" alt="用户头像" />
          <div class="user-info">
            <p><span>${getTimeOfDay()}好！</span>${nickname}</p>
            <p>${issign}</p>
          </div>
        </div>
        <div id="content">
          <div class="date-text">${datatime}</div>
          <img src="${imageUrl}" alt="背景图" />
          <p class="quote">“${content}”</p>
        </div>
        <div id="footer">
          当前好感度：<span class="highlight">${finaldata.favor}</span>，当前群排名：<span class="highlight">第${position}位</span>
        </div>
      </div>
    </body>
  </html>
          `

    let browser
    try {
      if (!imageUrl) {
        throw new Error('无法获取图片URL')
      }
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      const page = await browser.newPage()
      await page.setContent(Html)
      const imgElement = await page.$('#main')
      const image = Buffer.from(await imgElement.screenshot())
      e.reply(segment.image(image))
    } catch (error) {
      logger.info('图片渲染失败')
    } finally {
      if (browser) {
        await browser.close()
      }
    }
    return true
  }
}
