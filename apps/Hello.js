import { gpt, getPersonality, getTimeOfDay } from '../utils/getdate.js'
import setting from '../model/setting.js'

// 导出一个问候插件
export class greetings extends plugin {
  // 构建正则匹配等
  constructor () {
    super({
      name: '[鸢尾花插件]每日问候',
      event: 'message',
      priority: 4999,
      rule: [
        {
          reg: '^(早上好|晚上好|早安|晚安|早|睡觉了|中午好|午安|上午好|下午好)$',
          fnc: 'greetings'
        }
      ]
    })
  }

  get GPTconfig () {
    return setting.getConfig('GPTconfig')
  }

  // 早安问候
  async greetings (e) {
    if (!this.GPTconfig.GPTKey) {
      logger.info('未配置GPTKey')
      return false
    }

    let arr2 = [
      { role: 'system', content: `现在的时间是${getTimeOfDay()}，请你结合现在的时间和我的话来回复。` },
      { role: 'user', content: `${e.msg}` }]
    let gptmsg = await getPersonality()
    gptmsg.push(...arr2)
    const content = await gpt(gptmsg)

    if (content == true) {
      logger.info('[鸢尾花插件]key或url配置错误，')
      return false
    }
    e.reply(content, true)

    return true
  };
}
