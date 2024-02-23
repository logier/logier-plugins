
export class example extends plugin {
    constructor (){
        super({
            name: '[鸢尾花插件]今日CP',
            dsc: 'CP生成',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: "^#?(今日cp|今日CP|cp生成|CP生成)$",
                    fnc: 'cp生成',
                },
            ]
        })
    };
    async cp生成(e) {
        try {
            let now = new Date().toLocaleDateString('zh-CN');
            let data = await redis.get(`Yunzai:logier-plugin:g${e.group_id}:${e.user_id}_cp`);
            let [randomWife, selfMember] = await getRandomWife(e);
            
            if (data) {
                data = JSON.parse(data);
                if (!data.marry || !data.time || typeof data.isRe !== 'boolean') {
                    throw new Error('Invalid data format');
                }
            } else {
                logger.info('未读取到CP数据，随机抽取');
                data = {
                    marry: randomWife,
                    time: now,
                    isRe: false
                };
            }
            
            if (now === data.time) {
                logger.info('今日已有CP，读取保存的数据');
            } else {
                logger.info('日期已改变，重新获取CP');
                data = {
                    marry: randomWife,
                    time: now,
                    isRe: false
                };
            }
            
            await redis.set(`Yunzai:logier-plugin:g${e.group_id}:${e.user_id}_cp`, JSON.stringify(data));

            const marrydata = JSON.parse(await redis.get(`Yunzai:logier-plugin:g${e.group_id}:${e.user_id}_cp`));
         
            if (marrydata && marrydata.marry.nickname) {
                let cleanNickname1 = e.nickname.replace(/[^\x00-\x7F\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]/g, '');
                let cleanNickname2 = marrydata.marry.nickname.replace(/[^\x00-\x7F\u4e00-\u9fa5\u3000-\u303F\uff00-\uffef]/g, '');
            
                // 如果名字为空，就用 "七娃" 来替代
                if (cleanNickname1 === '') {
                    cleanNickname1 = '七娃';
                }
                if (cleanNickname2 === '') {
                    cleanNickname2 = '七娃';
                }
            
                // 如果名字长度超过6，只取前6个字符
                if (cleanNickname1.length > 6) {
                    cleanNickname1 = cleanNickname1.slice(0, 6);
                }
                if (cleanNickname2.length > 6) {
                    cleanNickname2 = cleanNickname2.slice(0, 6);
                }
            
                logger.info(`https://api.xingzhige.com/API/cp_generate_2/?name1=${cleanNickname1}&name2=${cleanNickname2}&data=img`)
                e.reply([segment.image(`https://api.xingzhige.com/API/cp_generate_2/?name1=${cleanNickname1}&name2=${cleanNickname2}&data=img`)]);
            } else {
                throw new Error('Invalid marrydata format');
            }
            
            

            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }
}

async function getRandomWife(e) {
    try {
        let mmap = await e.group.getMemberMap();
        let arrMember = Array.from(mmap.values());
        const selfMember = arrMember.find(member => member.user_id === String(e.user_id))
        let excludeUserIds = [String(e.self_id), String(e.user_id), '2854196310'];
        let filteredArrMember = arrMember.filter(member => !excludeUserIds.includes(String(member.user_id)));
        if (filteredArrMember.length === 0) {
            throw new Error('No available members to select as wife');
        }
        const randomWife = filteredArrMember[Math.floor(Math.random() * filteredArrMember.length)];
        return [randomWife, selfMember];
    } catch (err) {
        logger.error(err);
        throw err;
    }
}



