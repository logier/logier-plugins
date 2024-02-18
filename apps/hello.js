import { readAndParseYAML, gpt, getPersonality } from '../utils/getdate.js'

// 导出一个问候插件
export class greetings extends plugin {
    // 构建正则匹配等
    constructor() {
        super({
            name: "[鸢尾花插件]每日问候",
            event: "message",
            priority: 4999,
            rule: [
                {
                    reg: '^(早上好|晚上好|早安|晚安|早|睡觉了|中午好|午安|上午好|下午好)$',
                    fnc: 'dazbaohu'
                },
            ]
        })
    }

    // 早安问候
    async dazbaohu(e) {

    const key = await readAndParseYAML('../config/key.yaml');    
        
    if (!key.gptkey){
        logger.info('未配置gptkey')
        return false
    }

    let date = new Date();
    let hours = date.getHours();
    
    let timeOfDay;
    if (hours >= 0 && hours < 6) {
        timeOfDay = '凌晨';
    } else if (hours >= 6 && hours < 12) {
        timeOfDay = '上午';
    } else if (hours >= 12 && hours < 18) {
        timeOfDay = '下午';
    } else {
        timeOfDay = '晚上';
    }
    
    let arr2 = [        
        {"role": "system", "content": `现在的时间是${timeOfDay}，请你结合现在的时间和我的话来回复。`},
        {"role": "user", "content": `${e.msg}`}];
    let gptmsg = await getPersonality()
    gptmsg.push(...arr2);
    logger.info(gptmsg)
    const content = await gpt(key.gptkey, key.gpturl, key.model, gptmsg);

    if (!content) {
        logger.info('gptkey错误，结束进程')
        return false
    }

    e.reply(content, true)

        

        return true;
    };
}

