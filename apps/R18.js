
export class example extends plugin {
  constructor() {
    super({
      name: '[鸢尾花插件]三次元',
      dsc: '三次元',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(三次元)$',
          fnc: '三次元'
        },
      ]
    });
      }





      async 三次元 (e) {

        if (!newsimageUrl) {
          e.reply('三次元接口未配置，请设置环境变量 R18_API 或修改 apps/R18.js 中的地址');
          return false
        }
        e.reply([segment.image(newsimageUrl)]);
    
        return true
      }
    
    }

// 三次元图片接口（自备）。默认留空，避免请求已失效的第三方地址。
const newsimageUrl = process.env.R18_API || '';