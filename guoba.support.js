import path from "path";
import setting from "./model/setting.js";
import lodash from "lodash";

const _path = process.cwd() + "/plugins/logier-plugin";


export function supportGuoba() {
  let groupList = Array.from(Bot.gl.values())
  groupList = groupList.map(item => item = { label: `${item.group_name}-${item.group_id}`, value: item.group_id })
  return {
    pluginInfo: {
      name: "logier-plugin",
      title: "logier-插件",
      author: "@logier",
      authorLink: "https://gitee.com/logier",
      link: "https://gitee.com/logier/logier-plugin",
      isV3: true,
      isV2: false,
      description: "logier插件",
      icon: "mdi:stove",
      iconColor: "#d19f56",
      iconPath: path.join(_path, "img/logo.png"),
    },
      // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
      {
        field: 'config.customerrate',
        label: '调用自定义表情包的概率',
        bottomHelpMessage: '0-1之间',
        component: "InputNumber",
        required: true,
          componentProps: {
            min: 0,
            max: 1,
            placeholder: '调用自定义表情包的概率',
          },
      },
      {
        field: 'config.imageUrls',
        label: '自定义表情包地址',
        bottomHelpMessage: '自定义表情包地址',
        component: 'GTags',
        componentProps: {
          allowAdd: true,
          allowDel: true,
        },
      },
      {
        field: 'config.emojirate',
        label: '群聊中接收到消息后随机发送表情概率',
        bottomHelpMessage: '0-1之间',
        component: "InputNumber",
        required: true,
          componentProps: {
            min: 0,
            max: 1,
            placeholder: '机发送表情概率',
          },
      },
      {
        field: 'config.groupList',
        label: '随机发送表情包的群号',
        bottomHelpMessage: '随机发送表情包的群号',
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
        helpMessage: '随机发送表情包定义延迟的最小值',
        bottomHelpMessage: '不建议设置太久',
        component: 'InputNumber',
        componentProps: {
          placeholder: '请输入延迟的最小值'
        }
      },
      {
        field: 'config.maxDelay',
        label: '发送表情包延迟',
        helpMessage: '随机发送表情包定义延迟的最大值',
        bottomHelpMessage: '不建议设置太久',
        component: 'InputNumber',
        componentProps: {
          placeholder: '请输入延迟的最大值'
        }
      },
      {
        field: 'config.emojipath',
        label: '表情包保存地址',
        bottomHelpMessage: '表情包保存地址',
        component: 'Input',
        required: true,
        componentProps: {
        placeholder: '请输入绝对路径',   
      },
    },

    {
      component: 'Divider',
      label: 'key'
    },
    {
      field: 'key.gptkey',
      label: 'gptkey',
      bottomHelpMessage: 'gptkey',
      component: 'Input',
      required: true,
      componentProps: {
      placeholder: 'gptkey',   
    },
  },
  {
    field: 'key.model',
    label: 'gpt模型',
    bottomHelpMessage: 'gpt模型',
    component: 'Input',
    required: true,
    componentProps: {
    placeholder: 'gpt模型',   
  },
  },
  {
    field: 'key.gpturl',
    label: 'gpturl',
    bottomHelpMessage: 'gpturl',
    component: 'Input',
    required: true,
    componentProps: {
    placeholder: 'gpturl',   
  },
  },
  {
    field: 'key.qweather',
    label: '和风天气api',
    bottomHelpMessage: '和风天气api',
    component: 'Input',
    required: true,
    componentProps: {
    placeholder: '和风天气api',   
  },
  },

  {
    component: 'Divider',
    label: '定时发图'
  },
  {
    field: 'push.Gallerytime',
    label: '定时发图时间',
    bottomHelpMessage: '定时发图时间',
    component: 'Input',
    required: false,
    componentProps: {
    placeholder: '定时发图时间',   
  },
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
    field: 'push.GalleryisAutoPush',
    label: '是否定时发图',
    bottomHelpMessage: '是否定时发图',
    component: 'Switch'
  },

  {
    component: 'Divider',
    label: '摸鱼日历'
  },
  {
    field: 'push.moyutime',
    label: '摸鱼日历时间',
    bottomHelpMessage: '摸鱼日历时间',
    component: 'Input',
    required: false,
    componentProps: {
    placeholder: '摸鱼日历时间',   
  },
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
    field: 'push.moyuisAutoPush',
    label: '是否定时摸鱼日历',
    bottomHelpMessage: '是否定时摸鱼日历',
    component: 'Switch'
  },

  {
    component: 'Divider',
    label: '今日新闻'
  },
  {
    field: 'push.newstime',
    label: '今日新闻时间',
    bottomHelpMessage: '今日新闻时间',
    component: 'Input',
    required: false,
    componentProps: {
    placeholder: '今日新闻时间',   
  },
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
    field: 'push.newsisAutoPush',
    label: '是否定时今日新闻',
    bottomHelpMessage: '是否定时今日新闻',
    component: 'Switch'
  },

  {
    component: 'Divider',
    label: '今日天气'
  },
  {
    field: 'push.Weathertime',
    label: '天气时间',
    bottomHelpMessage: '天气时间',
    component: 'Input',
    required: false,
    componentProps: {
    placeholder: '天气时间',   
  },
  },
  {
    field: 'push.WeathergroupList',
    label: '天气群号',
    bottomHelpMessage: '天气的群号',
    component: 'Select',
    componentProps: {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options: groupList
    }
  },
  {
    field: 'push.WeatherisAutoPush',
    label: '是否定时天气',
    bottomHelpMessage: '是否定时天气',
    component: 'Switch'
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
