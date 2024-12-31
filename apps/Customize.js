import { getPersonality, getemoji, gpt } from '../utils/getdate.js'
import setting from '../model/setting.js'

// 导出一个问候插件
export class greetings extends plugin {
  // 构建正则匹配等
  constructor () {
    super({
      name: '[鸢尾花插件]潜伏gpt',
      event: 'message',
      priority: 5001,
      rule: [
        {
          reg: '',
          fnc: '潜伏',
          log: false
        }
      ]
    })
  }

  get appconfig () {
    return setting.getConfig('Customize')
  }

  get GPTconfig () {
    return setting.getConfig('GPTconfig')
  }

  async 潜伏 (e) {
    if (!this.GPTconfig.GPTKey) {
      return false
    }

    if (!e.msg) {
      // logger.info('[潜伏模板]非文本消息，不回复')
      return false
    }

    if (Math.random() > Number(this.appconfig.CustomizeRate)) { return false }

    let arr2 = [
      { role: 'user', content: `${e.nickname}说：${e.msg}` }]
    let gptmsgInitial = await getPersonality()
    let gptmsg = [...gptmsgInitial, ...arr2] // 创建一个新的数组，包含初始的 "personality" 和用户的消息
    // logger.info(gptmsg)
    const content = await gpt(gptmsg)

    if (content == true) {
      logger.info('[潜伏模板]key或url配置错误')
      return false
    }

    let sentences
    if (typeof content === 'string') {
      sentences = content.split(/(?<=[。！?;；:：])/g)
    } else {
      logger.info('未获取到内容', content)
    }

    // 轮流回复
    for (let index = 0; index < sentences.length; index++) {
      if (index === 0) {
        // 第一句回复时使用这种形式，并延迟3到15秒
        await new Promise(resolve => setTimeout(resolve, Math.random() * (10000 - 3000)))
        e.reply(sentences[index], true)
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000)) // 输出间隔三秒
        e.reply(sentences[index])
      }
    }

    let imageUrl = await getemoji(e, this.appconfig.CustomizeEmojiCategory)
    logger.info(this.appconfig.CustomizeEmojiCategory)
    logger.info(imageUrl)
    if (imageUrl) {
      await new Promise(resolve => setTimeout(resolve, sentences.length * 3000)) // 在所有句子都回复完之后再发送图片
      logger.info(`[潜伏模板]发送“${this.appconfig.CustomizeEmojiCategory}”表情包`)
      e.reply([segment.image(imageUrl)])
    }

    return true
  };
}
