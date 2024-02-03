import { readAndParseJSON, readAndParseYAML, getRandomUrl } from '../utils/getdate.js'

import fs from 'fs';
import path from 'path';
import https from 'https';



// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
    constructor() {
        super({
            name: '[鸢尾花插件]保存表情包', // 插件名称
            dsc: '保存表情包',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 5000,   // 插件优先度，数字越小优先度越高
            rule: [
              {
                  reg: '#?(保存表情包|存表情)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '保存表情包',  // 执行方法
                  permission: "master",
              },
              {
                reg: '#?(查看表情包)(\\d+)?$',   // 正则表达式,有关正则表达式请自行百度
                fnc: '查看表情包',  // 执行方法
                permission: "master",
             },
             {
                reg: '#?(删除表情包)(\\d+)$',   // 正则表达式,有关正则表达式请自行百度
                fnc: '删除表情包',  // 执行方法
                permission: "master",
            }
            ]
        })

    }
  
    async 保存表情包(e) {
        const config = await readAndParseYAML('../config/config.yaml');
        let fileNumbers = [];
        if (e.img) {
            for (let img of e.img) {
                try {
                    const fileNumber = await saveFile(img, config.emojipath);
                    console.log(`File saved successfully with number ${fileNumber}`);
                    fileNumbers.push(fileNumber);
                } catch (err) {
                    console.error(err);
                    e.reply("保存失败，请再次尝试或手动保存", true);
                    return true;
                }
            }
        }else if (e.source) {
            const reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message;
            if (reply) {
                for (let item of reply) {
                    if (item.type === 'image') {
                        try {
                            const fileNumber = await saveFile(item.url, config.emojipath);
                            console.log(`File saved successfully with number ${fileNumber}`);
                            fileNumbers.push(fileNumber);
                        } catch (err) {
                            console.error(err);
                            e.reply("保存失败，请再次尝试或手动保存", true);
                            return true;
                        }
                    }
                }
            }
        } else {
            return false 
        }
    
        let ranges = [];
        fileNumbers.sort((a, b) => a - b);
        for (let i = 0; i < fileNumbers.length; i++) {
            let start = fileNumbers[i];
            while (i + 1 < fileNumbers.length && fileNumbers[i + 1] === fileNumbers[i] + 1) {
                i++;
            }
            let end = fileNumbers[i];
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
        }

        e.reply(`保存成功,编号为${ranges.join(', ')}`, true);
        return true;
    }
    
    async 查看表情包(e) {       

        const config = await readAndParseYAML('../config/config.yaml');
        const savePath = config.emojipath;
    
        if (!fs.existsSync(savePath)) {
            e.reply("目录不存在", true);
            return false;
        }

        let number = parseInt(this.e.msg.replace(/#?(查看表情包)/, ''));
        if (number){
            let filePath = path.join(savePath, `${number}.jpg`); // 根据你的文件类型修改后缀
            if (fs.existsSync(filePath)) {
                // 如果文件存在，获取它的链接
                let fileUrl = `file://${filePath}`;
                e.reply([`表情包编号${number}`,segment.image(fileUrl)]);
            } else {
                console.log('文件不存在');
            }
        } else {
            const files = fs.readdirSync(savePath);
            const numbers = files.map(file => parseInt(file.split('.')[0])).sort((a, b) => a - b);
        
            let ranges = [];
            for (let i = 0; i < numbers.length; i++) {
                let start = numbers[i];
                while (i + 1 < numbers.length && numbers[i + 1] === numbers[i] + 1) {
                    i++;
                }
                let end = numbers[i];
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
            }
        
            e.reply(`当前目录下，编号为${ranges.join(', ')}`, true);

        }
        

        return true;
    }
    

    async 删除表情包(e) {
        let number = parseInt(this.e.msg.replace(/#?(删除表情包)/, ''));
        const config = await readAndParseYAML('../config/config.yaml');
        const savePath = config.emojipath;
    
        if (!fs.existsSync(savePath)) {
            e.reply("目录不存在", true);
            return false;
        }
    
        const files = fs.readdirSync(savePath);
        const fileToDelete = files.find(file => parseInt(file.split('.')[0]) === number);
    
        if (!fileToDelete) {
            e.reply(`编号为${number}的表情包不存在`, true);
            return false;
        }
    
        fs.unlinkSync(path.join(savePath, fileToDelete));
        e.reply(`编号为${number}的表情包已被删除`, true);
        return true;
    }
    
    

}

function findFirstUnusedNumber(files) {
    let counter = 1;
    const numbers = files.map(file => parseInt(file.split('.')[0]));
    while (numbers.includes(counter)) {
        counter++;
    }
    return counter;
}

async function saveFile(url, savePath) {
    return new Promise((resolve, reject) => {
        // 检查文件夹是否存在，如果不存在就创建
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        // 获取当前路径下的文件数量作为计数器
        const files = fs.readdirSync(savePath);
        const counter = findFirstUnusedNumber(files);

        https.get(url, (res) => {
            // 从响应头获取文件类型
            const fileType = res.headers['content-type'].split('/')[1];
            // 使用计数器生成文件名
            const fileName = `${counter}.${fileType}`;
            // 创建可写流
            const fileStream = fs.createWriteStream(path.join(savePath, fileName));
            // 将响应流导入文件流
            res.pipe(fileStream);
            // 监听 'finish' 事件
            fileStream.on('finish', () => {
                console.log(`File saved as ${fileName}`);
                resolve(counter);  // 返回文件编号
            });
            // 监听 'error' 事件
            fileStream.on('error', (err) => {
                console.error(`Error saving file: ${err}`);
                reject(err);
            });
        }).on('error', (err) => {
            console.error(`Error making request: ${err}`);
            reject(err);
        });
    });
}













  




  