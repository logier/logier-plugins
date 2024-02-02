import fs from 'node:fs'

if (!global.segment) {
  global.segment = (await import("oicq")).segment
}

const files = fs
  .readdirSync('./plugins/logier-plugin/apps')
  .filter((file) => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }

logger.info(logger.yellow('----------------鸢尾花插件----------------'))
logger.info(logger.yellow('  _                       _               '))
logger.info(logger.yellow(' | |       ___     __ _  (_)   ___   _ __ '))
logger.info(logger.yellow(' | |      / _ \\   / _` | | |  / _ \\ | \'__|'))
logger.info(logger.yellow(' | |___  | (_) | | (_| | | | |  __/ | |   '))
logger.info(logger.yellow(' |_____|  \\___/   \\__, | |_|  \\___| |_|   '))
logger.info(logger.yellow('                  |___/                    '))
logger.info(logger.yellow('                                         '))
logger.info(logger.yellow('----------欢迎加入Q群：315239849----------'))


