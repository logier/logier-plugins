import setting from '../model/setting.js'
import fs from 'fs'
import path from 'path'
import https from 'https'
import common from '../../../lib/common/common.js'

const _path = process.cwd()

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

    let fileNames = await saveFiles(e, this.appconfig.EmojiPath)
    let message = []
    for (let i of fileNames) {
        let namePath = path.join(this.appconfig.EmojiPath, i)
        message.push([`${i}`, segment.image(`file://${namePath}`)])
    }
    
    if(fileNames.length>1){
        e.reply(await common.makeForwardMsg(this.e, message, '保存表情包列表'));
    }else{
        e.reply(message[0])
    }

    return true
  }

  async 查看表情包 (e) {
    if (!e.isMaster) {
      logger.info('非主人，取消指令')
      return false
    }

    const savePath = this.appconfig.EmojiPath
    let number = parseInt(this.e.msg.replace(/#?(查看表情)(包)?/, ''))

    if (!number) {
      logger.info('无编号')
      return false
    }

    handleEmoticon(e, savePath, number, '表情包')

    return true
  }

  async 删除表情包 (e) {
    if (!e.isMaster) {
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
      logger.info('非主人，取消指令')
      return false
    }

    if (!e.img && !e.source) {
      logger.info('没有图片')
      return false
    }

    let fileNames = await saveFiles(e, this.appconfig.SetuPath)

    e.reply(`保存成功,文件列表：${generateRanges(fileNames)}`, true);

    return true
  }

  async 查看涩图 (e) {
    if (!e.isMaster) {
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
  const fileToDelete = files.find(file => parseInt(file.split('.')[0]) === number)

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

  if (number) {
    let exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'] // 可能的文件扩展名
    let filePath, fileUrl

    for (let ext of exts) {
      filePath = path.join(savePath, `${number}.${ext}`)
      if (fs.existsSync(filePath)) {
        // 如果文件存在，获取它的链接
        fileUrl = `file://${filePath}`
        e.reply([`${name}编号${number}`, segment.image(fileUrl)])
        break
      }
    }

    if (!fileUrl) {
      e.reply([`编号为${number}的${name}不存在`])
    }
  } else {
    const files = fs.readdirSync(savePath)
    const numbers = files.map(file => parseInt(file.split('.')[0])).sort((a, b) => a - b)

    let ranges = []
    for (let i = 0; i < numbers.length; i++) {
      let start = numbers[i]
      while (i + 1 < numbers.length && numbers[i + 1] === numbers[i] + 1) {
        i++
      }
      let end = numbers[i]
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
    }

    e.reply(`当前目录下，${name}编号为${ranges.join(', ')}`, true)
  }
}

async function saveFiles (e, savepath) {
  let fileNames  = []
  if (e.img) {
    for (let img of e.img) {
      try {
        const fileName = await saveFile(img, savepath);
        console.log(`File saved successfully with name ${fileName}`);
        fileNames.push(fileName);
      } catch (err) {
        console.error(err)
        e.reply('保存失败，请再次尝试或手动保存', true)
        return true
      }
    }
  } else if (e.source) {
    const reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message
    logger.info(reply)
    if (reply) {
      for (let item of reply) {
        if (item.type === 'image') {
          try {
            const fileName = await saveFile(img, savepath);
            console.log(`File saved successfully with name ${fileName}`);
            fileNames.push(fileName);
          } catch (err) {
            console.error(err)
            e.reply('保存失败，请再次尝试或手动保存', true)
            return true
          }
        }
      }
    }
  } else if ((await e.getReply()).message) {
    const reply = (await e.getReply()).message
    if (reply) {
      for (let item of reply) {
        if (item.type === 'image' || item.type === 'mface') {
          try {
            const fileName = await saveFile(item.url, savepath);
            console.log(`File saved successfully with name ${fileName}`);
            fileNames.push(fileName);
          } catch (err) {
            console.error(err)
            e.reply('保存失败，请再次尝试或手动保存', true)
            return true
          }
        }
      }
    }
  } else {
    return false
  }
  return fileNames
}

function generateRanges (fileNumbers) {
  // let ranges = []
  // fileNumbers.sort((a, b) => a - b)
  // for (let i = 0; i < fileNumbers.length; i++) {
  //   let start = fileNumbers[i]
  //   while (i + 1 < fileNumbers.length && fileNumbers[i + 1] === fileNumbers[i] + 1) {
  //     i++
  //   }
  //   let end = fileNumbers[i]
  //   ranges.push(start === end ? `${start}` : `${start}-${end}`)
  // }
  //直接返回文件名列表
  return fileNumbers.join(', ');
}

function findFirstUnusedNumber (files) {
  let counter = 1
  const numbers = files.map(file => parseInt(file.split('.')[0]))
  while (numbers.includes(counter)) {
    counter++
  }
  return counter
}

async function saveFile (url, savePath) {
  return new Promise((resolve, reject) => {
    // 检查文件夹是否存在，如果不存在就创建
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true })
    }

    // 获取当前路径下的文件数量作为计数器
    const files = fs.readdirSync(savePath)
    const counter = findFirstUnusedNumber(files)

    https.get(url, (res) => {
      // 从响应头获取文件类型
      const fileType = res.headers['content-type'].split('/')[1]
      // 使用计数器生成文件名
      const fileName = `${counter}.${fileType}`
      // 创建可写流
      const fileStream = fs.createWriteStream(path.join(savePath, fileName))
      // 将响应流导入文件流
      res.pipe(fileStream)
      // 监听 'finish' 事件
      fileStream.on('finish', () => {
        console.log(`File saved as ${fileName}`)
        resolve(fileName) // 返回文件名
      })
      // 监听 'error' 事件
      fileStream.on('error', (err) => {
        console.error(`Error saving file: ${err}`)
        reject(err)
      })
    }).on('error', (err) => {
      console.error(`Error making request: ${err}`)
      reject(err)
    })
  })
}
