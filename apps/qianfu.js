import { readAndParseYAML, gpt, getPersonality } from '../utils/getdate.js'

// 导出一个问候插件
export class greetings extends plugin {
    // 构建正则匹配等
    constructor() {
        super({
            name: "[鸢尾花插件]潜伏gpt",
            event: "message",
            priority: 5001,
            rule: [
                {
                    reg: '',
                    fnc: '潜伏'
                },
            ]
        })
    }

    // 早安问候
    async 潜伏(e) {

    const key = await readAndParseYAML('../config/key.yaml');    
        
    if (!key.gptkey){
        logger.info('未配置gptkey')
        return false
    }

    if (Math.random() > 1) {return false}
    
    let arr2 = [        
        {"role": "user", "content": `${e.nickname}说：${e.msg}`}];
    let gptmsg = await getPersonality()
    gptmsg.push(...arr2);
    logger.info(gptmsg)
    const content = await gpt(key.gptkey, key.gpturl, key.model, gptmsg);

    if (!content) {
        logger.info('gptkey错误，结束进程')
        return false
    }

    e.reply(content)

        

        return true;
    };
}

