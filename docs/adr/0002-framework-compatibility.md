# ADR-0002：插件加载与跨框架兼容

- 状态：已采纳（2026-11-21）
- 相关：apps/update.js、README「云崽框架兼容性」

## 背景

云崽生态存在多个宿主：TRSS-Yunzai、Miao-Yunzai、Yunzai-Bot（yoimiya 维护版）、Yunzai-Bot（Le-niao 原版）、yunzai-bot-lite，以及独立运行时 ALemonJS。它们共享 `plugin`/`segment`/`Bot`/`redis`/`logger` 的基本形态，但目录与可选模块不同，例如 lite 不带 `plugins/other/update.js`。

## 决策

1. 插件只依赖各宿主的最小公共接口，不 import 框架私有路径。
2. 对可选模块使用动态 `import().catch(() => null)`，缺失时降级为提示（见 `apps/update.js` 的 `NO_UPDATE_PLUGIN`）。
3. 临时文件、缓存、配置统一放在插件自身目录，不写宿主根目录。
4. ALemonJS 不通过兼容层加载，另外提供独立适配应用（见 ADR-0005）；Yunzai 版与 ALemonJS 版共享纯工具函数，不共享 `apps/`。

## 后果

- 新增依赖前需在 4 个以上宿主做加载验证；CI 只覆盖语法与单元测试，框架矩阵靠手工/脚本回归。
- 缺失可选模块时功能降级但插件仍可加载，用户能看到明确提示。
- 不为兼容旧宿主保留多余分支；Le-niao 原版登录后才能加载插件属于宿主限制，不作为插件缺陷。
