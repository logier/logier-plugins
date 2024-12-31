import { readAndParseJSON } from '../utils/getdate.js'

export class newcomer extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]进退群群通知',
      dsc: '进退群群通知',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 4999
    })
  }

  /** 接受到消息都会执行一次 */
  async accept (e) {
    /** 定义入群欢迎内容 */

    /** 冷却cd 30s */
    let cd = 30

    if (this.e.user_id == this.e.bot.uin) return

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    logger.info('key' + key)
    if (await redis.get(key)) return
    redis.set(key, '1', { EX: cd })

    let welcome = await readAndParseJSON('../data/welcome.json')

    let nickname
    if (e.nickname) {
      nickname = e.nickname
    } else if (e.sender && e.sender.card) {
      nickname = e.sender.card
    } else {
      // 从成员列表里获取该用户昵称
      let memberMap = await e.group.getMemberMap()
      nickname = (memberMap && memberMap.get(e.user_id)) ? memberMap.get(e.user_id).nickname : ''
    }

    let randomIndex = Math.floor(Math.random() * welcome.length) // 选择一个随机的欢迎消息
    let msg = welcome[randomIndex].replace('{0}', nickname) // 将{0}替换为成员的昵称

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`),
      msg
    ])
  }
}

export class outNotice extends plugin {
  constructor () {
    super({
      name: '退群通知',
      dsc: 'xx退群了',
      event: 'notice.group.decrease'
    })

    /** 退群提示词 */
    this.tips = '退群了'
  }

  async accept () {
    if (this.e.user_id == this.e.bot.uin) return

    let name, msg
    if (this.e.member) {
      name = this.e.member.card || this.e.member.nickname
    }

    if (name) {
      msg = `${name}(${this.e.user_id}) ${this.tips}`
    } else {
      msg = `${this.e.user_id} ${this.tips}`
    }
    logger.mark(`[退出通知]${this.e.logText} ${msg}`)
    await this.reply(msg)
  }
}
