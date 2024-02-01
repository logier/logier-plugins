import plugin from '../../../lib/plugins/plugin.js'
import lodash from 'lodash'
import { render , Data } from '../components/index.js'
import Theme from './Help/Helptheme.js'

export class ql_help extends plugin {
  constructor() {
    super({
      name: 'logier帮助',
      dsc: 'logierhelp',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: '^#?(logier)(帮助|help|指令|菜单|命令)$',
          fnc: 'logierhelp'
        }
      ]
    });
  }
  async logierhelp() {
    return await help(this.e);
  }

}
async function help(e) {
  let custom = {}
  let help = {}
  let { diyCfg, sysCfg } = await Data.importCfg('help')
  custom = help
  let helpConfig = lodash.defaults(diyCfg.helpCfg || {}, custom.helpCfg, sysCfg.helpCfg)
  let helpList = diyCfg.helpList || custom.helpList || sysCfg.helpList
  let helpGroup = []
  lodash.forEach(helpList, (group) => {
    if (group.auth && group.auth === 'master' && !e.isMaster) {
      return true
    }
    lodash.forEach(group.list, (help) => {
      let icon = help.icon * 1
      if (!icon) {
        help.css = 'display:none'
      } else {
        let x = (icon - 1) % 10
        let y = (icon - x - 1) / 10
        help.css = `background-position:-${x * 50}px -${y * 50}px`
      }
    })
    helpGroup.push(group)
  })
  let themeData = await Theme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {})
  return await render('help/index', {
    helpCfg: helpConfig,
    helpGroup,
    ...themeData,
    element: 'default'
  }, { e, scale: 1 })
}