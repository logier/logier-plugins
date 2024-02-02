import { readAndParseJSON, readAndParseYAML, gpt } from '../utils/getdate.js'



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
        if (e.target_id == e.self_id && key.gptkey) {
            if (Math.random() < 0.5) {
                logger.info('[戳一戳表情包]表情包回复戳一戳')   
                emoji(e)
            }else {
                let message =  key.message.push(
                    {"role": "user", "content": `戳一戳你`});
                const content = await gpt(key.gptkey, key.gpturl, key.model, message);
                if (content) {
                    e.reply(content)
                }else {
                    emoji(e) 
                }
                
            }
        }
        return true
    }
}

async function emoji(e) {

    const EmojiIndex = await readAndParseJSON('../data/EmojiIndex.json');
    const EmojiConfig = await readAndParseYAML('../config/config.yaml');
    
    //排除不要的表情包
    const EmojiDoc = await readAndParseYAML('../config/emojihub.yaml');
    let exclude;
    if (EmojiDoc[e.group_id]) {
        exclude = EmojiDoc[e.group_id];
    } else {
        exclude = EmojiDoc['default'];
    }

    if (Math.random() < Number(EmojiConfig.customerrate)) {
        e.reply([segment.image(getRandomUrl(EmojiConfig.imageUrls))])
    } else {
    // 提取所有的键
    let keys = Object.keys(EmojiIndex);
    // 排除 exclude 数组中包含的键
    let filteredKeys = keys.filter(key => !exclude.includes(key));
    // 随机抽取一个键
    let randomKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
    // 随机抽取该键对应的一个值
    let randomValue = EmojiIndex[randomKey][Math.floor(Math.random() * EmojiIndex[randomKey].length)];
    e.reply([segment.image(`https://gitee.com/logier/emojihub/raw/master/${randomKey}/${randomValue}`)])
    }
    return true
}







    
    
    
    
    
  
    

    



    
    



