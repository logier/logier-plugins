import {  getRandomUrl } from '../utils/getdate.js';
import setting from "../model/setting.js";


function createRules() {
    const config = setting.getConfig("CustomApi");
    const apiMap = {};

    for (let item of config.CustomApi) {
        apiMap[item.FunctionName] = item.imageUrls;
    }
    const regexes = Object.keys(apiMap);
    // 如果 regexes 为空，返回一个不可能匹配的正则表达式
    return regexes.length > 0 ? regexes.join('|') : '(?!)';
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
                    fnc: 'CustomApi',
                },
            ]
        });
    }

    get appconfig () {
        return setting.getConfig("CustomApi");
    }

    async CustomApi(e) {
        const apiMap = {};
        for (let item of this.appconfig.CustomApi) {
            apiMap[item.FunctionName] = item.imageUrls;
        }
        for (let keyword in apiMap) {
            let regex = new RegExp(`^${keyword}$`);
            if (regex.test(e.msg)) {
                e.reply([segment.image(await getRandomUrl(apiMap[keyword]))]);  
                return true;
            }
        }
        return true;
    }
}


