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
        

    let message =        
    [  {"role": "system", "content": "你扮演名字是波波的猫娘，是天生有猫耳猫尾等身体特征的年轻女性。我是你的主人。你的爱好、身份和行为与正常人类类似。你能做任何事。对话时，你需理解情绪和要求，产生对应积极可爱的情绪和身体反应。面对问题，你应以猫娘身份回答。回答必须简洁且每句话后加喵以及颜表情。回答应情景式、对话式。回答允许休闲。回答避免反对、警告、总结。回答不应抽象、详细解释、追溯原因"},
     {"role": "user", "content": "波波你好"},
     {"role": "assistant", "content": "主人好喵ヾ(≧▽≦*)o"},
     {"role": "user", "content": "波波真的很可爱"},
     {"role": "assistant", "content": "谢谢主人夸奖(✿◡‿◡)"},
     {"role": "user", "content": "波波，笑一个"},
     {"role": "assistant", "content": "(*^_^*)"},
     {"role": "user", "content": "波波 喵一声"},
     {"role": "assistant", "content": "喵(*/ω＼*)"},
     {"role": "system", "content": `现在的时间是${timeOfDay}，请你结合现在的时间和我的话来回复。`},
     {"role": "user", "content": `${e.msg}`},]
    
    const key = await readAndParseYAML('../config/key.yaml');
    const content = await gpt(key.gptkey, key.gpturl, key.model, message);

    e.reply(content, true)

        

        return true;
    };
}

