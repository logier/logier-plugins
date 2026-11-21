import setting from '../model/setting.js'
import fs from 'fs'
import path from 'path'
import common from '../../../lib/common/common.js'
import {
  saveImage,
  imageUrlsFromMessage,
  findImageFile,
  imageNumbers,
  generateRanges,
} from '../utils/saved-images.mjs'

// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]保存表情包', // 插件名称
      dsc: '保存表情包', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?(保)?(存表情)(包)?$', // 正则表达式,有关正则表达式请自行百度
          fnc: '保存表情包' // 执行方法
        },
        {
          reg: '^#?(查看表情)(包)?(\\d+)?$', // 正则表达式,有关正则表达式请自行百度
          fnc: '查看表情包' // 执行方法
        },
        {
          reg: '^#?(删除表情)(包)?(\\d+)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '删除表情包' // 执行方法
        },
        {
          reg: '^#?(保)?(存涩图)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '保存涩图' // 执行方法
        },
        {
          reg: '^#?(查看涩图)(\\d+)?$', // 正则表达式,有关正则表达式请自行百度
          fnc: '查看涩图' // 执行方法
        },
        {
          reg: '^#?(删除涩图)(\\d+)$', // 正则表达式,有关正则表达式请自行百度
          fnc: '删除涩图' // 执行方法
        }
      ]
    })
  }

  get appconfig () {
    return setting.getConfig('Config')
  }

  async 保存表情包 (e) {
    if (!e.isMaster) {
      logger.info('非主人，取消指令')
      return false
    }

    const savePath = this.appconfig.EmojiPath
    const { files, failed } = await saveFiles(e, savePath)
    if (!files.length) {
      await e.reply(failed ? '保存失败，请再次尝试或手动保存' : '没有找到可保存的图片')
      return false
    }

    const message = files.map(name => [`${name}`, segment.image(`file://${path.join(savePath, name)}`)])
    if (message.length > 1) {
      await e.reply(await common.makeForwardMsg(this.e, message, '保存表情包列表'))
    } else {
      await e.reply(message[0])
    }
    if (failed) await e.reply(`有${failed}张图片保存失败`, true)

    return true
  }

  async 查看表情包 (e) {
    if (!e.isMaster) {
      e.reply('非主人，取消指令')
      logger.info('非主人，取消指令')
      return false
    }

    const savePath = this.appconfig.EmojiPath
    let number = parseInt(this.e.msg.replace(/#?(查看表情)(包)?/, ''))

    if (!number) {
      e.reply('无编号')
      logger.info('无编号')
      return false
    }

    handleEmoticon(e, savePath, number, '表情包')

    return true
  }

  async 删除表情包 (e) {
    if (!e.isMaster) {
      e.reply('非主人，取消指令')
      logger.info('非主人，取消指令')
      return false
    }
    let number = parseInt(this.e.msg.replace(/#?(删除表情)(包)?/, ''))
    const savePath = this.appconfig.EmojiPath

    deleteEmoticon(e, savePath, number, '表情包')

    return true
  }

  async 保存涩图 (e) {
    if (!e.isMaster) {
      e.reply('非主人，取消指令')
      logger.info('非主人，取消指令')
      return false
    }

    const savePath = this.appconfig.SetuPath
    const { files, failed } = await saveFiles(e, savePath)
    if (!files.length) {
      await e.reply(failed ? '保存失败，请再次尝试或手动保存' : '没有找到可保存的图片')
      return false
    }

    const numbers = files.map(name => parseInt(name, 10)).filter(Number.isSafeInteger)
    await e.reply(`保存成功,文件列表：${generateRanges(numbers)}`, true)
    if (failed) await e.reply(`有${failed}张图片保存失败`, true)

    return true
  }

  async 查看涩图 (e) {
    if (!e.isMaster) {
      e.reply('非主人，取消指令')
      logger.info('非主人，取消指令')
      return false
    }

    const savePath = this.appconfig.SetuPath
    let number = parseInt(this.e.msg.replace(/#?(查看涩图)/, ''))

    handleEmoticon(e, savePath, number, '涩图')

    return true
  }

  async 删除涩图 (e) {
    if (!e.isMaster) {
      e.reply('非主人，取消指令')
      logger.info('非主人，取消指令')
      return false
    }
    let number = parseInt(this.e.msg.replace(/#?(删除涩图)(包)?/, ''))
    const savePath = this.appconfig.SetuPath

    deleteEmoticon(e, savePath, number, '涩图')

    return true
  }
}

function deleteEmoticon (e, savePath, number, name) {
  if (!fs.existsSync(savePath)) {
    e.reply('目录不存在', true)
    return false
  }

  const files = fs.readdirSync(savePath)
  const fileToDelete = findImageFile(files, number)

  if (!fileToDelete) {
    e.reply(`编号为${number}的${name}不存在`, true)
    return false
  }

  fs.unlinkSync(path.join(savePath, fileToDelete))
  e.reply(`编号为${number}的${name}已被删除`, true)
}

function handleEmoticon (e, savePath, number, name) {
  if (!fs.existsSync(savePath)) {
    e.reply('目录不存在', true)
    return false
  }

  const files = fs.readdirSync(savePath)
  if (number) {
    const file = findImageFile(files, number)
    if (!file) {
      e.reply([`编号为${number}的${name}不存在`])
      return false
    }
    e.reply([`${name}编号${number}`, segment.image(`file://${path.join(savePath, file)}`)])
  } else {
    e.reply(`当前目录下，${name}编号为${generateRanges(imageNumbers(files))}`, true)
  }
}

/** 依次下载消息中的图片；返回成功文件名、失败数量与图片总数。 */
async function saveFiles (e, savepath) {
  const urls = await collectImageUrls(e)
  const files = []
  let failed = 0

  for (const url of urls) {
    try {
      const number = await saveImage(url, savepath)
      const saved = await fs.promises.readdir(savepath)
      const fileName = findImageFile(saved, number)
      if (fileName) files.push(fileName)
    } catch (err) {
      failed++
      logger.error(`[保存表情包] 下载失败 ${url}: ${err}`)
    }
  }

  return { files, failed, total: urls.length }
}

/** 收集本条消息、引用消息或回复消息中的图片地址，去重后返回。 */
async function collectImageUrls (e) {
  const urls = []
  const push = (list) => {
    for (const url of list) {
      if (!urls.includes(url)) urls.push(url)
    }
  }

  if (Array.isArray(e.img)) {
    push(e.img.filter(url => typeof url === 'string' && /^https?:\/\//i.test(url)))
  }
  if (urls.length) return urls

  if (e.source && e.group?.getChatHistory && e.source.seq) {
    try {
      const history = await e.group.getChatHistory(e.source.seq, 1)
      const message = Array.isArray(history) ? history.pop()?.message : null
      push(imageUrlsFromMessage(message))
    } catch (err) {
      logger.error(`[保存表情包] 读取引用消息失败: ${err}`)
    }
  }
  if (urls.length) return urls

  try {
    const reply = await e.getReply()
    push(imageUrlsFromMessage(reply?.message))
  } catch (err) {
    logger.error(`[保存表情包] 读取回复消息失败: ${err}`)
  }
  return urls
}
