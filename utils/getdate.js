import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import YAML from 'yaml'
import https from 'https';
import fetch from 'node-fetch';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getFunctionData(YamlName, ArrayName, Function) {
    const fileContent = fs.readFileSync(path.join(__dirname, `../config/${YamlName}.yaml`), 'utf8');
    const Config = YAML.parse(fileContent);
    const functionData = Config[ArrayName].find(item => item.功能 === Function) || Config[ArrayName].find(item => item.功能 === 'default');
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

// 读取和解析YAML文件的函数
export async function readAndParseYAML(filePath) {
    try {
        const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        return YAML.parse(fileContent);
    } catch (e) {
        logger.info('[鸢尾花插件]yml读取失败') ;
    }
}

export function readAndParseYAMLNotasync(filePath) {
    try {
        const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        return YAML.parse(fileContent);
    } catch (e) {
        logger.info('[鸢尾花插件]yml读取失败') ;
    }
}


export async function getPersonality() {
    const key = await readAndParseYAML('../config/key.yaml');
    if (key.defaultswitch) {
        const personalitys = await readAndParseJSON('../data/personality.json');
        return personalitys[key.defaultpersonality];
    } else {
        return key.messages;
    }
}


export async function gpt(gptkey, gpturl, model, messages) {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + gptkey );
    myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "model": model,
        "messages": messages
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    try {
        let response = await fetch(gpturl, requestOptions);
        let result = await response.json();
        let content = result.choices[0].message.content;
        return content;
    } catch (error) {
        console.log('error', error);
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





export async function getemoji(e, category) {
    const BASE_URL = 'https://gitee.com/logier/emojihub/raw/dev/';
    try {
        const emojihub = await readAndParseYAML('../config/emojihub.yaml');
        const blackgouplist = emojihub.blackgouplist;
        const groupData = blackgouplist.find(item => String(item.group) === String(e.group_id)) || blackgouplist.find(item => item.group === 'default');
        const exclude = groupData ? groupData.NotEmojiindex : [];        

        const EmojiIndex = await readAndParseJSON('../data/EmojiIndex.json');
        const EmojiConfig = await readAndParseYAML('../config/config.yaml');

        let imageUrl;
        if (exclude.includes(category)) {
            logger.info(`[鸢尾花插件] 表情包在黑名单: ${category}`)
        }
        if (!exclude.includes(category)) {
            
            if (category === '表情包仓库') {
                if (Math.random() < Number(EmojiConfig.customerrate)) {
                    imageUrl = await getRandomUrl(EmojiConfig.imageUrls);
                } else {
                    let keys = Object.keys(EmojiIndex);
                    let filteredKeys = keys.filter(key => !exclude.includes(key));
                    let randomKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
                    let randomValue = EmojiIndex[randomKey][Math.floor(Math.random() * EmojiIndex[randomKey].length)];
                    imageUrl = `${BASE_URL}${randomKey}/${randomValue}`;
                }
            } else if (category === '自定义') {
                imageUrl = await getRandomUrl(EmojiConfig.imageUrls);
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
                logger.info(statusCode)
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
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    

    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        let imageFiles = await getAllImageFiles(imageUrl);

        if (imageFiles.length > 0) {
            imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        }
    }

    logger.info(imageUrl)
    return imageUrl;
}


