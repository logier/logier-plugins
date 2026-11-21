import { useMessage, Format } from 'alemonjs';
import { getMoyuText } from '../lib/daily';

export default async () => {
  const [message] = useMessage();
  const text = await getMoyuText();
  const format = Format.create();
  format.addText(text ?? '摸鱼日历暂时不可用，请稍后再试');
  message.send({ format });
};
