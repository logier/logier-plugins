import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import YAML from 'yaml'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



export async function readAndParseJSON(filePath) {
    try {
        const fileContent = await fs.promises.readFile(path.join(__dirname, filePath), 'utf8');
        return JSON.parse(fileContent);
    } catch (e) {
        logger.info('[logier-plugin]json读取失败') ;
    }
}

// 读取和解析YAML文件的函数
export async function readAndParseYAML(filePath) {
    try {
        const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        return YAML.parse(fileContent);
    } catch (e) {
        logger.info('[logier-plugin]yml读取失败') ;
    }
}


export async function getRandomUrl(imageUrls) {
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    // 检查imageUrl是否是一个本地文件夹
    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        // 获取文件夹中的所有文件
        let files = fs.readdirSync(imageUrl);

        // 过滤出图片文件
        let imageFiles = files.filter(file => ['.jpg', '.png', '.gif', '.jpeg', '.webp'].includes(path.extname(file)));

        // 如果文件夹中有图片文件，随机选择一个
        if (imageFiles.length > 0) {
            let imageFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
            imageUrl = path.join(imageUrl, imageFile);
        } else {
            // 如果文件夹中没有图片文件，随机选择一个子文件夹
            let subdirectories = files.filter(file => fs.lstatSync(path.join(imageUrl, file)).isDirectory());
            if (subdirectories.length > 0) {
                let subdirectory = subdirectories[Math.floor(Math.random() * subdirectories.length)];
                imageUrl = await getRandomUrl([path.join(imageUrl, subdirectory)]);
            }
        }
    }
    return imageUrl;
} 

export async function getImageUrl(imageUrls) {
    let imageUrl = await getRandomUrl(imageUrls);
    if (path.isAbsolute(imageUrl)) {
      let imageBuffer = await fs.readFileSync(imageUrl);
      let base64Image = imageBuffer.toString('base64');
      imageUrl = 'data:image/png;base64,' + base64Image;
    }
    return imageUrl;
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

