import setting from '../model/setting.js'
import { readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import common from '../../../lib/common/common.js'
import {
  saveImage,
  imageUrlsFromMessage,
  findImageFile,
  imageNumbers,
  generateRanges,
} from '../utils/saved-images.mjs'

const NO_PERMISSION = '非主人，取消指令'
const NO_IMAGES = '没有找到可保存的图片'
const SAVE_FAILED = '保存失败，请再次尝试或手动保存'
const MISSING_DIRECTORY = '目录不存在'

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
    if (!await requireMaster(e, true)) return false

    const savePath = this.appconfig.EmojiPath
    const { files, failed } = await saveFiles(e, savePath)
    if (!files.length) {
      await e.reply(failed ? SAVE_FAILED : NO_IMAGES)
      return false
    }

    const message = files.map(name => [name, segment.image(toFileUri(savePath, name))])
    if (message.length > 1) {
      await e.reply(await common.makeForwardMsg(e, message, '保存表情包列表'))
    } else {
      await e.reply(message[0])
    }
    if (failed) await e.reply(`有${failed}张图片保存失败`, true)

    return true
  }

  async 查看表情包 (e) {
    if (!await requireMaster(e)) return false
    await handleEmoticon(e, this.appconfig.EmojiPath, messageNumber(e.msg), '表情包')
    return true
  }

  async 删除表情包 (e) {
    if (!await requireMaster(e)) return false
    await deleteEmoticon(e, this.appconfig.EmojiPath, messageNumber(e.msg), '表情包')
    return true
  }

  async 保存涩图 (e) {
    if (!await requireMaster(e, true)) return false

    const { files, failed } = await saveFiles(e, this.appconfig.SetuPath)
    if (!files.length) {
      await e.reply(failed ? SAVE_FAILED : NO_IMAGES)
      return false
    }

    const numbers = files.map(name => parseInt(name, 10)).filter(Number.isSafeInteger)
    await e.reply(`保存成功,文件列表：${generateRanges(numbers)}`, true)
    if (failed) await e.reply(`有${failed}张图片保存失败`, true)

    return true
  }

  async 查看涩图 (e) {
    if (!await requireMaster(e)) return false
    await handleEmoticon(e, this.appconfig.SetuPath, messageNumber(e.msg), '涩图')
    return true
  }

  async 删除涩图 (e) {
    if (!await requireMaster(e)) return false
    await deleteEmoticon(e, this.appconfig.SetuPath, messageNumber(e.msg), '涩图')
    return true
  }
}

/** 非主人只记录日志；需要提示用户时传 quiet=false。 */
async function requireMaster (e, quiet = false) {
  if (e.isMaster) return true
  logger.info(NO_PERMISSION)
  if (!quiet) await e.reply(NO_PERMISSION)
  return false
}

/** 从消息中取第一个正整数编号；没有或非法时返回 0。 */
function messageNumber (msg) {
  const match = /\d+/.exec(String(msg ?? ''))
  if (!match) return 0
  const number = Number(match[0])
  return Number.isSafeInteger(number) && number > 0 ? number : 0
}

function toFileUri (savePath, fileName) {
  return pathToFileURL(path.join(savePath, fileName)).href
}

async function listImageFiles (e, savePath) {
  try {
    return await readdir(savePath)
  } catch {
    await e.reply(MISSING_DIRECTORY, true)
    return null
  }
}

async function deleteEmoticon (e, savePath, number, name) {
  if (!number) {
    await e.reply('无编号', true)
    return false
  }

  const files = await listImageFiles(e, savePath)
  if (!files) return false

  const fileToDelete = findImageFile(files, number)
  if (!fileToDelete) {
    await e.reply(`编号为${number}的${name}不存在`, true)
    return false
  }

  try {
    await unlink(path.join(savePath, fileToDelete))
  } catch (error) {
    logger.error(`[保存表情包] 删除${name}${number}失败: ${error}`)
    await e.reply(`删除失败：${error.message}`, true)
    return false
  }
  await e.reply(`编号为${number}的${name}已被删除`, true)
  return true
}

async function handleEmoticon (e, savePath, number, name) {
  const files = await listImageFiles(e, savePath)
  if (!files) return false

  if (!number) {
    await e.reply(`当前目录下，${name}编号为${generateRanges(imageNumbers(files))}`, true)
    return true
  }

  const file = findImageFile(files, number)
  if (!file) {
    await e.reply(`编号为${number}的${name}不存在`, true)
    return false
  }
  await e.reply([`${name}编号${number}`, segment.image(toFileUri(savePath, file))])
  return true
}

/** 依次下载消息中的图片；返回成功文件名、失败数量与图片总数。 */
async function saveFiles (e, savePath) {
  const urls = await collectImageUrls(e)
  const files = []
  let failed = 0

  for (const url of urls) {
    try {
      files.push(await saveImage(url, savePath))
    } catch (error) {
      failed++
      logger.error(`[保存表情包] 下载失败 ${url}: ${error}`)
    }
  }

  return { files, failed, total: urls.length }
}

/** 收集本条消息、引用消息或回复消息中的图片地址，去重后返回。 */
async function collectImageUrls (e) {
  const urls = []
  const seen = new Set()
  const push = (list) => {
    for (const url of list) {
      if (!seen.has(url)) {
        seen.add(url)
        urls.push(url)
      }
    }
  }

  if (Array.isArray(e.img)) push(e.img.filter(isHttpUrl))
  if (urls.length) return urls

  if (e.source && typeof e.group?.getChatHistory === 'function' && e.source.seq) {
    try {
      const history = await e.group.getChatHistory(e.source.seq, 1)
      const message = Array.isArray(history) ? history.pop()?.message : null
      push(imageUrlsFromMessage(message))
    } catch (error) {
      logger.error(`[保存表情包] 读取引用消息失败: ${error}`)
    }
  }
  if (urls.length) return urls

  if (typeof e.getReply === 'function') {
    try {
      const reply = await e.getReply()
      push(imageUrlsFromMessage(reply?.message))
    } catch (error) {
      logger.error(`[保存表情包] 读取回复消息失败: ${error}`)
    }
  }
  return urls
}

function isHttpUrl (value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}
