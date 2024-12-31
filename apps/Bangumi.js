import puppeteer from 'puppeteer'
import { getFunctionData, getImageUrl } from '../utils/getdate.js'
import fetch from 'node-fetch'

// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
    constructor () {
        super({
            name: '[鸢尾花插件]今日番剧', // 插件名称
            dsc: '今日番剧', // 插件描述
            event: 'message', // 更多监听事件请参考下方的 Events
            priority: 5000, // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(今日番剧|番剧)$', // 正则表达式,有关正则表达式请自行百度
                    fnc: '今日番剧' // 执行方法
                }
            ]

        })
        this.task = {
            cron: this.BangumiConfig.PushTime,
            name: '今日番剧',
            fnc: () => this.推送()
        }
        Object.defineProperty(this.task, 'log', { get: () => false })
    }

    get BangumiConfig () { return getFunctionData('Push', 'Push', '今日番剧') }

    // 执行方法1
    async 今日番剧 (e) {
        try {
            const html = await test()

            let browser
            try {
                browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
                const page = await browser.newPage()
                await page.setContent(html)
                const image = Buffer.from(await page.screenshot({ fullPage: true }))
                e.reply(segment.image(image))
            } catch (error) {
                logger.info('图片渲染失败')
                e.reply('图片渲染失败，请稍后再试')
            } finally {
                if (browser) {
                    await browser.close()
                }
            }
        } catch (error) {
            // 捕获从 getItems 或 test 中抛出的错误
            logger.error('无法获取番剧信息:', error.message)
            e.reply('无法访问API，请稍后再试')
        }

        return true
    }

    async 推送 (e) {
        if (!this.BangumiConfig.isAutoPush) { return false }

        const html = await test()

        let browser
        try {
            browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            const page = await browser.newPage()
            await page.setContent(html)
            const image = Buffer.from(await page.screenshot({ fullPage: true }))
            logger.info(this.BangumiConfig.PushGroupList)

            for (let i = 0; i < this.BangumiConfig.PushGroupList.length; i++) {
                setTimeout(async () => {
                    const group = Bot.pickGroup(this.BangumiConfig.PushGroupList[i])
                    logger.info(`[今日番剧]正在向群组 ${group} 推送番剧。`)
                    await group.sendMsg([segment.image(image)])
                    logger.info(`[今日番剧]番剧已成功推送到群组 ${group}。`)
                }, i * 3000)
            }
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

async function getItems () {

    let response = await fetch('https://api.bgm.tv/calendar')

    let data = await response.json()

    let now = new Date()

    let weekday = (now.getDay() + 6) % 7 + 1 // 将星期日转换为7，星期一到星期六转换为1到6

    // 找到对应星期的项目
    let items = data.find(item => item.weekday.id === weekday).items

    // 提取 name_cn、rating 和 images 属性并组成新的数组
    let itemDetails = items.map(item => {
        return {
            name: item.name_cn || '',
            score: item.rating ? item.rating.score : '',
            image: item.images ? item.images.common : ''
        }
    }).filter(item => item.name && item.score && item.image) // 过滤掉任何属性为空的项

    logger.info(itemDetails)
    // 将 itemDetails 存入 Redis
    await redis.set(`itemDetails`, JSON.stringify(itemDetails),{ EX: 14400 })



    return itemDetails
}

async function test() {
    // 从 Redis 获取数据，如果 Redis 中没有数据，则先获取并存入
    let itemDetailsJson = await redis.get('itemDetails');
    if (!itemDetailsJson) {
        itemDetailsJson = JSON.stringify(await getItems());
    }
    //let itemDetailsJson = JSON.stringify(itemDetails)

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Items Display</title>
        <style>
            * {
            padding: 0;
            margin: 0;
            }
            .item {
                border: 1px solid #ddd;
                margin: auto;
                padding: 5px;
                width: 80%;
                flex-direction: row;
                display: flex !important;
            }
            .item img {
                width: auto;
                height: 100%;
                padding-right: 5%; 
            }
            .header {
                width: 100%;
                text-align: center;
                background: no-repeat url("${await getImageUrl(['./plugins/logier-plugin/resources/gallery/114388636.webp'])}");
                background-size: cover;
            }
        </style>
    </head>
    <body>
        <div id="itemsContainer">
        <div class="header">
            <br>
            <br>
            <h1>今日番剧<h1/>
            <h2>鸢尾花插件<h2/>
            <br>
            <br>
        </div>
        <br>
            <script>
                let itemDetails = JSON.parse('${itemDetailsJson}');
    
                let html = itemDetails.map(item => \`
                    <div class="item">
                        <img src="\${item.image}" />
                        <div>
                        <h1>\${item.name}<h1/><br>
                        </div>      
                    </div>
                \`).join('');
    
                document.write(html);
    
                document.write('<br><h2 style="text-align: center;">Create By 鸢尾花插件 </h2>');
            </script>
        </div>
    </body>
    </html>`
    return html
}
