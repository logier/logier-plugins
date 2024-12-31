import { getemoji, readAndParseJSON } from '../utils/getdate.js'
const emojiMap = await readAndParseJSON('../data/EmojiReg.json')

function createRules () {
  const regexes = Object.keys(emojiMap)
  return regexes.join('|')
}

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]表情包仓库',
      dsc: '发送表情包',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: `^(${createRules()})$`,
          fnc: '表情包仓库'
        }
      ]
    })
  }

  async 表情包仓库 (e) {
    const category = Object.entries(emojiMap).find(([key, value]) => new RegExp(key).test(e.msg))?.[1]
    logger.info(category)

    if (category) {
      const imageUrl = await getemoji(e, category)
      logger.info(imageUrl)
      if (imageUrl) {
        logger.info(`[表情包仓库]发送“${category}”表情包`)
        e.reply([segment.image(imageUrl)])
      }
    }
    return true
  }
}
