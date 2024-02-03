
# 鸢尾花插件(logier-plugin)

<div align="center">
  <a href="https://logier.gitee.io/">
    <img src="./img/logo.png" alt="Logo" height="120">
  </a>

<br>

 [![Group](https://img.shields.io/badge/QQ群-blue?style=flat-square&labelColor=FFF0F5&logo=tencentqq&logoColor=black)](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY) &nbsp; [![Group](https://img.shields.io/badge/个人网站-blue?style=flat-square&labelColor=white&logo=hexo&logoColor=black)](https://logier.gitee.io/) &nbsp;[![Group](https://img.shields.io/badge/表情包仓库-blue?style=flat-square&labelColor=white&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAgCAMAAACrZuH4AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACfUExURf////j1/O7p9Ozo8+ri9eTZ8uPZ8d3P79bG7NbF7M+86cmz5siy5cGp4rug37Gcz7Gbz7SW3LSV3LKW2a+Xz6qbw62M2aeD1qaC1Z950pd6v5Z6v5lwz5hvz5VyxJZszZNryYp1rZJmzIVktYVktIddv4RcvYBesHVdnnxUsndYpnlVrndSrHZPrHROqmhQjls8jlk6jEQ9WS0xNykvM/nZ+iEAAAEtSURBVHjavZLNUsMgFIUPSSENYNtxbHWj7/9Wblw4OprGhPyXuCCkAaIbZ2RxQ5iPA/dwgL8P4vwkLBWAqrt2XCXkgdlpl6mQICex1FNvk0w8L52kczyjk0pkV1Lp3VAmHrEPmjh4BA8I4RJ0xQnqavw4fiNGh+hXiMHVqAKg9E4JRS4eUQREbj6b+a10BNzEl8JWPXgEdARsCIGtGu7LHZ+2A7AlY2OrvCXVkriXpAOasYStCdPnJVHs4n62YAAA1jyPc4IOHKnoW7eVhKoaKjc3vePz9oUdVAjw3GhEO4FWxB6hEqgvfc3pFMKzapO9mWbZNcmUQZq8vFYAwB9MmEt0vSEep/zU79bHYzo5/WK65RQA+o9P66MuexYDQFsaDSJTVGG3HHU54n/GNzfuY3xEoh+0AAAAAElFTkSuQmCC&logoColor=black)](https://gitee.com/logier/emojihub/) &nbsp; <a href='https://gitee.com/logier/logier-plugins/stargazers'><img src='https://gitee.com/logier/logier-plugins/badge/star.svg?theme=dark' alt='star'></img></a>

 <img src="https://count.getloli.com/get/@:logier?theme=moebooru-h" alt=":logier" />
</div>
<br>

***如果发现bug，希望及时Q群告知我或提交issue***

## 安装教程

Yunzai-Bot目录下执行(二者选其一)

gitee
```
git clone --depth=1 https://gitee.com/logier/logier-plugins.git ./plugins/logier-plugin/
```
github
```
git clone --depth=1 https://github.com/logier/logier-plugins.git ./plugins/logier-plugin/
```
## 功能

发送 **#鸢尾花帮助** 获取插件详细信息（待完善）
<details> <summary>鸢尾花帮助</summary>
<img src="./img/help.jpg" >
</details>

<br>
插件配置很多，但关键配置可通过锅巴配置

| 名称 | 功能 |
|-------|------ |
| 表情包仓库 | 指令触发发送表情包 |
| 表情包小偷 | 记录群友表情包并随机发送 |
| 戳一戳表情 | 戳一戳触发，可接入GPT。 |
| 保存表情包 | 手动保存群友表情包，**保存+图片**触发 | 
| 定时发图 | 定时向群里发送相册，**#定时发图**手动触发 |
| 摸鱼日历 | 定时向群里发送摸鱼日历，**#摸鱼日历**手动触发 | 
| 今日新闻 | 定时向群里发送每天60s新闻，**#今日新闻**手动触发 | 
| 城市天气 | 定时向群里发送城市天气，**#天气+城市**手动触发 | 
| 今日运势 | **#今日运势**触发 | 
| 算一卦 | **#算一卦**触发 | 
| 塔罗牌 | 抽卡后由GPT占卜结果，**塔罗牌、占卜+占卜内容**触发 |
| 签到 | **#签到**触发 |
| 进退群通知 | 有人进群、退群时触发，发送诙谐的进群欢迎 | 
| 问候回复 |  **早上好**、**晚上好** 等打招呼词触发，AI回复 |
<br>

<details> <summary>表情包仓库</summary>

- 可联动**保存表情包**，将保存地址填入自定义表情包地址。
- [表情包仓库源地址](https://gitee.com/logier/emojihub])
- 配置项可配置屏蔽部分表情包，如龙图、小黑子，支持分群配置,请手动在/config/emojihub.yaml里面编辑。
- 可配置表情包仓库随机时自定义表情包概率，默认为0

| 指令 | 表情包 | 指令 | 表情包 |
| :----:| :----: | :----:| :----: |
| 表情包仓库 | 全随机 | 自定义表情包 | 自定义表情包 |
| 阿夸 | <img src="./img/阿夸70.webp" width="50px"> | 阿尼亚 | <img src="./img/阿尼亚52.webp" width="50px"> |
| 白圣女 | <img src="./img/白圣女19.webp" width="50px"> | 柴郡 | <img src="./img/柴郡82.webp" width="50px"> |
| 甘城猫猫 | <img src="./img/nacho10.webp" width="50px"> | 狗妈 | <img src="./img/54.webp" width="50px"> |
| chiikawa | <img src="./img/chiikawa65.webp" width="50px"> | 龙图 | <img src="./img/long4.gif" width="50px"> |
| capoo | <img src="./img/capoo7.webp" width="50px"> | 小黑子 | <img src="./img/什么？有人黑我？.webp" width="50px"> |
| 亚托莉 | <img src="./img/亚托莉8.webp" width="50px"> | 真寻 | <img src="./img/真寻酱17.webp" width="50px"> |
| 七濑胡桃 | <img src="./img/menhera8.webp" width="50px"> | 小狐狸 | <img src="./img/2509595_68132875_p0.webp" width="50px"> |
| 喵内 | <img src="./img/v2-1149a5b7f21e7dcced326221b5d76187_720w.webp" width="50px"> | 波奇 | <img src="./img/v2-1cecb2cfb0a7b224db54a1500564068d.webp" width="50px"> |
| 心海 | <img src="./img/axsgQ2s-pnkZ1rT1kS74-2v.gif" width="50px"> |  |  |
</details>
<br>

<details> <summary>表情包小偷</summary>

- 配置群号，当群里有人发表情包时，会记录到数据库。
- 配置概率，当配置群里有人发消息时，会概率把之前记录的表情包发送。
- 因为需要asface参数，目前只支持icqq。
- 后续计划加入随机表情包仓库图片，就不会限定icqq。
</details>
<br>

<details> <summary>戳一戳表情包</summary>

- 戳一戳发送表情包，配置和**表情包仓库**共用。
- 配置概率，默认为0，全部用表情包回复，提高会概率用GPT回复。
- GPT需要配置key，[如何获取key？](#如何获取key)
- 若使用GPT回复，请手动在/config/key.yaml修改人格
<img src="./img/chuoyichuo.jpg" width="40%">
</details>
<br>

<details> <summary>保存表情包</summary>

- **保存+图片**或**引用图片+保存**即可保存。
- 默认保存路径云崽根目录+/resources/logier/emoji
- 支持保存多张。
- **查看表情包**会返回图片编号
- **查看表情包+编号**会发送此编号的图片
- **删除表情包+编号**会删除此编号的图片
- 未来也许会会支持多路径保存
</details>
<br>

<details> <summary>定时发图、摸鱼日历、今日新闻</summary>

- [定时发图如何获取图片api？](#如何获取图片api)
- 配置发送时间，采用cron表达式。[如何写Cron表达式？](#cron表达式)
</details>
<br>


<details> <summary>城市天气</summary>

- 配置发送时间，采用cron表达式。[如何写Cron表达式？](#cron表达式)
- 使用和风天气API获得天气信息

<img src="./img/weather.jpg" width="40%">
</details>
<br>

<details> <summary>今日运势</summary>

- [今日运势图片api](#如何获取图片api)
<img src="./img/jrys.jpg" width="40%">
</details>
<br>

<details> <summary>算一卦</summary>

- [算一卦图片api](#如何获取图片api)
<img src="./img/算一卦.jpg" width="40%">
</details>
<br>

<details> <summary>塔罗牌</summary>

- 由AI解析占卜，需要gptkey [如何获取key？](#如何获取key)
- 发送塔罗牌+想占卜的东西即可
<img src="./img/塔罗牌.webp" width="40%">
</details>
<details> <summary>占卜</summary>

- 支持抽三张占卜，发送 占卜+想占卜的东西 即可。
- 注意！三牌占卜会用合并转发形式发送，部分适配器可能不支持。
<img src="./img/占卜.png" width="40%">
</details>
<br>


<details> <summary>签到</summary>

- 请使用横图图源 [如何获取图片api？](#如何获取图片api)
- 竖图适配也许做，也许不做。
<img src="./img/签到.jpg" width="40%">
</details>
<br>

<details> <summary>进退群通知</summary>

- 修改自官方插件。
- 进群时会发送其头像和一句 俏皮话欢迎。
- 退群时有必要说俏皮话吗？
<img src="./img/进退群.png" width="40%">
</details>
<br>

<details> <summary>问候回复</summary>

- 发送早安、中午好、晚上好等词回复。
- GPT回复，需要key，[如何获取key？](#如何获取key)
<img src="./img/问候回复.png" width="40%">
</details>
<br>

<details> <summary>今日老婆</summary>

- 重复发送marry会看到今天娶了谁。
- 使用图片形式发送，带有一句结婚祝词。
- 可以离婚（
- 离婚一天只能一次。
- 想用相合伞渲染，让两个人的名字在伞下两边，但找不到好的相合伞素材（

<img src="./img/marry.webp" width="40%">
</details>
<br>


## 注意

### 如何填入本地图库？
使用图片时，均可以使用本地或者网络图片
本地图片支持图片文件上级目录，也就是如果文件结构如下，可以填写emojihub或capoo-emoji
```
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
支持webp、jpeg、webp、webp、gif
```
寻图逻辑是当前目录下没有图片就随机选择一个文件夹继续搜寻

<br>

### 如何获取key？

塔罗牌、问候回复和戳一戳回复需要GPT，可以前往[chatanywhere](https://github.com/chatanywhere/GPT_API_free?tab=readme-ov-file#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8)免费获得。

<details> <summary>还是不懂？</summary>

1.点击领取内测免费API Key

<img src="./img/chatanywhere.png" >

<br>

2.复制这一串东西填入

<img src="./img/apikey.png" >
</details>
<br>
<br>

城市天气可以前往[和风天气](https://console.qweather.com/#/apps)免费获得

还是不懂？👉[和风天气官方教程](https://dev.qweather.com/docs/configuration/project-and-key/)
<br>

### 如何获取图片api

本插件自带一个logier严选的pid索引，使用p站反代获取图片，推荐自行更换更稳定的图源，最好本地图源。

[我的个人博客](https://logier.gitee.io/gallery/)有很多我收集的图片api
<details> <summary>图片api预览</summary>
<img src="./img/gallery.webp" >
</details>
<br>


### Cron表达式

[在线Cron表达式生成器](https://cron.qqe2.com/)
```
各位代表的意思 *-代表任意值 ？-不指定值，仅日期和星期域支持该字符。 （想了解更多，请自行搜索Cron表达式学习）
    *  *  *  *  *  *
    ┬  ┬  ┬  ┬  ┬  ┬
    │  │  │  │  │  |
    │  │  │  │  │  └ 星期几，取值：0 - 7，其中 0 和 7 都表示是周日
    │  │  │  │  └─── 月份，取值：1 - 12
    │  │  │  └────── 日期，取值：1 - 31
    │  │  └───────── 时，取值：0 - 23
    │  └──────────── 分，取值：0 - 59
    └─────────────── 秒，取值：0 - 59（可选）
```

## 作者
logier
- qq群：[315239849](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY)
- 个人网站：[logier.icu](https://logier.gitee.io/)

## 鸣谢
- [jryspro](https://github.com/twiyin0/koishi-plugin-jryspro)
- [一些基础插件示例~](https://gitee.com/Zyy955/Miao-Yunzai-plugin)
- [Yunzai-Bot 相关内容索引](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-indexn)
- [Xrk-plugin](https://gitee.com/xrk114514/xrk-plugin)