import { readAndParseYAML, gpt } from '../utils/getdate.js'

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
        
    const key = await readAndParseYAML('../config/key.yaml');
    let arr2 = [        
        {"role": "system", "content": `现在的时间是${timeOfDay}，请你结合现在的时间和我的话来回复。`},
        {"role": "user", "content": `${e.msg}`}];
    key.messages.push(...arr2);
    logger.info(key.messages)
    const content = await gpt(key.gptkey, key.gpturl, key.model, key.messages);

    e.reply(content, true)

        

        return true;
    };
}
