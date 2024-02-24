import { getemoji } from '../utils/getdate.js'
import setting from "../model/setting.js";

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]表情包小偷',
            dsc: '表情包小偷',            
            event: 'message',
            priority: 9999,
            rule: [
                {
                    reg: '',
                    fnc: '表情包小偷',
                    log: false
                },
            ]
        })    
    }
    get appconfig () {
        return setting.getConfig("EmojiThief");
    }

    async 表情包小偷(e) { 
        
        let rate = this.appconfig.DefalutReplyRate; // 默认概率
        let groupMatched = false;
        
        if (this.appconfig.ETGroupRate && this.appconfig.ETGroupRate.length > 0) {
            for (let config of this.appconfig.ETGroupRate) {
                if (config.groupList.includes(e.group_id)) {
                    rate = config.rate;
                    groupMatched = true;
                    break;
                }
            }
            if (!groupMatched) return false; // 如果数组不为空且匹配不上，就拒绝
        } 
        

        let key = `Yunzai:EmojiThief:${e.group_id}_EmojiThief`;
        
        e.message.forEach(async item => {
            if (item.asface) {
                try {
                    let listStr = await redis.get(key);
                    let list = listStr ? JSON.parse(listStr) : [];
                    if (!list.includes(item.url)) {
                        logger.info('[表情包小偷]偷取表情包')
                        list.push(item.url);
                        if (list.length > 50) {
                            list.shift();
                        }
                        await redis.set(key, JSON.stringify(list));
                    }
                } catch (error) {
                    logger.error(`[表情包小偷]Redis数据库出错: ${error}`);
                }
            }
        })  

        if (Math.random() < rate) {
            try {
                let emojiUrl = await getemoji(e, this.appconfig.ETEmojihubCategory);
                let listStr = await redis.get(key);
                if (listStr && Math.random() >= Number(this.appconfig.ThiefEmojiRate)) {
                    let list = JSON.parse(listStr);    
                    if (Array.isArray(list) && list.length) {
                        let randomIndex = Math.floor(Math.random() * list.length);
                        emojiUrl = list[randomIndex];
                    }
                }
                logger.info(`[鸢尾花插件] 发送表情包: ${emojiUrl}`)  
        
                e.reply([segment.image(emojiUrl)]);

            } catch (error) {
                logger.error(`[表情包小偷]表情包发送失败: ${error}`);
            }
        }
        
        return false;
    }
}
