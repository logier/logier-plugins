import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import fetch from 'node-fetch';
import setting from "../model/setting.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getFunctionData(YamlName, ArrayName, Function) {
    const Config = setting.getConfig(YamlName);
    const functionData = Config[ArrayName].find(item => item.FunctionName === Function) || Config[ArrayName].find(item => item.FunctionName === 'default');
    return functionData;
}

export async function readAndParseJSON(filePath) {
    try {
        const fileContent = await fs.promises.readFile(path.join(__dirname, filePath), 'utf8');
        return JSON.parse(fileContent);
    } catch (e) {
        logger.info('[鸢尾花插件]json读取失败') ;
    }
}

export async function getPersonality() {
    const Config = setting.getConfig("GPTconfig");
    if (Config.DefaultPersonalitySwitch) {
        const personalitys = await readAndParseJSON('../data/personality.json');
        return personalitys[Config.DefaultPersonality];
    } else {
        return Config.CustomPersonality;
    }
}

export async function gpt(messages, GPTKey = null, GPTUrl = null, GPTModel = null) {
    const Config = setting.getConfig("GPTconfig");

    // 如果没有输入，就自动获取配置
    GPTKey = GPTKey || Config.GPTKey;
    GPTUrl = GPTUrl || Config.GPTUrl;
    GPTModel = GPTModel || Config.GPTModel;

    // 解析URL
    let url = new URL(GPTUrl);
    if (!url.pathname || url.pathname === '/' || url.pathname === '/v1/'|| url.pathname === '/v1') {
        url.pathname = '/v1/chat/completions';
    }
    GPTUrl = url.toString();

    logger.info(GPTUrl)

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + GPTKey );
    myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "model": GPTModel,
        "messages": messages
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        let response = await fetch(GPTUrl, requestOptions);
        let result = await response.json();
        let content = result.choices[0].message.content;
        return content;
    } catch (error) {
        
    }

    return true;
}





async function readCategoryFiles(category) {
    const files = await readAndParseJSON(`../data/${category}.json`);
    return getRandomFile(files);
  }
  
export async function getRandomImage(category) {
let file;
if (['pc', 'mb', 'sq'].includes(category)) {
    file = await readCategoryFiles(category);
} else {
    const allFiles = await Promise.all(['pc', 'mb', 'sq'].map(readCategoryFiles));
    file = getRandomFile([].concat(...allFiles));
}

let basename = file.split('.')[0];
let imageUrl = `https://pixiv.nl/${basename}.jpg`;

return imageUrl;
}

function getRandomFile(category) {
let allFiles = [].concat(...Object.values(category));
return allFiles[Math.floor(Math.random() * allFiles.length)];
}


export function getTimeOfDay() {
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
    
    return timeOfDay;
  }
  


export async function numToChinese(num) {
    const units = ['', '十', '百', '千'];
    const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let result = '';
    const strNum = num.toString();
    const len = strNum.length;
    for(let i = 0; i < len; i++) {
        const curNum = parseInt(strNum[i]);
        const unit = units[len - 1 - i];
        if(curNum === 0) {
            if(result.slice(-1) !== '零') {
                result += '零';
            }
        } else {
            result += nums[curNum] + unit;
        }
    }
    return result.replace(/零+$/, '');
}

export function NumToRoman(num) {
    const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
  
    for (let i of Object.keys(roman)) {
      let q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }



export async function getemoji(e, category) {
    const BASE_URL = 'https://gitee.com/logier/emojihub/raw/master/';
    try {
        const EmojiHub = setting.getConfig("EmojiHub");
        const BlackList = EmojiHub.BlackList;
        const groupData = BlackList.find(item => String(item.group) === String(e.group_id)) || BlackList.find(item => item.group === 'default');
        const exclude = groupData ? groupData.Emojiindexs : [];        

        const EmojiIndex = await readAndParseJSON('../data/EmojiIndex.json');
        const EmojiConfig = setting.getConfig("Config");

        let imageUrl;
        if (exclude.includes(category)) {
            logger.info(`[鸢尾花插件] 表情包在黑名单: ${category}`)
        }
        if (!exclude.includes(category)) {
 
            if (category === '表情包仓库') {
                if (Math.random() < Number(EmojiConfig.CustomerRate)) {
                    imageUrl = await getRandomUrl(EmojiConfig.CustomeEmoji);
                } else {
                    let keys = Object.keys(EmojiIndex);
                    let filteredKeys = keys.filter(key => !exclude.includes(key));
                    let randomKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
                    let randomValue = EmojiIndex[randomKey][Math.floor(Math.random() * EmojiIndex[randomKey].length)];
                    imageUrl = `${BASE_URL}${randomKey}/${randomValue}`;
                }
            } else if (category === '自定义') {
                imageUrl = await getRandomUrl(EmojiConfig.CustomeEmoji);
            } else if (Object.keys(EmojiIndex).includes(category)) {
                const items = EmojiIndex[category];
                const randomItem = items[Math.floor(Math.random() * items.length)];
                imageUrl = `${BASE_URL}${category}/${randomItem}`;
            }
        }

        return imageUrl;
    } catch (error) {
        logger.error(`[鸢尾花插件] Error: ${error.message}`);
        return null;
    }
}



export async function getImageUrl(imageUrls, defaultImageUrl = './plugins/logier-plugin/resources/gallery/92095127.webp') {
    let imageUrl = await getRandomUrl(imageUrls);

    return new Promise((resolve, reject) => {
        const getAndResolveImage = (url) => {
            https.get(url, (res) => {
                const { statusCode } = res;
                if (statusCode === 301 || statusCode === 302) {
                    // 如果状态码是301或302，那么从'location'头部获取重定向的URL
                    getAndResolveImage(res.headers.location);
                } else if (statusCode !== 200) {
                    resolve(getImageData(defaultImageUrl));
                } else {
                    resolve(url);
                }
            }).on('error', () => {
                resolve(getImageData(defaultImageUrl));
            });
        };

        const getImageData = (imageUrl) => {
            if (fs.existsSync(imageUrl)) {
                let imageBuffer = fs.readFileSync(imageUrl);
                let ext = path.extname(imageUrl).slice(1);
                let mimeType = 'image/' + ext;
                let base64Image = imageBuffer.toString('base64');
                imageUrl = 'data:' + mimeType + ';base64,' + base64Image;
            }
            return imageUrl;
        };

        if (imageUrl.startsWith('http')) {
            getAndResolveImage(imageUrl);
        } else {
            resolve(getImageData(imageUrl));
        }
    });
}



async function getAllImageFiles(dirPath, imageFiles = []) {
    let files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        let filePath = path.join(dirPath, files[i]);

        if (fs.statSync(filePath).isDirectory()) {
            imageFiles = await getAllImageFiles(filePath, imageFiles);
        } else if (['.jpg', '.png', '.gif', '.jpeg', '.webp'].includes(path.extname(filePath))) {
            imageFiles.push(filePath);
        }
    }

    return imageFiles;
}

export async function getRandomUrl(imageUrls) {
    let imageUrl;

    if (Array.isArray(imageUrls)) {
        imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    } else {
        imageUrl = imageUrls;
    }

    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        let imageFiles = await getAllImageFiles(imageUrl);

        if (imageFiles.length > 0) {
            imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        }
    }

    logger.info('[鸢尾花插件]图片url：'+imageUrl)
    return imageUrl;
}


