import path from "path";
import setting from "./model/setting.js";
import lodash from "lodash";

const _path = process.cwd() + "/plugins/logier-plugin";


export function supportGuoba() {
  let groupList = Array.from(Bot.gl.values())
  groupList = groupList.map(item => item = { label: `${item.group_name}-${item.group_id}`, value: item.group_id })
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
      iconPath: path.join(_path, "img/fox.jpg"),
    },
      // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
      {
        component: 'Divider',
        label: '表情包'
      },
      {
        field: 'config.customerrate',
        label: '自定义表情包几率',
        bottomHelpMessage: '触发表情包时使用自定义表情包的概率，0-1之间',
        component: "InputNumber",
        required: true,
          componentProps: {
            min: 0,
            max: 1,
          },
      },
      {
        field: 'config.imageUrls',
        label: '自定义表情包地址',
        bottomHelpMessage: '自定义表情包地址，可以本地文件和网络链接',
        component: 'GTags',
        componentProps: {
          allowAdd: true,
          allowDel: true,
        },
      },
      {
        field: 'config.emojirate',
        label: '随机表情包几率',
        bottomHelpMessage: '群聊中收到消息后随机发送表情包的几率，0-1之间',
        component: "InputNumber",
        required: true,
          componentProps: {
            min: 0,
            max: 1,
          },
      },
      {
        field: 'config.groupList',
        label: '随机表情包群号',
        bottomHelpMessage: '只有填入的群号才会在接收到消息后随机发送表情包',
        component: 'Select',
        componentProps: {
          allowAdd: true,
          allowDel: true,
          mode: 'multiple',
          options: groupList
        }
      },
      {
        field: 'config.minDelay',
        label: '发送表情包延迟',
        bottomHelpMessage: '随机发送表情包定义延迟的最小值',
        component: 'InputNumber',
      },
      {
        field: 'config.maxDelay',
        label: '发送表情包延迟',
        bottomHelpMessage: '随机发送表情包定义延迟的最大值',
        component: 'InputNumber',
      },
      {
        field: 'config.emojipath',
        label: '表情包保存地址',
        bottomHelpMessage: '表情包保存地址',
        component: 'Input',
        required: true,
    },

    {
      component: 'Divider',
      label: 'key'
    },
    {
      field: 'key.gptkey',
      label: 'gptkey',
      bottomHelpMessage: '请前往https://github.com/chatanywhere/GPT_API_free获得',
      component: 'Input',
      required: true,
  },
  {
    field: 'key.model',
    label: 'gpt模型',
    bottomHelpMessage: 'gpt模型，chatanywhere免费最高只支持gpt-3.5-turbo，一般不需要修改',
    component: 'Input',
    required: true,
  },
  {
    field: 'key.gpturl',
    label: 'gpturl',
    bottomHelpMessage: 'gpt请求地址，key是chatanywhere的不用修改这里',
    component: 'Input',
    required: true,
  },
  {
    field: 'key.qweather',
    label: '和风天气api',
    bottomHelpMessage: '和风天气api，请前往https://console.qweather.com/#/console获得',
    component: 'Input',
    required: true,
  },

  {
    component: 'Divider',
    label: '定时发图'
  },
  {
    field: 'push.GalleryisAutoPush',
    label: '定时发图开关',
    bottomHelpMessage: '定时发图开关',
    component: 'Switch'
  },
  {
    field: 'push.Gallerytime',
    label: '定时发图时间',
    bottomHelpMessage: '定时发图时间，使用cron表达式',
    component: 'Input',
    required: false,
  },
  {
    field: 'push.GallerygroupList',
    label: '定时发图群号',
    bottomHelpMessage: '定时发图的群号',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options: groupList
    }
  },


  {
    component: 'Divider',
    label: '摸鱼日历'
  },
  {
    field: 'push.moyuisAutoPush',
    label: '摸鱼日历定时开关',
    bottomHelpMessage: '摸鱼日历定时开关',
    component: 'Switch'
  },
  {
    field: 'push.moyutime',
    label: '摸鱼日历时间',
    bottomHelpMessage: '摸鱼日历时间，使用cron表达式',
    component: 'Input',
    required: false,
  },
  {
    field: 'push.moyugroupList',
    label: '摸鱼日历群号',
    bottomHelpMessage: '摸鱼日历的群号',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options: groupList
    }
  },

  {
    component: 'Divider',
    label: '今日新闻'
  },
  {
    field: 'push.newsisAutoPush',
    label: '今日新闻定时开关',
    bottomHelpMessage: '今日新闻定时开关',
    component: 'Switch'
  },
  {
    field: 'push.newstime',
    label: '今日新闻时间',
    bottomHelpMessage: '今日新闻时间，使用cron表达式',
    component: 'Input',
    required: false,
  },
  {
    field: 'push.newsgroupList',
    label: '今日新闻群号',
    bottomHelpMessage: '今日新闻的群号',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options: groupList
    }
  },


  {
    component: 'Divider',
    label: '今日天气'
  },
  {
    field: 'push.WeatherisAutoPush',
    label: '天气推送开关',
    bottomHelpMessage: '天气推送开关',
    component: 'Switch'
  },
  {
    field: 'push.Weathertime',
    label: '天气时间',
    bottomHelpMessage: '天气时间，使用cron表达式',
    component: 'Input',
    required: false,
  },
  {
    field: 'push.WeathergroupList',
    label: '推送天气群号',
    bottomHelpMessage: '推送天气的群号',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options: groupList
    }
  },
  {
    field: 'push.defaultCity',
    label: '推送天气地点',
    bottomHelpMessage: '推送天气地点',
    component: 'Input',
    required: true,
    componentProps: {
    placeholder: '推送天气地点',   
  },
  },

  {
    component: 'Divider',
    label: '图片api'
  },
  {
    field: 'url.Switch',
    label: '定时发图自带图床',
    bottomHelpMessage: '使用p站反代发图，有稳定的图源推荐更换',
    component: 'Switch'
  },
  {
    field: 'url.GalleryimageUrls',
    label: '定时发图自定义链接',
    bottomHelpMessage: '定时发图自定义链接，支持网络和本地',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
    },
  },
  {
    field: 'url.jrysSwitch',
    label: '今日运势自带图床',
    bottomHelpMessage: '使用p站反代发图，有稳定的图源推荐更换',
    component: 'Switch'
  },
  {
    field: 'url.jrysimageUrls',
    label: '今日运势自定义链接',
    bottomHelpMessage: '今日运势自定义链接，支持网络和本地，推荐竖图',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
    },
  },
  {
    field: 'url.suanguaSwitch',
    label: '算卦自带图床',
    bottomHelpMessage: '使用p站反代发图，有稳定的图源推荐更换',
    component: 'Switch'
  },
  {
    field: 'url.suanguaimageUrls',
    label: '算卦自定义链接',
    bottomHelpMessage: '算卦自定义链接，支持网络和本地，推荐竖图',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
    },
  },
  {
    field: 'url.weatherSwitch',
    label: '天气自带图床',
    bottomHelpMessage: '使用p站反代发图，有稳定的图源推荐更换',
    component: 'Switch'
  },
  {
    field: 'url.weatherimageUrls',
    label: '天气自定义链接',
    bottomHelpMessage: '天气自定义链接，支持网络和本地，推荐竖图',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
    },
  },
  {
    field: 'url.signSwitch',
    label: '签到自带图床',
    bottomHelpMessage: '使用p站反代发图，有稳定的图源推荐更换',
    component: 'Switch'
  },
  {
    field: 'url.signimageUrls',
    label: '签到自定义链接',
    bottomHelpMessage: '签到自定义链接，支持网络和本地，推荐横图',
    component: 'GTags',
    componentProps: {
      allowAdd: true,
      allowDel: true,
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
