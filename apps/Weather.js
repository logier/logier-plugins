import puppeteer from "puppeteer";
import { readAndParseYAML, getRandomImage, getImageUrl, getFunctionData, readAndParseYAMLNotasync } from '../utils/getdate.js'
import fetch from 'node-fetch';

export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]今日天气',
      dsc: '今日天气',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(天气)\\s.*$',   
          fnc: '城市天气'
      },
      ]
    });
    this.task = {
      cron: this.pushConfig.Weathertime,
      name: '推送城市天气',
      fnc: () => this.推送城市天气()
    }
    Object.defineProperty(this.task, 'log', { get: () => false })
  }
  
  get pushConfig () { return  readAndParseYAMLNotasync('../config/push.yaml') }
  

  async 推送城市天气 (e) {
    logger.info(`[城市天气]开始推送……`);
    for (let i = 0; i < this.pushConfig.PushWeather.length; i++) {
      setTimeout(async () => {  // 注意这里我们添加了 async
        Bot.pickGroup(this.pushConfig.PushWeather[i].group).sendMsg([segment.image(await pushweather(e, this.pushConfig.PushWeather[i].city))]);
      }, 1 * 1000); 
    }
    return true
}



  async 城市天气 (e) {

    const image = await pushweather(e);  // 添加了 await
    e.reply([segment.image(image)]);    

    return true
  }
}


async function pushweather(e, pushcity) {

  const key = await readAndParseYAML('../config/key.yaml');

  const city = (e?.msg ?? '').replace(/#?(天气)/, '').trim();
  const cityToUse = city || pushcity;


  const {location, name} = await getCityGeo(cityToUse, key.qweather)

  const output = await getIndices(location,  key.qweather);

  const {forecastresult, iconDays, iconNights} = await getForecast(location, key.qweather);

  let now = new Date();
  let datatime =  now.toLocaleDateString('zh-CN'); //日期格式
  let days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  let dayOfWeek = days[now.getDay()]; //日期转换为星期几

  const urlConfig = await getFunctionData('url', 'setimage', '城市天气') 
  
  let imageUrl = urlConfig.Switch ? await getRandomImage('mb') : await getImageUrl(urlConfig.imageUrls);  

  let browser;
  try {
    browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

         let Html = `
         <!DOCTYPE html>
         <html>
         <head>
         <link rel="stylesheet" href="https://jsd.cdn.zzko.cn/npm/qweather-icons@1.3.0/font/qweather-icons.css"> 
         <style>
         * {
            padding: 0;
            margin: 0;
         }
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
           background: rgba(255, 255, 255, 0.5);
           z-index:1;
           position:absolute;
         }
         p {
           color : rgba(0,0,0, 0.6);
           font-size:1.5rem;
           padding: 2px; 
           word-wrap: break-word;
           white-space: pre-wrap;
         }
         .centered-content {
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           margin: 0 1rem 0 1rem;
           height: 100%;
         }
         .tu{
          float: left;
           border:1px solid #00000;
           max-width: 1024px
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
            <h2 style="font-weight:bolder; font-size: 2.2em;">${datatime} ${dayOfWeek} ${name}</h2>
            <br>
            <i style="font-size: 3em;" class="qi-${iconDays[0]}"> / <i class="qi-${iconNights[0]}"></i></i>
             <p style="font-weight:bolder; font-size: 2em; line-height:"150%">${forecastresult[0]}</p>
             <br>
             <p>${output}</p>
           </div>
           <br>
           <p style="font-weight: bold; margin-bottom: 20px; text-align: center;">Create By 鸢尾花插件 </p>
         </div>
         </body>
         </html>
         `
     
         await page.setContent(Html);
         // 获取图片元素
         const imgElement = await page.$('.tu img');
         // 对图片元素进行截图
         const image = await imgElement.screenshot();
 
         return image
   
       } catch (error) {
         logger.error(error);
       } finally {
         if (browser) {
           await browser.close();
         }
       }
}






async function getForecast(location, key) {
  const forecast = `https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${key}`;
  const forecastresponse = await fetch(forecast);
  const forecastdata = await forecastresponse.json();

  // 创建一个空数组来存储结果
  const forecastresult = [];
  const iconDays = [];
  const iconNights = [];

  // 遍历 forecastdata.daily 数组
  for (const item of forecastdata.daily) {
    const tempMax = item.tempMax; // 获取 tempMax 属性
    const tempMin = item.tempMin; // 获取 tempMin 属性
    const windScaleDay = item.windScaleDay; // 获取 windScaleDay 属性
    const windScaleNight = item.windScaleNight; // 获取 windScaleNight 属性
    // 定义一个函数来计算中位数
  function getMedian(scale) {
    let numbers = scale.split('-').map(Number); // 分割字符串并转换为数字
    return Math.round((numbers[0] + numbers[1]) / 2); // 计算平均值并四舍五入
  }

  let medianWindScaleDay = getMedian(windScaleDay);
  let medianWindScaleNight = getMedian(windScaleNight);
    //const precip = item.precip; // 获取 precip 属性
    //const uvIndex = item.uvIndex; // 获取 uvIndex 属性
    //const humidity = item.humidity; // 获取 humidity 属性
    const iconDay = item.iconDay; // 获取 humidity 属性
    const iconNight = item.iconNight; // 获取 humidity 属性

    const output = `气温：${tempMin}°C/${tempMax}°C\n风力：${ medianWindScaleDay}级/${medianWindScaleNight}级\n`;
    // 创建模板字符串
    //const output = `气温：${tempMin}°C/${tempMax}°C\n风力：${windScaleDay}/${windScaleNight}\n降水量：${precip}\n紫外线指数：${uvIndex} \n湿度：${humidity}%\n`;

    // 将模板字符串添加到 forecastresult 数组
    forecastresult.push(output);
    iconDays.push(iconDay);
    iconNights.push(iconNight);
  }

  return {forecastresult, iconDays, iconNights};
}



async function getIndices(location, key) {
  const indices = `https://devapi.qweather.com/v7/indices/1d?type=1,3,5,9,11,14,15,16&location=${location}&key=${key}`;
  const indicesresponse = await fetch(indices);
  const indicesdata = await indicesresponse.json();

  // 创建一个空数组来存储结果
  const result = [];

  // 遍历 forecastdata.daily 数组
  for (const item of indicesdata.daily) {
    const name = item.name; // 获取 name 属性
    const text = item.text; // 获取 text 属性
    const level = parseInt(item.level); // 获取 level 属性并转换为整数
    const romanLevel = toRoman(level); // 将 level 转换为罗马数字

    // 检查 level 是否大于或等于3
    if (level >= 3) {
      // 如果 level 大于或等于3，将 name 和 text 添加到 result 数组
      result.push(`<span style="font-size: 1.2em; font-weight: bolder">${name}(${romanLevel})</span>：${text}`);
    }
  }
  // 使用换行符连接 result 数组的所有元素
  const output = result.join('\n\n');
  return output;
}

async function getCityGeo(city, key) {
  const cityGeo = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${key}&city=`;
  const cityGeoresponse = await fetch(cityGeo);
  const data = await cityGeoresponse.json();
  if (data.code !== '200') {
    logger.info('未获取到城市id')
    return false
  }
  const location = data.location[0].id;
  const name = data.location[0].name;

  return {location, name};
}


function toRoman(num) {
  const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let str = '';

  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

