# 鸢尾花插件 · ALemonJS 适配版（实验性）

这是一个**独立于云崽**的 [ALemonJS](https://alemonjs.com/) 应用，把鸢尾花插件的文本类功能迁移到了 ALemonJS 的 `Router + useMessage + Format` 模型。它不依赖 `plugins/` 目录，也不会加载云崽版代码。

## 当前支持

| 指令 | 功能 |
| :--- | :--- |
| `#摸鱼日历` / `#摸鱼` | 今日日期、周/年进度、摸鱼语录 |
| `#今日新闻` / `#新闻` | 60 秒读懂世界（最多 15 条） |
| `#鸢尾花帮助` / `#帮助` | 指令列表 |

数据源与云崽版一致：`https://60s.viki.moe/v2/moyu`、`https://60s.viki.moe/v2/60s`。

## 目录结构

```text
alemonjs/
├── app.ts                 # 开发入口：start('src/index.ts')
├── src/
│   ├── index.ts           # Router 注册与 defineChildren
│   ├── lib/daily.ts       # 请求与文本格式化（纯函数）
│   └── response/          # moyu / news / help 三个响应模块
├── alemon.config.yaml
├── package.json
└── tsconfig.json
```

## 运行

```bash
cd alemonjs
npm install          # 或 pnpm install

# 开发模式（需要可用的 alemonjs / lvyjs）
npx lvy app.ts

# 构建后运行
npx lvy build
node index.js
```

> 还需要按 ALemonJS 文档接入一个消息平台（例如 `@alemonjs/qq-bot`、`@alemonjs/onebot`），并在 `alemon.config.yaml` 中完成对应配置；本目录只包含应用代码。

## 已知限制

- 仅迁移文本指令；**表情包保存/查看/删除、塔罗牌、天气图片、定时推送尚未迁移**。这些功能仍请在云崽版使用。
- 未做完整的运行时验证：测试时 npm 上 `alemonjs@2.1.125` 的 `bin/alemonjs.js` 缺失，`npx alemonjs` 无法启动。本目录按官方模板（`create-alemonjs@0.0.31`，模板使用 `alemonjs@2.1.109`）编写，建议先用该版本验证。
- 不包含配置持久化；后续如需保存配置，按 ALemonJS 约定写入 Redis 的 `data:logier-*` 键。

## 与云崽版的关系

- 云崽版：`apps/` + `utils/`，通过 `plugin` 基类加载，功能完整。
- ALemonJS 版：`alemonjs/`，独立应用，当前是文本子集。
- 两者共用同一套 60s 数据源；接口返回格式变化时，需要同时修改 `utils/daily-api.mjs` 与 `alemonjs/src/lib/daily.ts`。
