import { useMessage, Format } from 'alemonjs';

export default async () => {
  const [message] = useMessage();
  const format = Format.create();
  format.addText(
    [
      '鸢尾花插件 · ALemonJS 适配版（实验性）',
      '',
      '可用指令：',
      '· #摸鱼日历 —— 今日摸鱼进度与语录',
      '· #今日新闻 —— 60 秒读懂世界',
      '· #鸢尾花帮助 —— 显示本帮助',
      '',
      '说明：当前适配版只迁了文本类功能；表情包保存、塔罗牌、天气图片仍请在云崽版使用。'
    ].join('\n')
  );
  message.send({ format });
};
