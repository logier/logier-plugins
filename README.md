
# 鸢尾花插件(logier-plugin)

<p align="center">
  <a href="https://www.logier.icu/">
    <img src="./img/logo.png" alt="Logo" height="150">
  </a>
<br>

[![Gitee](https://img.shields.io/badge/Gitee-鸢尾花插件-black?style=flat-square&logo=gitee)](https://gitee.com/xwy231321/ql-plugin)&nbsp; [![云崽bot](https://img.shields.io/badge/云崽-v3.0.0-black?style=flat-square&logo=dependabot)](https://gitee.com/Le-niao/Yunzai-Bot) &nbsp; [![Group](https://img.shields.io/badge/群号-315239849-red?style=flat-square&logo=GroupMe&logoColor=white)](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY) &nbsp; <a href='https://gitee.com/logier/logier-plugins/stargazers'><img src='https://gitee.com/logier/logier-plugins/badge/star.svg?theme=dark' alt='star'></img></a>


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
| 表情包仓库 | 指令触发，**#表情包**全随机，**#龙图**发送龙图，**#自定义表情包**发送自定义表情包 |
| 表情包小偷 | 无指令，设定好群后，每当有人在群里发表情就会记录到数据库，当有人发消息时会概率发送记录的表情包，概率默认为0 |
| 戳一戳表情包 | 戳一戳触发，50%概率发送表情包，50%概率触发GPT回复，GPT回复可以去key.yaml修改人格。 |
| 保存表情包 | **#保存+图片**或者 **#保存+引用回复**，将图片保存到指令目录，**#查看表情包**显示已存储表情包编号，**#删除表情包+对应编号** | 
| 定时发图 | 定时向群里发送相册，**#定时发图**手动触发 |
| 摸鱼日历 | 定时向群里发送摸鱼日历，**#摸鱼日历**手动触发 | 
| 今日新闻 | 定时向群里发送每天60s新闻，**#今日新闻**手动触发 | 
| 城市天气 | 定时向群里发送城市天气，**#天气+城市**手动触发，和风天气提供API | 
| 今日运势 | **#今日运势**触发 | 
| 算一卦 | **#算一卦**触发 | 
| 塔罗牌 | **#塔罗牌+占卜内容**触发抽一张，**#占卜+占卜内容**抽三张，占卜结果由GPT生成 |
| 签到 | **#签到**触发 |
| 进退群通知 | 有人进群、退群时触发，发送诙谐的进群欢迎 | 
| 问候回复 |  **早上好**、**晚上好** 等打招呼词触发，AI回复 |


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

### 如何获取图片api？

[我的个人博客](https://logier.gitee.io/gallery/)有很多我收集的图片api

<details> <summary>图片api预览</summary>
<img src="./img/gallery.webp" >
</details>

<br>


## 作者
logier
- qq群：[315239849](https://qm.qq.com/cgi-bin/qm/qr?k=Tx0KJBxwamQ1slXC4d3ZVhSigQ9MiCmJ&jump_from=webapi&authKey=BJVVNjuciQCnetGahh3pNOirLULs1XA7fQMn/LlPWAWk5GDdr2WWB/zHim1k1OoY)
- 个人网站：[logier.icu](https://logier.gitee.io)

## 鸣谢
- [jryspro](https://github.com/twiyin0/koishi-plugin-jryspro)
- [一些基础插件示例~](https://gitee.com/Zyy955/Miao-Yunzai-plugin)
- [Yunzai-Bot 相关内容索引](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-indexn)
- [Xrk-plugin](https://gitee.com/xrk114514/xrk-plugin)