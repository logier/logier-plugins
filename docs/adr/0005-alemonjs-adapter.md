# ADR-0005：ALemonJS 适配策略

- 状态：提议（2026-11-21）
- 相关：alemonjs/、docs/alemonjs.md、README「ALemonJS 版」

## 背景

ALemonJS 2.x 是独立运行时：应用通过 `apps` 配置与 Router DSL 注册命令，运行状态存 Redis（`data:AppName:*`），资源在编译期 import。它没有 Yunzai 的 `plugin` 基类、`segment` 与 `apps/*.js` 加载器；npm 包 2.1.125 的 bin 入口还缺失。因此无法把现有 `apps/` 直接挂载进去。

## 决策

1. 在仓库内新增独立目录 `alemonjs/`，作为可单独复制/安装的 ALemonJS 应用，不复用 `apps/`。
2. 只复用与框架无关的纯函数（`utils/saved-images.mjs`、`utils/emoji-thief.mjs` 中的解析/合并/限流逻辑）与 `resources/` 本地资源。
3. 首批迁移命令限定为不依赖 QQ 富媒体渲染的核心能力：表情包保存/查看/删除、塔罗抽牌、签到/运势文本版；图片卡片类后续再做。
4. 配置默认值随应用 import，运行期覆盖存 Redis；旧 Yunzai 配置只作为一次性迁移来源，不做长期兼容层。
5. 文档明确区分「Yunzai 插件版」与「ALemonJS 应用版」，避免用户把 `apps/` 复制进 ALemonJS。

## 后果

- 两套代码需要同步修 bug；共享工具层要保持无框架依赖。
- ALemonJS 版功能是子集，帮助文本需标注覆盖范围。
- 若 ALemonJS 上游修复 bin/文档，适配成本下降；当前以源码内 `alemonjs` 依赖方式运行并记录版本。
