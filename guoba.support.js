import path from "path";
import setting from "./model/setting.js";
import lodash from "lodash";
import { readAndParseJSON } from './utils/getdate.js'

const _path = process.cwd() + "/plugins/logier-plugin";
const EmojiIndexs = await readAndParseJSON('../data/EmojiIndex.json');
let EmojiIndex = Object.keys(EmojiIndexs).map(k => ({label: k, value: k}));
EmojiIndex.push({label: '自定义', value: '自定义'});

const EmojiIndexex = [{label: '表情包仓库', value: '表情包仓库'} , ...EmojiIndex];

const personalitys = await readAndParseJSON('../data/personality.json');
let personality = Object.keys(personalitys).map(k => ({label: k, value: k}));


export function supportGuoba() {

  let allGroup = [];
  Bot.gl.forEach((v, k) => { allGroup.push({label: `${v.group_name}(${k})`, value: k}); });
  allGroup.push({label: 'default', value: 'default'}); 
  
  let setimage = [{label: `定时发图`, value: `定时发图`},{label: `今日运势`, value: `今日运势`},{label: `算一卦`, value: `算一卦`},{label: `今日签到`, value: `今日签到`},{label: `城市天气`, value: `城市天气`},{label: `default`, value: `default`}]

  let push = [{label: `定时发图`, value: `定时发图`},{label: `摸鱼日历`, value: `摸鱼日历`},{label: `今日新闻`, value: `今日新闻`},{label: `今日番剧`, value: `今日番剧`},{label: `订阅小说`, value: `订阅小说`}]

  return {
    pluginInfo: {
      name: "鸢尾花插件",
      title: "鸢尾花插件(logier-plugin)",
      author: "@logier",
      authorLink: "https://gitee.com/logier",
      link: "https://gitee.com/logier/logier-plugins",
      isV3: true,
      isV2: false,
      description: "表情包仓库、定时系列和运势系列",
      icon: "mdi:stove",
      iconColor: "#d19f56",
      iconPath: path.join(_path, "resources/img/-zue37Q5-e39pZlT3cSiw-il.jpeg"),
    },
      // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [

    {
      component: 'Divider',
      label: '表情包黑名单'
    },
    {
      field: "EmojiHub.BlackList",
      label: "黑名单配置",
      bottomHelpMessage: '屏蔽你不想要的表情包类别',
      component: "GSubForm",
      componentProps: {
        multiple: true,
        schemas: [
          {
            field: "group",
            label: "群号",
            bottomHelpMessage: '未配置的群使用default设置',
            component: 'Select',
            componentProps: {
              options: allGroup,
            },
          },
          {
            field: 'Emojiindexs',
            label: '黑名单',
            bottomHelpMessage: '指令触发和仓库内随机都会屏蔽',
            component: 'Select',
            componentProps: {
              allowAdd: true,
              allowDel: true,
              mode: 'multiple',
              options: EmojiIndex,
            },
          },
        ],
      },
    },

    {
      component: 'Divider',
      label: '表情包小偷设置'
    },
    {
      field: "EmojiThief.ETGroupRate",
      label: "群配置",
      bottomHelpMessage: '表情包小偷分群配置发图概率',
      component: "GSubForm",
      componentProps: {
        multiple: true,
        schemas: [
          {
            field: 'groupList',
            label: '随机表情包群号',
            bottomHelpMessage: '不配置所有群都会发，配置了就只会在配置的群发送',
            component: 'GSelectGroup',
          },
          {
            field: 'rate',
            label: '随机发图概率',
            bottomHelpMessage: '随机发图概率，推荐0.05',
            component: "Slider",
              componentProps: {
                min: 0,
                max: 1,
                step: 0.01,
              },
          },
          {
            field: 'EmojiRate',
            label: '表情包仓库概率',
            bottomHelpMessage: '使用表情包仓库发图的概率',
            component: "Slider",
              componentProps: {
                min: 0,
                max: 1,
                step: 0.1,
              },
          },
        ],
      },
    },
    {
      field: 'EmojiThief.DefalutReplyRate',
      label: '默认概率',
      bottomHelpMessage: '不配置群时使用此概率',
      component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      field: 'EmojiThief.DefalutEmojiRate',
      label: '仓库概率',
      bottomHelpMessage: '使用表情包仓库发图的默认概率，如果偷的图比较少推荐拉高点，减少发图重复',
      component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    {
      field: 'EmojiThief.ETEmojihubCategory',
      label: '图类',
      bottomHelpMessage: '使用表情包仓库时的表情包种类',
      component: 'Select',
      componentProps: {
        allowAdd: true,
        allowDel: true,
        options: EmojiIndexex,
      },
    },

    {
      component: 'Divider',
      label: 'GPT相关设置'
    },
    {
      field: 'GPTconfig.GPTKey',
      label: 'key',
      bottomHelpMessage: '请前往https://github.com/chatanywhere/GPT_API_free获得',
      component: 'InputPassword',
      componentProps: {
        placeholder: 'GPTkey',   
      },
  },
  {
    field: 'GPTconfig.DefaultPersonalitySwitch',
    label: '预设开关',
    bottomHelpMessage: '开启则使用预设人格',
    component: 'Switch',
  },
  {
    field: 'GPTconfig.DefaultPersonality',
    label: '预设人格',
    bottomHelpMessage: '挑一个你喜欢的',
    component: 'Select',
    componentProps: {
      options: personality,
    },
  },
  {
    field: "GPTconfig.CustomPersonality",
    label: "自定义人格",
    bottomHelpMessage: "关闭预设人格后将使用自定义人格，",
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: 'role',
          label: 'role',
          component: 'Select',
          bottomHelpMessage: '不懂是什么意思就全用system',
          componentProps: {
            options: [
              {label: 'system' ,value : 'system'},
              {label: 'assistant',value : 'assistant'},
              {label: 'user',value : 'user'},
            ],
          }},
        {
          field: "content",
          label: "content",
          bottomHelpMessage: '对话内容',
          component: "Input",
          mode: 'tags',
          required: true,
        },
      ],
    },
  },



  {
    component: 'Divider',
    label: '推送相关设置'
  },
  {
    field: "Push.Push",
    label: "推送",
    bottomHelpMessage: '设定推送功能',
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "FunctionName",
          label: "功能",
          component: 'Select',
          componentProps: {
            options: push,
          },
        },
        {
          field: 'isAutoPush',
          label: '推送开关',
          component: 'Switch'
        },
        {
          field: 'PushTime',
          label: '推送时间',
          bottomHelpMessage: '推送时间，使用cron表达式',
          component: 'Input',
        },
        {
          field: 'PushGroupList',
          label: '推送群号',
          bottomHelpMessage: '推送群号',
          component: 'GSelectGroup',
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '天气相关设置'
  },
  {
    field: 'Weather.WeatherKey',
    label: 'key',
    bottomHelpMessage: '和风天气key，请前往https://console.qweather.com/#/console获得',
    component: 'InputPassword',
  },
  {
    field: 'Weather.WeatherPushSwitch',
    label: '推送开关',
    bottomHelpMessage: '是否推送天气',
    component: 'Switch'
  },
  {
    field: 'Weather.WeatherPushTime',
    label: '推送时间',
    bottomHelpMessage: '推送天气时间，使用cron表达式',
    component: 'Input',
  },
  {
    field: "Weather.WeatherPushgroup",
    label: "群配置",
    bottomHelpMessage: '分群配置天气推送城市',
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: 'group',
          label: '推送群号',
          component: 'GSelectGroup',
        },
        {
          field: 'city',
          label: '推送城市',
          component: 'Input',
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '图源相关设置'
  },
  {
    field: "Urls.Urls",
    label: "图源",
    component: "GSubForm",
    bottomHelpMessage: '设置不同功能使用的图源',
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "FunctionName",
          label: "功能",
          component: 'Select',
          bottomHelpMessage: '如果没有配置就使用default图源',
          componentProps: {
            options: setimage,
          },
        },
        {
          field: "imageUrls",
          label: "图片链接",
          bottomHelpMessage: '自定义图源地址，支持本地文件夹和网络',
          component: 'GTags',
          componentProps: {
            allowAdd: true,
            allowDel: true,
          },
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '自定义指令图片api相关设置'
  },
  {
    field: "CustomApi.CustomApi",
    label: "自定义api",
    component: "GSubForm",
    bottomHelpMessage: '自定义指令发送不同的图片api',
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "FunctionName",
          label: "指令",
          bottomHelpMessage: '自定义指令，支持正则',
          component: 'Input',
        },
        {
          field: "imageUrls",
          label: "api地址",
          bottomHelpMessage: '自定义图源地址，支持网络何本地文件夹',
          component: 'GTags',
          componentProps: {
            allowAdd: true,
            allowDel: true,
          },
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '潜伏模板设置'
  },
  {
    field: 'Customize.CustomizeRate',
    label: '回复概率',
    bottomHelpMessage: '收到群聊消息后，随机gpt回复的概率',
    component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.01,
      },
  },
  {
    field: 'Customize.CustomizeEmojiCategory',
    label: '图类',
    bottomHelpMessage: '随机回复后发送的表情包类别',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      options: EmojiIndexex,
    },
  },
  

  {
    component: 'Divider',
    label: '表情包仓库设置'
  },
  {
    field: 'Config.CustomerRate',
    label: '自定义表情几率',
    bottomHelpMessage: '发送表情包时使用自定义表情包的概率，当表情包仓库类别为“表情包仓库”时有效',
    component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.01,
      },
  },
  {
    field: 'Config.CustomeEmoji',
    label: '自定义表情地址',
    bottomHelpMessage: '自定义表情包地址，支持本地文件夹和网络',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
    },
  },

  {
    component: 'Divider',
    label: '戳一戳表情包设置'
  },
  {
    field: 'Config.PokeEmojiRate',
    label: '戳戳GPT',
    helpMessage: '如果gpt请求失败，会转为回复表情包',
    bottomHelpMessage: '戳一戳时，使用gpt回复的概率',
    component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.1,
      },
  },
  {
    field: 'Config.PokeEmojiCategory',
    label: '戳一戳表情包',
    helpMessage: '“表情包仓库”就是全随机',
    bottomHelpMessage: '戳一戳表情包回复时使用的表情包种类',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      options: EmojiIndexex,
    },
  },

{
  component: 'Divider',
  label: '保存图片设置'
},
{
    field: 'Config.EmojiPath',
    label: '表情保存地址',
    bottomHelpMessage: '表情包保存地址',
    component: 'Input',
},
{
  field: 'Config.SetuPath',
  label: '涩图保存地址',
  bottomHelpMessage: '涩图保存地址',
  component: 'Input',
},


{
  component: 'Divider',
  label: 'GPT请求设置'
},
{
  field: 'GPTconfig.GPTModel',
  label: '模型',
  bottomHelpMessage: 'gpt模型，chatanywhere免费key最高只支持gpt-3.5-turbo',
  component: 'Input',
},
{
  field: 'GPTconfig.GPTUrl',
  label: '地址',
  bottomHelpMessage: '使用openai官方key请修改为https://gpt.lucent.blog/v1/chat/completions',
  component: 'Input',
},

],

      getConfigData () {
          return setting.merge()
        },
        // 设置配置的方法（前端点确定后调用的方法）
        setConfigData (data, { Result }) {
          let config = {}
          for (let [keyPath, value] of Object.entries(data)) {
            lodash.set(config, keyPath, value)
          }
          config = lodash.merge({}, setting.merge, config)
          setting.analysis(config)
          return Result.ok({}, '保存成功~')
        }
      }
    }
  }
