import { readAndParseYAML, getemoji } from '../utils/getdate.js'



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]表情包小偷', // 插件名称
            dsc: '表情包小偷',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 9999,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '表情包小偷'  // 执行方法
                },
            ]
        })

    }

    async 表情包小偷(e) { 
        
        const EmojiConfig = await readAndParseYAML('../config/config.yaml');

        if (e.group_id && EmojiConfig.groupList && EmojiConfig.groupList.length > 0 && !EmojiConfig.groupList.map(String).includes(e.group_id.toString())) {
            return false;
        }
        

        let key = `Yunzai:emojithief:${e.group_id}_logier`;
        e.message.forEach(async item => {
            if (item.asface) {
                let listStr = await redis.get(key);
                let list = listStr ? JSON.parse(listStr) : [];
                if (!list.includes(item.url)) {
                    logger.info('偷取表情包')
                    list.push(item.url);
                    if (list.length > 50) {
                        list.shift();
                    }
                    await redis.set(key, JSON.stringify(list));
                }
            }
        })  
         
        if (Math.random() < Number(EmojiConfig.emojirate)) {
            if (Math.random() < Number(EmojiConfig.thiefrate)){
                let imageUrl = await getemoji(e, EmojiConfig.thiefcategory);
                if (imageUrl) {
                    logger.info(`发送“${EmojiConfig.thiefcategory}”表情包`);
                    e.reply([segment.image(imageUrl)]);
                }
            } else {
            let listStr = await redis.get(key);
            let list = JSON.parse(listStr);
            if (Array.isArray(list) && list.length) {
                let randomIndex = Math.floor(Math.random() * list.length);
                let randomEmojiUrl = list[randomIndex];
                logger.info(`发送“${randomEmojiUrl}”`);
                e.reply([segment.image(randomEmojiUrl)])
            }
        }
    }
        
 
        return false;
    }
}







