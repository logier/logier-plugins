import { readAndParseYAML, gpt, getemoji, getPersonality } from '../utils/getdate.js'

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]戳一戳表情包', 
            dsc: '戳一戳表情包',            
            event: 'notice.group.poke',  
            priority: 4999,   
            rule: [
                {   
                    fnc: '戳一戳表情包'
                },
            ]
        });
    }

    async 戳一戳表情包(e) {
        
        const key = await readAndParseYAML('../config/key.yaml');
        const config = await readAndParseYAML('../config/config.yaml');
        if (e.target_id == e.self_id) {
            if (Math.random() > config.chuoyichuorate || !key.gptkey) {
                sendEmoji(e, config.chuoyichuocategory);
            } else {
                let userMessage = {"role": "user", "content": `戳一戳你`};
                let gptmsg = await getPersonality()
                gptmsg.push(userMessage);
                const content = await gpt(key.gptkey, key.gpturl, key.model, gptmsg);
                if (content) {
                    e.reply(content)
                } else {
                    logger.info(`GPT调用失败，发送“${config.chuoyichuocategory}”表情包`);
                    sendEmoji(e, config.chuoyichuocategory);
                }
            }
        }
        return true
    }
}


async function sendEmoji(e, category) {
    let imageUrl = await getemoji(e, category);
    if (imageUrl) {
        logger.info(`发送“${category}”表情包`);
        e.reply([segment.image(imageUrl)]);
    }
}






    
    
    
    
    
  
    

    



    
    



