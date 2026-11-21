import { getImageUrl, getFunctionData } from '../utils/getdate.js'
import { getNewsText } from '../utils/daily-api.mjs'

export class example extends plugin {
    constructor () {
        super({
            name: '[鸢尾花插件]真寻日报',
            dsc: '真寻日报',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '^#?(60s日报|真寻日报)$',
                    fnc: '真寻日报'
                }
            ]
        })
        // eslint-disable-next-line no-unused-expressions
        this.task = {
            cron: this.newsConfig.PushTime || '0 30 7 * * *',
            name: '推送真寻日报',
            fnc: () => this.推送真寻日报(),
            log: false
            // eslint-disable-next-line no-sequences
        },
            Object.defineProperty(this.task, 'log', { get: () => false })
    }

    get newsConfig () { return getFunctionData('API', 'API', '真寻日报') ?? {} }

    // 优先使用内置 JSON 新闻接口生成文字日报；不可用时退回用户配置的图片 API。
    async 获取内容 () {
        try {
            const text = await getNewsText()
            if (text) { return { text } }
        } catch (error) {
            logger.error(`[真寻日报]内置接口失败: ${error}`)
        }

        const source = this.newsConfig.SourceUrl
        if (source) {
            const imageUrl = await getImageUrl(source).catch(() => null)
            if (imageUrl) { return { imageUrl } }
        }
        return null
    }

    async 推送真寻日报 () {
        try {
            if (!this.newsConfig.isAutoPush) {
                logger.info('[真寻日报]自动推送未启用。')
                return false
            }

            const groups = Array.isArray(this.newsConfig.PushGroupList) ? this.newsConfig.PushGroupList : []
            if (!groups.length) {
                logger.info('[真寻日报]未配置推送群，跳过推送。')
                return false
            }

            const content = await this.获取内容()
            if (!content) {
                logger.error('[真寻日报]没有可用的内容，跳过推送。')
                return false
            }

            logger.info('[真寻日报]开始推送……')
            for (let i = 0; i < groups.length; i++) {
                // 添加延迟以防止消息发送过快
                setTimeout(async () => {
                    const group = Bot.pickGroup(groups[i])
                    logger.info(`[真寻日报]正在向群组 ${group} 推送日报。`)
                    await group.sendMsg(content.text ? [content.text] : [segment.image(content.imageUrl)])
                    logger.info(`[真寻日报]日报已成功推送到群组 ${group}。`)
                }, i * 1000)
            }

            logger.info('[真寻日报]推送完成。')
            return true
        } catch (error) {
            logger.error(`[真寻日报]推送过程中出现错误: ${error}`)
        }
    }

    async 真寻日报 (e) {
        const content = await this.获取内容()
        if (!content) {
            await e.reply('获取日报失败，请稍后再试或配置可用的图片 API')
            return false
        }

        await e.reply(content.text ?? [segment.image(content.imageUrl)])
        return true
    }
}
