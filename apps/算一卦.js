import puppeteer from "puppeteer";
import { readAndParseJSON, readAndParseYAML,getRandomImage, getImageUrl } from '../utils/getdate.js'


export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]算一卦', // 插件名称
            dsc: '算一卦',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(算一卦|算卦).*$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '算一卦'  // 执行方法
                },
                {
                  reg: '^#?(悔卦|逆天改命).*$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '悔卦'  // 执行方法
              }
            ]
        })
    }
    async 算一卦(e) {
        push算一卦(e)
    }
    async 悔卦(e) {
      push算一卦(e, true)
    }

}

    async function push算一卦(e, isResuangua = false) {


      const guayao = await readAndParseJSON('../data/guayao.json');
      const guachi = await readAndParseJSON('../data/guachi.json');


      const Config = await readAndParseYAML('../config/url.yaml');
      
      let imageUrl;
      if (Config.suanguaSwitch) {
          imageUrl = await getRandomImage('竖图');
      } else {
          imageUrl = await getImageUrl(Config.suanguaimageUrls);
      }
      logger.info(imageUrl)
           
    
    var randomIndex = Math.floor(Math.random() * guayao.length);
    let replacedMsg = e.msg.replace(/^#?(算一卦|算卦)/, '');
    let content = [e.nickname + '心中所念' + (replacedMsg ? '“' + replacedMsg + '”' : '') + '卦象如下:'];

    let yunshi = await redis.get(`Yunzai:logier-plugin:${e.user_id}_suanyigua`);
    let data;
    
    if (yunshi) {
      data = JSON.parse(yunshi);
      let now = new Date().toLocaleDateString('zh-CN');
      let lastUpdated = new Date(data.time).toLocaleDateString('zh-CN');
      if (now !== lastUpdated) {
          data.isResuangua = false;  // 如果日期改变，重置 isResuangua 参数
      }
      if (isResuangua) {
          if (!data.isResuangua && now === lastUpdated) {
              logger.info('[算一卦]：悔卦，重新抽取');
              let possibleIndexes = [...Array(guayao.length).keys()].filter(i => i !== data.item);  // 创建一个过滤后的数组
              data.item = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];  // 从过滤后的数组中随机选择一个新的索引
              data.time = new Date();
              data.isResuangua = true;
          } else if (data.isResuangua) {
              e.reply(['小小', segment.at(e.user_id), '竟敢不自量力，一天只可以悔卦一次'], true);
              return;
          }
      }
      randomIndex = data.item;
  } else {
      logger.info('[算一卦]：首次测算卦象');
      randomIndex = Math.floor(Math.random() * guayao.length);
      data = {
          item: randomIndex,
          time: new Date(),
          isResuangua: false
      };
  }
  await redis.set(`Yunzai:logier-plugin:${e.user_id}_suanyigua`, JSON.stringify(data));
  

    let message = isResuangua ? ["异变骤生！", segment.at(e.user_id), '的卦象竟然变为了……'] : "正在为您测算……";
    e.reply(message, true, { recallMsg: 10 });

    let browser;
    try {
      browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();

    let Html = `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    @font-face {
    font-family: AlibabaPuHuiTi-2-55-Regular;
    src:url(https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-2/AlibabaPuHuiTi-2-55-Regular/AlibabaPuHuiTi-2-55-Regular.woff2) format('woff2');
  }
    * {
      padding: 0;
      margin: 0;
    }
    html {
    font-family: 'AlibabaPuHuiTi-2-55-Regular', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  }
    body{
      position:absolute;
    }
    .nei{
      float: left;
      box-shadow: 3px 3px 3px #666666;
      width: 45%;
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
      text-align: left; 
    }
    .centered-content {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;

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
        <p>${content}</p>
        <p style="text-shadow:3px 3px 2px rgba(-20,-10,4,.3); ">${guayao[randomIndex]}</p>
        <p>${guachi[randomIndex]}</p>
      </div>
      <br>
      <p style="font-weight: bold; margin-bottom: 20px;">Create By Logier-Plugin </p>
    </div>
    </body>
    </html>
    `

    await page.setContent(Html);
    // 获取图片元素
    const imgElement = await page.$('.tu img');
    // 对图片元素进行截图
    const image = await imgElement.screenshot();

    e.reply(segment.image(image))


  } catch (error) {
    logger.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return true;
}
     
     





 
