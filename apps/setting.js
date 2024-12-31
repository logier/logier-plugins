import setting from '../model/setting.js'

// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花]设置', // 插件名称
      dsc: '设置', // 插件描述
      event: 'message', // 更多监听事件请参考下方的 Events
      priority: 5000, // 插件优先度，数字越小优先度越高
      rule: [
        {
          reg: '^#?鸢尾花(开启|关闭)(本群)?定时发图$', // 正则表达式,有关正则表达式请自行百度
          fnc: '鸢尾花定时发图设定' // 执行方法
        }
      ]
    })
  }

  // 执行方法1
  async 鸢尾花定时发图设定 (e) {
    // 假设你的应用名为'appName'
    let config = setting.getConfig('Push')

    // 使用正则表达式匹配消息
    let match = e.msg.match(/^#?鸢尾花(开启|关闭)(本群)?定时发图$/)

    if (match) {
    // 获取匹配到的操作（开启或关闭）和是否包含'本群'
      let operation = match[1]
      let isGroup = match[2]

      // 遍历'Push'数组找到'FunctionName'为'定时发图'的项
      for (let item of config.Push) {
        if (item.FunctionName === '定时发图') {
          if (isGroup) {
            // 如果出现'本群'
            if (operation === '开启') {
            // 如果是'开启'，就在'PushGroupList'数组中添加'e.group_id'
              if (!item.PushGroupList.includes(e.group_id)) {
                item.PushGroupList.push(e.group_id)
                e.reply(`定时发图添加群：${e.group_id}`, true) // 输出添加的群组ID
              }
            } else {
            // 如果是'关闭'，就从'PushGroupList'数组中删除'e.group_id'
              let index = item.PushGroupList.indexOf(e.group_id)
              if (index !== -1) {
                item.PushGroupList.splice(index, 1)
                e.reply(`定时发图添加群：${e.group_id}`, true) // 输出移除的群组ID
              }
            }
          } else {
            // 如果不包含'本群'
            if (operation === '开启') {
            // 如果是'开启'，就将'isAutoPush'设置为'true'
              item.isAutoPush = true
              e.reply('定时发图已开启', true) // 输出设置isAutoPush为true
            } else {
            // 如果是'关闭'，就将'isAutoPush'设置为'false'
              item.isAutoPush = false
              e.reply('定时发图已关闭', true) // 输出设置isAutoPush为false
            }
          }
          break
        }
      }

      // 将修改后的配置写回文件
      setting.setConfig('Push', config)
    }

    return true
  }
}
