import path from "path";
import setting from "./model/setting.js";
import lodash from "lodash";
import { readAndParseJSON ,readAndParseYAML} from './utils/getdate.js'

const _path = process.cwd() + "/plugins/logier-plugin";
const EmojiIndexs = await readAndParseJSON('../data/EmojiIndex.json');
let EmojiIndex = Object.keys(EmojiIndexs).map(k => ({label: k, value: k}));
EmojiIndex.push({label: '自定义', value: '自定义'});

const EmojiIndexex = [{label: '表情包仓库', value: '表情包仓库'} , ...EmojiIndex];

const personalitys = await readAndParseJSON('../data/personality.json');
let personality = Object.keys(personalitys).map(k => ({label: k, value: k}));

const pushs = await readAndParseYAML('../config/push.yaml');
let push = pushs.setpush
  .filter(item => item.功能 !== '城市天气')
  .map(item => ({label: item.功能, value: item.功能}));


export function supportGuoba() {

  let allGroup = [];
  Bot.gl.forEach((v, k) => { allGroup.push({label: `${v.group_name}(${k})`, value: k}); });
  allGroup.push({label: 'default', value: 'default'}); 
  
  let setimage = [{label: `定时发图`, value: `定时发图`},{label: `今日运势`, value: `今日运势`},{label: `算一卦`, value: `算一卦`},{label: `今日签到`, value: `今日签到`},{label: `城市天气`, value: `城市天气`},{label: `default`, value: `default`}]

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
      iconPath: path.join(_path, "img/-zue37Q5-e39pZlT3cSiw-il.jpeg"),
    },
      // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [


      {
        component: 'Divider',
        label: '表情包仓库设置'
      },
      {
        field: 'config.customerrate',
        label: '自定义表情几率',
        helpMessage: '表情包仓库随机时使用，不影响单独使用',
        bottomHelpMessage: '触发表情包时使用自定义表情包的概率',
        component: "Slider",
          componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
          },
      },
      {
        field: 'config.imageUrls',
        label: '自定义表情地址',
        helpMessage: '填写保存表情包地址，可以在表情包仓库随机你存入的表情',
        bottomHelpMessage: '自定义表情包地址，可以本地文件夹和网络链接',
        component: 'GTags',
        componentProps: {
          allowAdd: true,
          allowDel: true,
        },
      },
    {
        field: 'config.emojipath',
        label: '表情保存地址',
        helpMessage: '存入自定义表情包地址，可以在表情包仓库随机你存入的表情',
        bottomHelpMessage: '表情包保存地址',
        component: 'Input',
    },
    {
      field: 'config.setupath',
      label: '涩图保存地址',
      helpMessage: '存入涩图，可以将地址填入需要图片的插件',
      bottomHelpMessage: '涩图保存地址',
      component: 'Input',
  },
    {
      field: 'config.chuoyichuocategory',
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
      field: "emojihub.blackgouplist",
      label: "表情包黑名单",
      helpMessage: '分群配置，没有配置就使用default的配置',
      bottomHelpMessage: '屏蔽你不想要的表情包类别',
      component: "GSubForm",
      componentProps: {
        multiple: true,
        schemas: [
          {
            field: "group",
            label: "群号",
            component: 'Select',
            componentProps: {
              options: allGroup,
            },
          },
          {
            field: 'NotEmojiindex',
            label: '表情包黑名单',
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
      field: 'config.emojirate',
      label: '随机表情包几率',
      bottomHelpMessage: '群聊中收到消息后随机发送表情包的几率',
      component: "Slider",
        componentProps: {
          min: 0,
          max: 1,
          step: 0.01,
        },
    },
    {
      field: 'config.groupList',
      label: '随机表情包群号',
      bottomHelpMessage: '只有填入的群号才会在接收到消息后随机发送表情包',
      component: 'GSelectGroup',
      componentProps: {
        placeholder: '发送随机表情包的群号',
      }
    },
    {
      field: 'config.thiefrate',
      label: '表情包仓库几率',
      bottomHelpMessage: '不使用偷取的表情包，而是表情包仓库发送的概率',
      component: "Slider",
        componentProps: {
          min: 0,
          max: 1,
          step: 0.1,
        },
    },
    {
      field: 'config.thiefcategory',
      label: '表情包仓库图类',
      helpMessage: '不影响发送偷取的表情包',
      bottomHelpMessage: '使用表情包仓库时的表情包种类',
      component: 'Select',
      componentProps: {
        allowAdd: true,
        allowDel: true,
        options: EmojiIndexex,
      },
    },
    {
      field: 'config.minDelay',
      label: '发送表情包延迟',
      helpMessage: '延迟发送能让机器人回复不像指令触发，推荐写久点',
      bottomHelpMessage: '延迟的最小值',
      component: 'InputNumber',
      componentProps: {
        placeholder: "请输入表情最低延迟",
        addonAfter: "秒",
      },
    },
    {
      field: 'config.maxDelay',
      label: '发送表情包延迟',
      helpMessage: '延迟发送能让机器人回复不像指令触发，推荐写久点',
      bottomHelpMessage: '延迟的最大值',
      component: 'InputNumber',
      componentProps: {
        placeholder: "请输入表情最高延迟",
        addonAfter: "秒",
      },
    },

    {
      component: 'Divider',
      label: 'GPT相关设置'
    },
    {
      field: 'key.gptkey',
      label: 'GPTkey',
      bottomHelpMessage: '请前往https://github.com/chatanywhere/GPT_API_free获得',
      component: 'InputPassword',
      componentProps: {
        placeholder: 'GPTkey',   
      },
  },
  {
    field: 'key.defaultswitch',
    label: '是否使用默认人格',
    bottomHelpMessage: '关闭则使用自定义人格',
    component: 'Switch',
  },
  {
    field: 'key.defaultpersonality',
    label: '默认人格',
    bottomHelpMessage: '默认人格',
    component: 'Select',
    componentProps: {
      options: personality,
    },
  },
  {
    field: "key.messages",
    label: "自定义GPT人格",
    bottomHelpMessage: "自定义GPT人格",
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
          component: "Input",
          mode: 'tags',
          required: true,
        },
      ],
    },
  },
  {
    field: 'config.chuoyichuorate',
    label: '戳戳GPT',
    helpMessage: '填0就全用表情包回复戳一戳',
    bottomHelpMessage: '戳一戳机器人后GPT回复的几率',
    component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.1,
      },
  },
  {
    field: 'qianfu.qianfu',
    label: '潜伏概率',
    bottomHelpMessage: '偷听群友对话，并回复的概率',
    component: "Slider",
      componentProps: {
        min: 0,
        max: 1,
        step: 0.01,
      },
  },
  {
    field: 'qianfu.qianfucategory',
    label: '潜伏发送表情包类别',
    bottomHelpMessage: '潜伏发送表情包类别',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      options: EmojiIndexex,
    },
  },
  {
    field: 'key.model',
    label: 'GPT模型',
    bottomHelpMessage: 'gpt模型，chatanywhere免费key最高只支持gpt-3.5-turbo',
    component: 'Input',
  },
  {
    field: 'key.gpturl',
    label: 'GPTurl',
    bottomHelpMessage: 'gpt请求地址，key是chatanywhere的不用修改这里',
    component: 'Input',
  },

  {
    component: 'Divider',
    label: '天气相关设置'
  },
  {
    field: 'key.qweather',
    label: '和风天气key',
    bottomHelpMessage: '和风天气key，请前往https://console.qweather.com/#/console获得',
    component: 'InputPassword',
  },
  {
    field: 'push.isWeatherAutoPush',
    label: '推送天气开关',
    bottomHelpMessage: '推送天气开关',
    component: 'Switch'
  },
  {
    field: 'push.Weathertime',
    label: '推送天气时间',
    bottomHelpMessage: '推送天气时间，使用cron表达式',
    component: 'Input',
  },
  {
    field: "push.PushWeather",
    label: "天气推送",
    bottomHelpMessage: '设定天气推送功能',
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: 'group',
          label: '推送群号',
          bottomHelpMessage: '推送群号',
          component: 'GSelectGroup',
        },
        {
          field: 'city',
          label: '推送城市',
          bottomHelpMessage: '推送城市',
          component: 'Input',
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '推送相关设置'
  },
  {
    field: "push.setpush",
    label: "推送",
    bottomHelpMessage: '设定推送功能',
    component: "GSubForm",
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "功能",
          label: "功能",
          component: 'Select',
          componentProps: {
            options: push,
          },
        },
        {
          field: 'isAutoPush',
          label: '推送开关',
          bottomHelpMessage: '推送开关',
          component: 'Switch'
        },
        {
          field: 'time',
          label: '推送时间',
          bottomHelpMessage: '推送时间，使用cron表达式',
          component: 'Input',
        },
        {
          field: 'groupList',
          label: '推送群号',
          bottomHelpMessage: '推送群号',
          component: 'GSelectGroup',
        },
      ],
    },
  },

  {
    component: 'Divider',
    label: '图源相关设置'
  },
  {
    field: "url.setimage",
    label: "图源",
    component: "GSubForm",
    bottomHelpMessage: '设置不同功能使用的图源',
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "功能",
          label: "功能",
          component: 'Select',
          componentProps: {
            options: setimage,
          },
        },
        {
          field: "imageUrls",
          label: "图片链接",
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
    label: '自定义指令api相关设置'
  },
  {
    field: "api.setapi",
    label: "自定义指令api",
    component: "GSubForm",
    bottomHelpMessage: '自定义指令发送不同的图片api',
    componentProps: {
      multiple: true,
      schemas: [
        {
          field: "指令",
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
