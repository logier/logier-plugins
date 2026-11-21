# ADR-0003：远程 API 与资源本地化

- 状态：已采纳（2026-11-21）
- 相关：defSet/API.yaml、apps/PushMoyu.js、apps/Tarot.js、apps/Weather.js、resources/

## 背景

插件历史上依赖多个第三方接口与图床：`api.vvhan.com`、`moyu.atxrom.com`、`dd.atxrom.com`、`api.03c3.cn`、`api.bgm.tv`、Gitee raw 链接等。2026-11 审计发现其中多个域名 DNS 失效或返回 502，Gitee/GitHub raw 在国内也常被限速。插件包内已有 37MB 本地资源（表情包图库、字体、塔罗图）。

## 决策

1. 静态资源优先随仓库分发，运行时用 `file://` 本地路径；HTML 模板内联关键 CSS（天气图标），不再引用远端样式表。
2. 默认配置里不写不可用的第三方地址；保留的第三方 API 放到 `defSet/API.yaml` 由用户可选配置，失败时给出可见提示。
3. 核心功能（塔罗、表情包、签到图、天气图标）必须有本地兜底；摸鱼日历/日报类功能在没有可用图源时明确回复失败，不静默。
4. 单文件超过约 2MB 的资源不入 git，改放 release 或对象存储并在文档写明下载方式；图片压缩为 webp。

## 后果

- 仓库体积增大，克隆变慢；换取离线可用与不再受第三方域名生死影响。
- 接口审计需要定期重跑（记录在 MAINTAINING.md），失效项从默认值移除。
- 用户自定义 API 仍可覆盖默认值，但文档需说明格式与失败表现。
