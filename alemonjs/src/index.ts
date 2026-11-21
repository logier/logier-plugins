import { Router, logger } from 'alemonjs';

const router = Router.create({
  events: ['message.create', 'private.message.create']
});

const group = router.group({
  routeText: {
    prefixes: ['/', '#', '＃', '!', '！'],
    stripPrefix: true,
    allowBare: true
  }
});

group.use('摸鱼日历', () => import('./response/moyu'));
group.use('摸鱼', () => import('./response/moyu'));
group.use('今日新闻', () => import('./response/news'));
group.use('新闻', () => import('./response/news'));
group.use('鸢尾花帮助', () => import('./response/help'));
group.use('帮助', () => import('./response/help'));

export default defineChildren({
  register() {
    return {
      responseRouter: router.define
    };
  },
  onReady() {
    logger.info('[logier-plugin] ALemonJS 适配版已就绪');
  }
});
