# 鸢尾花插件：无云崽环境维护指南

> 适用于不再运行云崽、但仍希望维护插件的作者与贡献者。
> 当前主线为 Gitee 的 `1.2.2`（2025-03-05，提交 `c4be7b2`）；GitHub `master` 已同步到同一提交。更早的 0.5.x 只作为历史版本参考。

## 日常维护（只需要浏览器）

1. 以 Gitee `master`（或 GitHub 已同步的 `master`）为基线，创建 `fix/xxx` 分支；不要用旧 ZIP 或旧补丁整体覆盖 `master`。
2. 在 GitHub 网页按 `.` 进入 github.dev 在线编辑器，修改代码、测试或文档，然后提交到分支；也可以在 Gitee 网页直接编辑。
3. 发起 Pull Request。`.github/workflows/check.yml` 会自动运行 Node 20/22/24 的源码语法检查、JSON 校验及独立单元测试（仅 GitHub 的 Actions 可用）。
4. 查看 PR 中的 Actions 结果；只有全部通过且修改经过审查后再合并。
5. 涉及机器人消息、渲染、定时任务、协议、网络 API 的变更，必须邀请实际使用云崽的志愿者做集成测试。
6. 合并后更新 `CHANGELOG.md`，并在 GitHub 与 Gitee 同步版本与发布说明。

## 本维护包添加了什么

- `.github/workflows/check.yml`：自动化检查，仓库每次 push、PR 或手动触发。
- `scripts/check-source.mjs`：对 JavaScript 做语法检查、对 JSON 做解析检查；无需云崽和第三方依赖。
- `tests/personality.test.mjs`：回归测试 `utils/getdate.js` 的 `getPersonality()`，覆盖 Issue #7 的人格配置污染问题。
- `tests/saved-images.test.mjs`、`tests/emoji-thief.test.mjs`：表情包保存与表情包小偷的纯逻辑回归测试。
- `utils/saved-images.mjs`、`utils/emoji-thief.mjs`：不依赖云崽的工具函数；`saveImage()` 返回已写入的文件名（含编号与扩展名），调用方无需再扫描目录。

## 本地或 Codespaces 可选命令

```bash
node scripts/check-source.mjs
node --test tests/*.test.mjs
```

无需 `npm install`，也不需要启动云崽。GitHub Actions 会自动运行这些命令。

## 已知限制

- **静态检查不是运行测试**：不能保证云崽 API、QQ 适配器、锅巴配置、puppeteer 截图、Cron 或第三方服务在实际环境正常。
- **仓库没有 package.json**：依赖由云崽宿主环境提供，不能把它当独立 Node 应用启动。
- 单元测试使用 Node VM 抽取 `getPersonality()`、`EmojiThief` 的源码片段，函数声明位置或导入语句变更时需同步更新测试。
- 默认只检查 JS 语法和 JSON 格式，不检查 YAML 语法、ESLint 风格或真实依赖可解析性。
- 本地 git 直连 GitHub 可能被重置；可配置 `http.proxy` 或使用 Gitee 镜像。

## Issue / PR 建议流程

1. 分类：崩溃、安全、数据损坏、兼容性、功能建议、文档。
2. 要求复现者提供云崽版本、Node 版本、日志（删除 Token、QQ 号和 API Key）、触发步骤、预期/实际行为。
3. 每次只解决一个问题，附测试和变更说明，尽量避免大规模重构。
4. 优先处理崩溃/隐私/配置丢失，再处理兼容性和用户体验。
5. 发布时标记“已静态检查”和“已真实环境验证”的区别。

## 安全建议

- 不要在 Issue、日志或仓库中上传 `config/*.yaml` 真实配置、API Key、机器人 Cookie 或 QQ Token。
- 自动更新命令里存在 `git reset --hard`，可能丢弃使用者的本地修改；涉及更新流程的改动要单独审查并向用户说明风险。

## 本次分支：表情包可靠性优化（基于 1.2.2）

本次变更涉及 `apps/SavePic.js`、`apps/EmojiThief.js`、`utils/getdate.js`、`utils/saved-images.mjs`、`utils/emoji-thief.mjs` 和 `tests/` 下新增的回归测试。

**提交建议**：新建 `fix/emoji-reliability` 分支；先运行 `node scripts/check-source.mjs` 和 `node --test tests/*.test.mjs`，再通过 PR 合并。不要用旧源码压缩包直接覆盖远程 `master`，请逐文件检查差异。

**兼容性提醒**：保存图片现在仅接受 HTTP(S) URL，响应须为 `image/jpeg`、`image/png`、`image/gif`、`image/webp` 或 `image/bmp`，每张默认最多 20 MiB，网络空闲超时 15 秒。原先把任意 `Content-Type` 当作文件扩展名的行为不再支持。引用图片在不同 QQ 适配器中的字段可能不同，请在真实环境中验证。

**表情包小偷配置**：`defSet/EmojiThief.yaml` 里的键名一直是 `DefalutReplyRate` / `DefalutEmojiRate`（拼写为 Defalut），而 1.2.2 的代码读取的是 `DefaultReplyRate` / `DefaultEmojiRate`，导致概率始终是 `undefined`、功能实际不会发送。本分支改为优先读新拼写、回退旧拼写，兼容已有用户配置。

**建议人工验收**：

1. 直接发送 1 张和多张图片，执行“保存表情包”，确认文件编号不重复。
2. 引用群消息或私聊图片执行“保存表情包”，确认可以正确读取图片。
3. 执行“查看表情包”“查看表情包1”“删除表情包1”，确认列表、预览、删除正确。
4. 测试 404、超时、无效图片地址时只提示失败、不留下损坏文件。
5. 向启用表情包小偷的群连续发送多张表情包，检查 Redis 列表是否完整且不超过 50 张。
6. 测试不同群配置、黑名单和缓存命中时的发送行为。

> 自动化单元测试验证的是代码逻辑和本地 HTTP 模拟服务，不代表云崽端到端验证通过。`EmojiThief` 仍使用 Redis 读-改-写：**跨消息并发**仍可能发生竞争，后续可在确认云崽 Redis 客户端 API 后采用原子操作。
