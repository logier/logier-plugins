import fs from 'node:fs'
import path from 'path';
import { promisify } from 'util';
import YAML from 'yaml';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);

async function checkAndCopy() {
  const configDir = './plugins/logier-plugin/config';
  const defSetDir = './plugins/logier-plugin/defSet';

  const configFiles = new Set(fs.readdirSync(configDir));
  const defSetFiles = fs.readdirSync(defSetDir);

  for (const file of defSetFiles) {
    if (file.endsWith('.yaml')) {
      const configPath = path.join(configDir, file);
      const defSetPath = path.join(defSetDir, file);

      if (!configFiles.has(file)) {
        // 如果 config 文件夹中没有这个文件，直接复制
        await copyFile(defSetPath, configPath);
      } else {
        // 如果 config 文件夹中有这个文件，合并内容
        const [configContent, defSetContent] = await Promise.all([
          readFile(configPath, 'utf8').then(content => YAML.parse(content)),
          readFile(defSetPath, 'utf8').then(content => YAML.parse(content)),
        ]);

        const mergedContent = { ...defSetContent, ...configContent };

        await writeFile(configPath, YAML.stringify(mergedContent), 'utf8');
      }
    }
  }
}

checkAndCopy().catch(console.error);



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


