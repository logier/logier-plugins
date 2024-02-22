import { readAndParseYAML, getPersonality, getemoji } from '../utils/getdate.js'

// 导出一个问候插件
export class greetings extends plugin {
    // 构建正则匹配等
    constructor() {
        super({
            name: "[鸢尾花插件]潜伏gpt",
            event: "message",
            priority: 5001,
            rule: [
                {
                    reg: '',
                    fnc: '潜伏'
                },
            ]
        })
    }

    async 潜伏(e) {
        const key = await readAndParseYAML('../config/key.yaml');   
        const qianfuConfig = await readAndParseYAML('../config/qianfu.yaml'); 
            
        if (!key.gptkey){
          logger.info('未配置gptkey')
          return false
        }
      
        if (Math.random() > Number(qianfuConfig.qianfu)) {return false}
        
        let arr2 = [        
          {"role": "user", "content": `${e.nickname}说：${e.msg}`}];
        let gptmsg = await getPersonality()
        gptmsg.push(...arr2);
        const content = await gpt(key.gptkey, key.gpturl, key.model, gptmsg);
      
      
        if (!content) {
          logger.info('gptkey错误，结束进程')
          return false
        }
      
        // 使用正则表达式分割 content
        const sentences = content.split(/(?<=[。！?;；:：])/g);
      
        // 轮流回复
        for (let index = 0; index < sentences.length; index++) {
            if (index === 0) {
            // 第一句回复时使用这种形式，并延迟3到15秒
            await new Promise(resolve => setTimeout(resolve, Math.random() * (10000 - 3000)));
            e.reply(sentences[index], true);
            } else {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 输出间隔三秒
            e.reply(sentences[index]);
            }
        }
        
        
        let imageUrl = await getemoji(e, qianfuConfig.qianfucategory);
        if (imageUrl) {
            await new Promise(resolve => setTimeout(resolve, sentences.length * 3000)); // 在所有句子都回复完之后再发送图片
            logger.info(`发送“${qianfuConfig.qianfucategory}”表情包`);
            e.reply([segment.image(imageUrl)]);
        }
  
  
  
      
        return true;
      };
      
      
}



async function gpt(gptkey, gpturl, model, messages) {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + gptkey );
    myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "model": model,
        "messages": messages,
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
