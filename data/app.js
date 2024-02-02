
import fs from "fs";

// 读取 processed_guayao.json 文件
fs.readFile('processed_guayao.json', 'utf8', (err, guayaoData) => {
    if (err) {
        console.error(`读取 processed_guayao.json 文件时出错: ${err}`);
        return;
    }

    // 解析 JSON 数据
    const guayaoJson = JSON.parse(guayaoData);

    // 读取 new_guachi.json 文件
    fs.readFile('new_guachi.json', 'utf8', (err, guachiData) => {
        if (err) {
            console.error(`读取 new_guachi.json 文件时出错: ${err}`);
            return;
        }

        // 解析 JSON 数据
        const guachiJson = JSON.parse(guachiData);

        // 将 processed_guayao.json 文件的内容一一对应地加入到 new_guachi.json 文件
        for (let key in guayaoJson) {
            if (guachiJson[key]) {
                guachiJson[key]['卦爻'] = guayaoJson[key];
            }
        }

        // 将合并后的 JSON 数据写入 new_guachi.json 文件
        fs.writeFile('process_guachi.json', JSON.stringify(guachiJson, null, 2), 'utf8', err => {
            if (err) {
                console.error(`写入 new_guachi.json 文件时出错: ${err}`);
            } else {
                console.log('成功将 processed_guayao.json 文件的内容一一对应地加入到 new_guachi.json 文件！');
            }
        });
    });
});