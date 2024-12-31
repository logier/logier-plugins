import { gpt, getemoji, getPersonality } from '../utils/getdate.js'
import setting from '../model/setting.js'

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]戳一戳表情包',
      dsc: '戳一戳表情包',
      event: 'notice.group.poke',
      priority: 4999,
      rule: [
        {
          fnc: '戳一戳表情包'
        }
      ]
    })
  }

  get GPTconfig () {
    return setting.getConfig('GPTconfig')
  }

  get appconfig () {
    return setting.getConfig('Config')
  }

  async 戳一戳表情包 (e) {
    if (e.target_id == e.self_id) {
      if (Math.random() > this.appconfig.PokeEmojiRate || !this.GPTconfig.GPTKey) {
        sendEmoji(e, this.appconfig.PokeEmojiCategory)
      } else {
        let userMessage = { role: 'user', content: '戳一戳你' }
        let gptmsg = await getPersonality()
        gptmsg.push(userMessage)
        const content = await gpt(gptmsg)
        if (content == true) {
          logger.info(`GPT调用失败，改为发送“${this.appconfig.PokeEmojiCategory}”表情包`)
          sendEmoji(e, this.appconfig.PokeEmojiCategory)
          return true
        }
        e.reply(content)
      }
    }
    return true
  }
}

async function sendEmoji (e, category) {
  e.reply([segment.image(await getemoji(e, category))])
}
