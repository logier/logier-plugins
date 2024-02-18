import {  getImageUrl, readAndParseYAML } from '../utils/getdate.js';

// 假设apiList现在是一个对象
const apiList = await readAndParseYAML('../config/api.yaml');

console.log(apiList);  // 打印apiList以查看其内容

// 将apiList转换为apiMap，键是指令，值是imageUrls
const apiMap = {};
for (let item of apiList.setapi) {
    apiMap[item.指令] = item.imageUrls;
}

function createRules() {
    const regexes = Object.keys(apiMap);
    return regexes.join('|');
}

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]图片api', 
            dsc: '自定义指令发送不同的图片api',            
            event: 'message',  
            priority: 5000,   
            rule: [
                {
                    reg: `(${createRules()})`,   
                    fnc: 'picapi',
                },
            ]
        });
    }

    async picapi(e) {
        logger.info(e.msg)
        for (let keyword in apiMap) {
            let regex = new RegExp(`^${keyword}$`);
            if (regex.test(e.msg)) {
                e.reply([segment.image(await getImageUrl(apiMap[keyword]))]);  
                return true;
            }
        }
        return false;
    }
}






  
    

    



    
    



