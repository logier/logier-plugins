import puppeteer from 'puppeteer'
import { getTimeOfDay, getImageUrl, getFunctionData } from '../utils/getdate.js'
import fetch from 'node-fetch'

// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]今日签到', // 插件名称
      dsc: '今日签到', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(今日)?(签到|打卡)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '今日签到' // 执行方法
        }
      ]
    })
  }

  get UrlsConfig () { return getFunctionData('Urls', 'Urls', '今日签到') }

  async 今日签到 (e) {
    let now = new Date()
    let datatime = now.toLocaleDateString('zh-CN') // 日期格式

    const response = await fetch('https://v1.hitokoto.cn')
    const hitokodata = await response.json()
    const content = hitokodata.hitokoto

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
      <link rel="stylesheet" href="https://cdn.atxrom.com/logier/CSS/sign.css"> 
      
      <style>
       html,
       body {
           width: 900px;
       }
       #main {
           display: grid;
           grid-template-areas: "i";
           width: 900px;
           overflow: hidden;
       }
       #cav {
           grid-area: i;
           z-index: -1;
           /* visibility: hidden; */
           width: 100%;
           height: 100%;
       }
       #wrapper {
           grid-area: i;
           display: grid;
           grid-template-columns: 30% 70%;
       }
       #left {
           padding: 10px;
       }
       #right {
           padding: 10px;
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
       }
       
        #cont_img {
            width: 90%;
            border-radius: 10px;
            filter: drop-shadow(0px 0px 10px black);
        }
       .img_around {
           width: 80%;
           height: 60px;
       }
       #img_top {
           display: flex;
           justify-content: end;
           align-items: end;
           padding: 10px;
       }
       #date_text {
           font-size: 36px;
           font-weight: bold;
           color: white;
           filter: drop-shadow(1px 1px 0px black);
       }
       
        html {
            line-height: 1.15; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
        }
       body {
           margin: 0;
       }
       main {
           display: block;
       }
       h1 {
           font-size: 2em;
           margin: 0.67em 0;
       }
       hr {
           box-sizing: content-box; /* 1 */
           height: 0; /* 1 */
           overflow: visible; /* 2 */
       }
       pre {
           font-family: monospace, monospace; /* 1 */
           font-size: 1em; /* 2 */
       }
       a {
           background-color: transparent;
       }
       abbr[title] {
           border-bottom: none; /* 1 */
           text-decoration: underline; /* 2 */
           text-decoration: underline dotted; /* 2 */
       }
       b,
       strong {
           font-weight: bolder;
       }
       code,
       kbd,
       samp {
           font-family: monospace, monospace; /* 1 */
           font-size: 1em; /* 2 */
       }
       small {
           font-size: 80%;
       }
       sub,
       sup {
           font-size: 75%;
           line-height: 0;
           position: relative;
           vertical-align: baseline;
       }
       sub {
           bottom: -0.25em;
       }
       sup {
           top: -0.5em;
       }
       img {
           border-style: none;
       }
       button,
       input,
       optgroup,
       select,
       textarea {
           font-family: inherit;
           font-size: 100%;
           line-height: 1.15;
           margin: 0;
       }
       button,
       input {
           overflow: visible;
       }
       button,
       select {
           text-transform: none;
       }
       button,
       [type="button"],
       [type="reset"],
       [type="submit"] {
           -webkit-appearance: button;
       }
       button::-moz-focus-inner,
       [type="button"]::-moz-focus-inner,
       [type="reset"]::-moz-focus-inner,
       [type="submit"]::-moz-focus-inner {
           border-style: none;
           padding: 0;
       }
       button:-moz-focusring,
       [type="button"]:-moz-focusring,
       [type="reset"]:-moz-focusring,
       [type="submit"]:-moz-focusring {
           outline: 1px dotted ButtonText;
       }
       fieldset {
           padding: 0.35em 0.75em 0.625em;
       }
       legend {
           box-sizing: border-box; /* 1 */
           color: inherit; /* 2 */
           display: table; /* 1 */
           max-width: 100%; /* 1 */
           padding: 0; /* 3 */
           white-space: normal; /* 1 */
       }
       progress {
           vertical-align: baseline;
       }
       textarea {
           overflow: auto;
       }
       [type="checkbox"],
       [type="radio"] {
           box-sizing: border-box; /* 1 */
           padding: 0; /* 2 */
       }
       [type="number"]::-webkit-inner-spin-button,
       [type="number"]::-webkit-outer-spin-button {
           height: auto;
       }
       [type="search"] {
           -webkit-appearance: textfield; /* 1 */
           outline-offset: -2px; /* 2 */
       }
       [type="search"]::-webkit-search-decoration {
           -webkit-appearance: none;
       }
       ::-webkit-file-upload-button {
           -webkit-appearance: button; /* 1 */
           font: inherit; /* 2 */
       }
       details {
           display: block;
       }
       summary {
           display: list-item;
       }
       template {
           display: none;
       }
       [hidden] {
           display: none;
       }          
       </style>
    </head>
    <body>
      <div id="main">
        <canvas id="cav"></canvas>
        <div id="wrapper">
          <div id="left" style="width: 100%; align-items: center; display: flex!important; font-weight: bold; color: white; text-shadow: -2px 2px 0 #000, 2px 2px 0 #000,2px -2px 0 #000,-2px -2px 0 #000;">
            <div id="user_line" style=" text-align: center;margin-left: 20px;">
            <br>
            <img alt="" id="avatar" src="https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}" style="width: 80px; float: left; margin-right: 20px;border-radius: 50%;" />
            <p style="text-align: left; "><span style="font-size: 1.8em;text-align: center;">${getTimeOfDay()}好！</span><br>${nickname}</p>
            <br>
            <div style="text-align: left;font-size: 1.2em;">
            <p>${issign}</p>
            <p>当前好感度：${finaldata.favor}</p>
            <p>当前群排名：第${position}位</p>
            <p style="line-height: 150%;">今日一言：<br>${content}</p>   
            </div>  
          </div>
        </div>
          <div id="right">
            <div id="img_top" class="img_around">
              <span id="date_text" >${datatime}</span>
            </div>
            <img alt="" id="cont_img" class="bgimg" />
            <div id="img_bottom" class="img_around"></div>
          </div>
          <p style="font-weight: bold; margin-bottom: 20px;margin-left: 20px; color: white;">Create By 鸢尾花插件 </p> 
        </div>
      </div>
    </body>
  </html>

  <script>
    //这里其实就是导入了一个全局变量myimg
    //如果想要替换，直接把这个script的src去掉
    //然后把下面的注释取消掉
    window.myimg = '${imageUrl}'; //里面是你图片的base64
  </script>
  <script>
    Function.prototype.rereturn = function (re) {
      return (...args) => re(this(...args));
    };
    window.$ = document.querySelectorAll
      .bind(document)
      .rereturn((list) => (call_back) => list.forEach(call_back));
  </script>
  <script>
  
    $(".bgimg")((img) => {
      img.src = myimg;
    });

    $("#cav")((c) => drawToCanvas(c, myimg, 5));
  
    function drawToCanvas(canvas_blur, imgData, blur) {
      let context = canvas_blur.getContext("2d");
      let img = new Image();
      img.src = imgData;
      img.onload = function () {
        context.clearRect(0, 0, canvas_blur.width, canvas_blur.height);
        let img_w = img.width;
        let img_h = img.height;
        canvas_blur.width = img_w;
        canvas_blur.height = img_h;
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          (canvas_blur.width - img_w) / 2,
          (canvas_blur.height - img_h) / 2,
          img_w,
          img_h
        );
        let canvas = canvas_blur;
        let ctx = context;
        let sum = 0;
        let delta = 5;
        let alpha_left = 1 / (2 * Math.PI * delta * delta);
        let step = blur < 3 ? 1 : 2;
        for (let y = -blur; y <= blur; y += step) {
          for (let x = -blur; x <= blur; x += step) {
            let weight =
              alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta));
            sum += weight;
          }
        }
        let count = 0;
        for (let y = -blur; y <= blur; y += step) {
          for (let x = -blur; x <= blur; x += step) {
            count++;
            ctx.globalAlpha =
              ((alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta))) /
                sum) *
              blur;
            ctx.drawImage(canvas, x, y);
          }
        }
        ctx.globalAlpha = 1;
      };
    }
  </script> `


    let browser
    try {
      if (!imageUrl) {
        throw new Error('无法获取图片URL')
      }
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      const page = await browser.newPage()
      await page.setContent(Html)

      const imgElement = await page.$('#main')
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
    return true
  }
}
