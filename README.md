# 鸢尾花插件

> 云崽（Yunzai-Bot）插件集：表情包、定时推送、运势娱乐与群管理。

**主仓库**：[Gitee](https://gitee.com/logier/logier-plugins) ｜ **镜像**：[GitHub](https://github.com/logier/logier-plugins) ｜ **QQ 群**：[点击加入](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY) ｜ **表情包仓库**：[emojihub](https://gitee.com/logier/emojihub)

[![star](https://gitee.com/logier/logier-plugins/badge/star.svg?theme=dark)](https://gitee.com/logier/logier-plugins/stargazers)
[![爱发电](https://img.shields.io/badge/爱发电-logier-ff69b4)](https://afdian.net/a/logier)

---

## 目录

- [快速开始](#快速开始)
- [功能一览](#功能一览)
- [功能说明](#功能说明)
- [配置](#配置)
- [常见问题](#常见问题)
- [更新与兼容](#更新与兼容)
- [Fork 与衍生版本](#fork-与衍生版本)
- [鸣谢](#鸣谢)

---

## 快速开始

### 前置条件

- 已安装并能正常登录的云崽（[Miao-Yunzai](https://gitee.com/yoimiya-kokomi/Miao-Yunzai) 或 [TRSS-Yunzai](https://gitee.com/TimeRainStarSky/Yunzai)）
- 推荐安装 [锅巴插件](https://gitee.com/guoba-yunzai/guoba-plugin)，在网页里配置全部选项

### 安装

在云崽根目录执行（二选一，**目录名保持 `logier-plugin`**）：

```bash
# Gitee（推荐，国内直连）
git clone --depth=1 https://gitee.com/logier/logier-plugins.git ./plugins/logier-plugin/

# GitHub（镜像，需要能访问 GitHub）
git clone --depth=1 https://github.com/logier/logier-plugins.git ./plugins/logier-plugin/
```

安装后重启云崽，发送 **`#鸢尾花帮助`** 查看当前可用指令。

> 如果使用锅巴安装，锅巴默认生成的目录名可能不是 `logier-plugin`，请在锅巴里把插件目录改成 `logier-plugin`，否则配置文件和更新会找不到路径。

---

## 功能一览

| 分类 | 功能 | 触发方式 |
| :--- | :--- | :--- |
| 表情包 | 表情包仓库 | `#表情包` 或对应角色名 |
| 表情包 | 表情包小偷 | 群内发消息随机触发（先记录群友表情包） |
| 表情包 | 戳一戳表情 | 被戳一戳时触发 |
| 表情包 | 保存 / 查看 / 删除 | `#存表情` `#存涩图`、`#查看表情包 [编号]`、`#删除表情包 [编号]` |
| 定时 | 定时发图 / 摸鱼日历 / 今日新闻 | cron 定时推送 |
| 定时 | 城市天气 | cron 定时推送（和风天气 Key） |
| 运势娱乐 | 今日运势 / 悔签 | `#今日运势` `#悔签` |
| 运势娱乐 | 算一卦 / 悔卦 | `#算卦` `#悔卦` |
| 运势娱乐 | 塔罗牌 / 占卜 | `#塔罗牌` `#占卜` `#彩虹塔罗牌` |
| 运势娱乐 | 签到 | `#签到` |
| 运势娱乐 | 今日番剧 | `#今日番剧` |
| 运势娱乐 | 今日老婆 / 今日 CP | `marry`、`#今日cp` |
| 群管理 | 进退群通知 | 进群 / 退群时触发 |
| 群管理 | 问候回复 | 发送早安、晚安等词 |
| 群管理 | 潜伏模板 | 群内发消息概率触发 |
| 自定义 | 自定义图片 API | 自定义指令 |

---

## 功能说明

### 表情包系列

**表情包仓库**

- 内置多个角色表情包分类，发送 `#表情包` 随机一张。
- 支持联动「保存表情包」：把保存目录填进自定义表情包地址即可使用自己的图库。
- 支持锅巴分群屏蔽（如龙图、小黑子），也可配置随机时使用自定义表情包的概率，默认 0。
- 图源：[emojihub](https://gitee.com/logier/emojihub)

<details>
<summary>查看内置表情包分类</summary>

| 指令 | 指令 | 指令 | 指令 |
| :---: | :---: | :---: | :---: |
| 阿夸 | 阿尼亚 | 白圣女 | 柴郡 |
| 甘城猫猫 | 狗妈 | chiikawa | 龙图 |
| capoo | 小黑子 | 亚托莉 | 真寻 |
| 七濑胡桃 | 小狐狸 | 喵内 | 波奇 |
| 心海 | 自定义表情包 | | |

</details>

**表情包小偷**

- 配置群号后，群友发表情包会自动记录到 Redis（单群最多保留最近 50 张）。
- 群友发消息时按概率发送已记录的表情包；概率为 0 时只记录不发送。
- 缓存图片过期（QQ 图片链接带时效性 rkey）时会自动删除并换一张新图，不再刷屏报错。

**戳一戳表情**

- 被戳一戳时发送表情包，配置与「表情包仓库」共用。
- 可配置概率用 GPT 回复代替表情包；GPT 需要 Key，见 [如何获取 Key](#如何获取-key)。

**保存表情包**

- 发送图片并 `#存表情` / `#存涩图`，或引用图片后发送指令。
- 支持一次保存多张，自动编号；默认保存到 `云崽根目录/resources/logier/emoji`。
- `#查看表情包` 列出编号区间，`#查看表情包 12` 查看单张，`#删除表情包 12` 删除单张。
- 下载会校验 HTTP 状态、图片类型、大小（默认 20 MiB）与超时，失败不会留下残缺文件。

### 定时系列

- 定时发图、摸鱼日历、今日新闻、城市天气均使用 cron 表达式，可用 [Cron 在线生成器](https://cron.qqe2.com/)。
- 城市天气使用和风天气 API，需要 Key，见 [如何获取 Key](#如何获取-key)。
- 首次使用请在锅巴里填写推送群号与时间；未配置时会跳过推送而不是报错。

### 运势娱乐

- **今日运势 / 算一卦 / 签到**：依赖图片 API，见 [如何获取图片 API](#如何获取图片-api)。
- **塔罗牌 / 占卜**：由 AI 解析，需要 GPT Key；三张牌占卜使用合并转发，部分适配器可能不支持。
- **今日老婆**：重复发送 `marry` 可查看今天娶了谁，支持离婚（每天一次）。
- **今日 CP**：随机抽取一位群友组成 CP。

### 群管理

- **进退群通知**：进群发送头像与欢迎语，退群发送告别语。
- **问候回复**：早安、中午好、晚上好等触发，可接 GPT。
- **潜伏模板**：群内消息概率触发 GPT 回复并附表情包。

---

## 配置

### 本地图库

图片配置既可以填网络地址，也可以填本地目录。本地目录会递归读取子文件夹并随机取一张：

```text
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   └── greyscale-emoji
│       └── greyscale100.gif
```

支持 `jpg`、`jpeg`、`png`、`webp`、`gif`。

### 如何获取 Key

- **GPT（塔罗牌、问候回复、戳一戳）**：可在 [chatanywhere](https://github.com/chatanywhere/GPT_API_free) 领取免费 Key。
- **和风天气（城市天气）**：在 [和风天气控制台](https://console.qweather.com/#/apps) 创建项目获取 Key。

<details>
<summary>图文步骤</summary>

1. 打开 chatanywhere，点击「领取内测免费 API Key」。
2. 复制以 `sk-` 开头的 Key，填入锅巴对应配置项。

</details>

### 如何获取图片 API

作者收集的图片 API 列表：[logier.gitee.io/gallery](https://logier.gitee.io/gallery/)。

---

## 常见问题

**Q：提示「图标已过期」/ 图片发送失败？**
QQ 的图片链接带有时效性 `rkey`，缓存久了会失效。当前 master 已让表情包小偷在发送失败时自动清理并换新图；自己保存到本地的表情包不受影响。

**Q：保存表情包没反应或报错？**
先确认保存目录存在且可写，再升级到最新 master：已修复引用消息取图、空图片列表、下载校验与并发编号等问题。

**Q：启动时报 `Cannot read properties of undefined (reading 'PushTime')`？**
旧配置缺少摸鱼日历字段导致，当前 master 已加默认值与空配置保护，升级后重启即可。

**Q：锅巴提示插件目录不存在？**
把插件目录名改为 `logier-plugin`，或在锅巴里重新指定实际目录。

**Q：塔罗牌/天气报 `Navigation timeout`、`puppeteer launch` 失败？**
属于浏览器渲染环境问题：确认已安装 Chromium 依赖、网络能访问对应图片站，或在配置中调大超时时间。

**Q：更新后配置丢了？**
1.2.2 起配置键保持兼容（含旧的 `DefalutReplyRate` 拼写），升级不会清空已有配置；仍建议升级前备份 `config/` 与 `data/`。

---

## 更新与兼容

- 云崽内发送 `#更新`（需安装更新插件），或进入插件目录执行 `git pull`，然后重启云崽。
- 版本日志见 [CHANGELOG.md](./CHANGELOG.md)。
- 当前分支同时提供 Node.js 单元测试与源码检查：

```bash
node scripts/check-source.mjs   # 语法与 JSON 校验
node --test tests/*.test.mjs    # 单元测试
```

### 云崽框架兼容性

以下框架已在无 QQ 登录的条件下验证过插件加载与可离线执行的指令（2026-11 测试）：

| 框架 | 测试版本 | 验证结果 |
| :--- | :--- | :--- |
| [TRSS-Yunzai](https://gitee.com/TimeRainStarSky/TRSS-Yunzai) | 最新 master | 加载插件 42 个，HTTP 服务正常启动，无报错 |
| [Miao-Yunzai](https://gitee.com/yoimiya-kokomi/Miao-Yunzai) | 3.1.3 | 25 个应用模块全部加载 |
| [Yunzai-Bot](https://gitee.com/yoimiya-kokomi/Yunzai-Bot) | 3.0.0 | 离线 `lib/tools/test.js` 加载成功，实际执行保存/查看/删除表情包与表情包小偷写 Redis |
| [yunzai-bot-lite](https://gitee.com/Nwflower/yunzai-bot-lite) | 最新 master | 加载成功；该框架没有 `plugins/other/update.js`，插件已改为按需加载并提供手动更新提示 |

> 未登录 QQ 的测试覆盖插件加载、指令分发、图片下载与本地文件/Redis 读写；消息发送、渲染图片在 QQ 客户端的显示效果仍需真实账号验证。

---

## Fork 与衍生版本

本项目欢迎 Fork。以下是已知的公开 Fork / 衍生版本，可按需选用：

| 仓库 | 说明 |
| :--- | :--- |
| [cnxiaodoubi/logier-plugins](https://gitee.com/cnxiaodoubi/logier-plugins) | Gitee 功能分支版本，部分修复会先在这里验证 |
| [OvertimeBunny/logier-plugin](https://gitee.com/OvertimeBunny/logier-plugin) | Gitee 衍生版本 |
| [mxyx0412/logier-plugins](https://github.com/mxyx0412/logier-plugins) | GitHub Fork |
| [Mtoly/logier-plugins](https://github.com/Mtoly/logier-plugins) | GitHub Fork |

更多 Fork：

- Gitee：[zuimengfusheng](https://gitee.com/zuimengfusheng/logier-plugins)、[wzc_Test](https://gitee.com/wzc_Test/logier-plugins)、[nanxu2019](https://gitee.com/nanxu2019/logier-plugins)、[qek123](https://gitee.com/qek123/logier-plugins)、[xiaomifan233](https://gitee.com/xiaomifan233/logier-plugins)、[sheep2007](https://gitee.com/sheep2007/logier-plugins)
- GitHub Fork 列表：<https://github.com/logier/logier-plugins/forks>

> Fork 版本由各自作者维护，功能和配置可能与本仓库不同；反馈问题前请先确认版本来源。

---

## 鸣谢

- [爱发电](https://afdian.net/a/logier)
- 参考仓库：[今日运势](https://github.com/twiyin0/koishi-plugin-jryspro)、[云崽插件示例](https://gitee.com/Zyy955/Miao-Yunzai-plugin)、[云崽市场](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-indexn)、[向日葵插件](https://gitee.com/xrk114514/xrk-plugin)

<details>
<summary>赞助人列表</summary>

| 昵称 | 金额 |
| :---: | :---: |
| 悠修 | 10 元 |
| 慕蝶 | 5 元 |
| Hirasawa Yui | 5 元 |
| EF-2000 台风 | 50 元 |

</details>
