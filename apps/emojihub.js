import { readAndParseJSON, readAndParseYAML, getRandomUrl, getemoji } from '../utils/getdate.js'

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]表情包仓库', 
            dsc: '发送表情包',            
            event: 'message',  
            priority: 5000,   
            rule: [
                {
                    reg: '^#?(emojihub|表情包仓库|表情包)$',   
                    fnc: 'emojihub'
                },
                {
                    reg: '^#?(阿夸|aqua)(表情包)?$',   
                    fnc: '阿夸' 
                },
                {
                    reg: '^#?(阿尼亚)(表情包)?$',   
                    fnc: '阿尼亚' 
                },
                {
                    reg: '^#?(白圣女)(表情包)?$',   
                    fnc: '白圣女' 
                },
                {
                    reg: '^#?(柴郡|chaiq|Chaiq)(表情包)?$',   
                    fnc: '柴郡' 
                },
                {
                    reg: '^#?(甘城猫猫|nacho|Nacho)(表情包)?$',   
                    fnc: '甘城猫猫' 
                },
                {
                    reg: '^#?(狗妈|nana|Nana|神乐七奈)(表情包)?$',   
                    fnc: '狗妈' 
                },
                {
                    reg: '^#?(吉伊卡哇|chiikawa|Chiikawa|chikawa|Chikawa)(表情包)?$',   
                    fnc: '吉伊卡哇' 
                },
                {
                    reg: '^#?(龙图|long|Long)(表情包)?$',   
                    fnc: '龙图' 
                },
                {
                    reg: '^#?(猫猫虫咖波|猫猫虫|capoo|Capoo|咖波)(表情包)?$',   
                    fnc: '猫猫虫咖波' 
                },
                {
                    reg: '^#?(小黑子|坤图|ikun)(表情包)?$',   
                    fnc: '小黑子' 
                },
                {
                    reg: '^#?(亚托莉|亚托利|atri|ATRI)(表情包)?$',   
                    fnc: '亚托莉' 
                },
                {
                    reg: '^#?(真寻酱|绪山真寻|小真寻)(表情包)?$',   
                    fnc: '真寻酱' 
                },
                {
                    reg: '^#?(七濑胡桃|胡桃酱|Menhera|menhera)(表情包)?$',   
                    fnc: '七濑胡桃' 
                },
                {
                    reg: '^#?(小狐狸|兽耳酱|Kemomimi|kemomimi)(表情包)?$',   
                    fnc: '小狐狸' 
                },
                {
                    reg: '^#?(喵内|喵内酱)(表情包)?$',   
                    fnc: '喵内' 
                },
                {
                    reg: '^#?(波奇|孤独摇滚|bochi)(表情包)?$',   
                    fnc: '孤独摇滚' 
                },
                {
                    reg: '^#?(心海|珊瑚宫心海|小心海|心海酱)(表情包)?$',   
                    fnc: '心海' 
                },
                {
                    reg: '^#?(时雨羽衣|羽衣|UI)(表情包)?$',   
                    fnc: '羽衣' 
                },
                {
                    reg: '^#?(自定义表情包|我的表情包)$',   
                    fnc: '自定义表情包' 
                },

            ]
        });
    }

    async emojihub(e) {
        sendEmoji(e, '表情包仓库')
    }
    async 阿夸(e) {
        sendEmoji(e, '阿夸')
    }
    async 阿尼亚(e) {
        sendEmoji(e, '阿尼亚')
    }
    async 白圣女(e) {
        sendEmoji(e, '白圣女')
    }
    async 柴郡(e) {
        sendEmoji(e, '柴郡')
    }
    async 狗妈(e) {
        sendEmoji(e, '狗妈')
    }
    async 甘城猫猫(e) {
        sendEmoji(e, '甘城猫猫')
    }
    async 吉伊卡哇(e) {
        sendEmoji(e, '吉伊卡哇')
    }
    async 龙图(e) {
        sendEmoji(e, '龙图')
    }
    async 猫猫虫咖波(e) {
        sendEmoji(e, '猫猫虫咖波')
    }
    async 小黑子(e) {
        sendEmoji(e, '小黑子')
    }
    async 亚托莉(e) {
        sendEmoji(e, '亚托莉')
    }
    async 真寻酱(e) {
        sendEmoji(e, '真寻酱')
    }emojirate
    async 七濑胡桃(e) {
        sendEmoji(e, '七濑胡桃')
    }
    async 小狐狸(e) {
        sendEmoji(e, '小狐狸')
    }
    async 喵内(e) {
        sendEmoji(e, '喵内')
    }
    async 孤独摇滚(e) {
        sendEmoji(e, '孤独摇滚')
    }
    async 心海(e) {
        sendEmoji(e, '心海')
    }
    async 羽衣(e) {
        sendEmoji(e, '羽衣')
    }
    async 自定义表情包(e) {
        sendEmoji(e, '自定义')
    }
}
  

async function sendEmoji(e, category) {
    let imageUrl = await getemoji(e, category);
    if (imageUrl) {
        logger.info(`[鸢尾花插件]发送“${category}”表情包`);
        e.reply([segment.image(imageUrl)]);
    }

    return true;
}



   



  
    

    



    
    



