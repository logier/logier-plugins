import { useMessage, Format } from 'alemonjs';
import { getNewsText } from '../lib/daily';

export default async () => {
  const [message] = useMessage();
  const text = await getNewsText();
  const format = Format.create();
  format.addText(text ?? '今日新闻暂时不可用，请稍后再试');
  message.send({ format });
};
