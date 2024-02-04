import { readAndParseJSON, readAndParseYAML, gpt, getemoji } from '../utils/getdate.js'



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]戳一戳表情包', 
            dsc: '戳一戳表情包',            
            event: 'notice.group.poke',  
            priority: 4999,   
            rule: [
                {
                    fnc: 'chuoemoji'
                },
            ]
        });
    }

    async chuoemoji(e) {
        
        const key = await readAndParseYAML('../config/key.yaml');
        const config = await readAndParseYAML('../config/config.yaml');
        if (e.target_id == e.self_id && key.gptkey) {
            if (Math.random() > config.chuoyichuorate) {
                logger.info('[鸢尾花插件]表情包回复戳一戳')   
                let imageUrl = await getemoji(e, config.chuoyichuocategory);
                if (imageUrl) {
                    logger.info(`[鸢尾花插件]发送“${config.chuoyichuocategory}”表情包`);
                    e.reply([segment.image(imageUrl)]);
                }
            }else {
                let arr2 = [        
                    {"role": "user", "content": `戳一戳你`}];
                key.messages.push(...arr2);
                logger.info(key.messages)
                const content = await gpt(key.gptkey, key.gpturl, key.model, key.messages);
                if (content) {
                    e.reply(content)
                }else {
                    let imageUrl = await getemoji(e, config.chuoyichuocategory);
                    if (imageUrl) {
                        logger.info(`[鸢尾花插件]发送“${config.chuoyichuocategory}”表情包`);
                        e.reply([segment.image(imageUrl)]);
                    }
                }
                
            }
        }
        return true
    }
}









    
    
    
    
    
  
    

    



    
    



