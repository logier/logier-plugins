import puppeteer from 'puppeteer'
import { getFunctionData } from '../utils/getdate.js'

export class example extends plugin {
  constructor() {
    super({
      name: '小说订阅',
      dsc: '小说订阅',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(搜小说).*$',
          fnc: '搜小说'
        },
        {
          reg: '^#?(订阅小说).*$',
          fnc: '订阅小说'
        },
        {
          reg: '^#?(查看订阅小说).*$',
          fnc: '查看订阅小说'
        },
        {
          reg: '^#?(删除订阅小说).*$',
          fnc: '删除订阅小说'
        },

      ]
    });
    this.task = {
      cron: this.novelConfig.PushTime,
      name: '检查小说更新',
      fnc: () => 检查小说更新(),
      log: false},
    Object.defineProperty(this.task, 'log', { get: () => false })
  }

  get novelConfig () { return getFunctionData('Push', 'Push', '订阅小说') }

  async 搜小说(e) {
    const replacedMsg = e.msg.replace(/^#?(搜小说)/, '').trim();
    if (!replacedMsg) {return false }
    e.reply(`正在为您搜索《${replacedMsg}》……`, true, { recallMsg: 10 })
    await search(e, replacedMsg);
    return true;
  }

  async 订阅小说(e) {
    const replacedMsg = e.msg.replace(/^#?(订阅小说)/, '').trim();
    if (!replacedMsg) { return false }
    e.reply(`正在为您订阅《${replacedMsg}》……`, true, { recallMsg: 10 });
    
    await sub(e, replacedMsg);
    return true;
  }

  async 查看订阅小说(e) {
    let noveldata = await redis.get(`Yunzai:logier-plugin:lightnovel`);
  
    noveldata = JSON.parse(noveldata);
  
    if (Array.isArray(noveldata) && noveldata.length > 0) {
      // 获取对象的titleMatch属性，使用《》包裹每一项，然后用空格隔开
      let formattedData = noveldata.map(item => {
        // 获取对象的值，这是一个包含titleMatch属性的对象
        let obj = Object.values(item)[0];
        return `《${obj.titleMatch}》`;
      }).join(' ');
  
      e.reply(`已订阅：${formattedData}`);
    } else {
      e.reply(`未订阅小说`);
    }
  
    return true;
  }
  

  async 删除订阅小说(e) {
    let noveldata = await redis.get(`Yunzai:logier-plugin:lightnovel`);

    const replacedMsg = e.msg.replace(/^#?(删除订阅小说)/, '');
  
    noveldata = JSON.parse(noveldata);
  
    if (Array.isArray(noveldata)) {
      // 查找与输入标题匹配的对象
      let index = noveldata.findIndex(item => Object.values(item)[0].titleMatch === replacedMsg);
  
      // 如果找到了，就从数组中删除这个对象
      if (index !== -1) {
        noveldata.splice(index, 1);
  
        // 将更新后的数组保存回Redis
        await redis.set(`Yunzai:logier-plugin:lightnovel`, JSON.stringify(noveldata));
  
        e.reply(`已删除订阅：《${replacedMsg}》`);
      } else {
        e.reply(`未找到订阅：《${replacedMsg}》`);
      }
    } else {
      e.reply(`未订阅小说`);
    }
  
    return true;
  }
  

}

async function search(e,searchText) {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.linovelib.com/S6/');
    //await new Promise(r => setTimeout(r, 3500)); 

    try {
      await page.waitForSelector('.big-button.pow-button', { timeout: 3500 });
      await Promise.all([
        page.click('.big-button.pow-button'),
        page.waitForNavigation(),
      ]);
    } catch (error) {
      console.warn('No security check appeared.');
    }

    await page.type('#searchkey', searchText);
    await page.click('.search-btn');

    await new Promise(r => setTimeout(r, 3000)); // 等待3秒

    const currentUrl = page.url();

    if (currentUrl.includes('/S6/')) {
      const firstResultLink = await page.evaluate(() => {
        const firstResult = document.querySelector('.search-result-list .imgbox a');
        return firstResult ? firstResult.href : null;
      });

      if (firstResultLink) {
        await page.goto(firstResultLink);
      }
    }

    const data = await page.content();

    const titleMatch = data.match(/<meta property="og:title" content="(.*?)"\s*>/);
    const imageMatch = data.match(/<meta property="og:image" content="(.*?)"\s*>/);
    const tagsMatch = data.match(/<meta property="og:novel:tags" content="(.*?)"\s*>/);
    const authorMatch = data.match(/<meta property="og:novel:author" content="(.*?)"\s*>/);
    const updatetime = data.match(/<meta property="og:novel:update_time" content="(.*?)"\s*>/);
    const chaptername = data.match(/<meta property="og:novel:latest_chapter_name" content="(.*?)"\s*>/);
    const wordCountMatch = data.match(/<span>字数：(.*?)<\/span>/);
    const recommandCountMatch = data.match(/<span>总推荐：(.*?)<\/span>/);
    const weekCountMatch = data.match(/<span>周推荐：(.*?)<\/span>/);
    const userRatingMatch = data.match(/<li>\s*<span class="fr">.*?<\/span><a href="https:\/\/www.linovelib.com\/user\/.*?\.html" target="_blank">(.*?)<\/a>\s*<br>\s*(.*?)\s*<\/li>/);

    if (!titleMatch || !imageMatch || !tagsMatch || !authorMatch) {
      e.reply(`未获取到${searchText}`, true)
      throw new Error('Required metadata not found');
    }

    const content = `标题：${titleMatch[1]}\n作者：${authorMatch[1]}\n最后更新日期：${updatetime[1]}\n最后更新章节：${chaptername[1]}\n字数：${wordCountMatch[1]}\n总推荐：${recommandCountMatch[1]}\n周推荐：${weekCountMatch[1]}\n最近互动：${userRatingMatch[1]} ${userRatingMatch[2]}`
    e.reply([content, segment.image(imageMatch[1])]);
  } finally {
    await browser.close();
  }
}




async function sub(e, searchText) {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.linovelib.com/S6/');
    //await new Promise(r => setTimeout(r, 3500)); 

    try {
      await page.waitForSelector('.big-button.pow-button', { timeout: 3500 });
      await Promise.all([
        page.click('.big-button.pow-button'),
        page.waitForNavigation(),
      ]);
    } catch (error) {
      console.warn('No security check appeared.');
    }

    await page.type('#searchkey', searchText);
    await page.click('.search-btn');

    await new Promise(r => setTimeout(r, 3000)); // 等待3秒

    const currentUrl = page.url();

    if (currentUrl.includes('/S6/')) {
      const firstResultLink = await page.evaluate(() => {
        const firstResult = document.querySelector('.search-result-list .imgbox a');
        return firstResult ? firstResult.href : null;
      });

      if (firstResultLink) {
        await page.goto(firstResultLink);
      }
    }

    const data = await page.content();
    const currentUrl2 = page.url(); 

    const url = new URL(currentUrl2);
    const pathParts = url.pathname.split('/');
    let novelId = pathParts[2]; // 获取3647.html这一部分
    novelId = novelId.split('.')[0]; // 移除.html部分
    
    const titleMatch = data.match(/<meta property="og:title" content="(.*?)"\s*>/);
    const imageMatch = data.match(/<meta property="og:image" content="(.*?)"\s*>/);
    const updatetime = data.match(/<meta property="og:novel:update_time" content="(.*?)"\s*>/);
    const chaptername = data.match(/<meta property="og:novel:latest_chapter_name" content="(.*?)"\s*>/);

    let arrayData = JSON.parse(await redis.get(`Yunzai:logier-plugin:lightnovel`)) || []; // 从Redis中获取当前的订阅列表

    const subdata = {
      titleMatch : titleMatch[1],
      updatetime : updatetime[1],
      chaptername : chaptername[1]
    };
    
    arrayData.push({[currentUrl2]: subdata}); // 将数据添加到数组中
    
    await redis.set(`Yunzai:logier-plugin:lightnovel`, JSON.stringify(arrayData)); // 将数组存储到Redis中

    e.reply([`成功订阅《${titleMatch[1]}》`, segment.image(imageMatch[1])])


  } finally {
    await browser.close();
  }
}



async function 检查小说更新(e) {

  const config = getFunctionData('Push', 'Push', '订阅小说')

  if (!config.isAutoPush) {
    return false;
  }

  // 从数据库中获取数据
  let noveldata = await redis.get(`Yunzai:logier-plugin:lightnovel`);
  if (!noveldata) {
    return;
  }
  noveldata = JSON.parse(noveldata); // 将数据从JSON格式转换为JavaScript对象

  // 遍历noveldata数组
  for (let i = 0; i < noveldata.length; i++) {
    // 获取currentUrl2
    const currentUrl2 = Object.keys(noveldata[i])[0];

    const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });

    try {
      const page = await browser.newPage();
      await page.goto(currentUrl2);

      try {
        await page.waitForSelector('.big-button.pow-button', { timeout: 3500 });
        await Promise.all([
          page.click('.big-button.pow-button'),
          page.waitForNavigation(),
        ]);
      } catch (error) {
      }

      await new Promise(r => setTimeout(r, 3000)); // 等待3秒

      const data = await page.content();
      
      const titleMatch = data.match(/<meta property="og:title" content="(.*?)"\s*>/);
      const imageMatch = data.match(/<meta property="og:image" content="(.*?)"\s*>/);
      const updatetime = data.match(/<meta property="og:novel:update_time" content="(.*?)"\s*>/);
      const chaptername = data.match(/<meta property="og:novel:latest_chapter_name" content="(.*?)"\s*>/);

      if (updatetime[1] !== noveldata[i][currentUrl2].updatetime || chaptername[1] !== noveldata[i][currentUrl2].chaptername) {

        for (let i = 0; i < config.PushGroupList.length; i++) {
          setTimeout(async () => {  
            Bot.pickGroup(config.PushGroupList[i]).sendMsg([`《${titleMatch[1]}》有更新\n${chaptername[1]}`, segment.image(imageMatch[1])]);
          }, 1 * 3000); 
        }

        // 更新数据
        noveldata[i][currentUrl2] = {
          titleMatch : titleMatch[1],
          updatetime : updatetime[1],
          chaptername : chaptername[1]
        };

        // 将更新后的数组存储到Redis中
        await redis.set(`Yunzai:logier-plugin:lightnovel`, JSON.stringify(noveldata));
      }
    } finally {
      await browser.close();
    }
  }
}




