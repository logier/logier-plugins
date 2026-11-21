# ADR-0001：仓库与分发基线

- 状态：已采纳（2026-11-21）
- 相关：README「更新与兼容」、MAINTAINING.md

## 背景

同一插件同时发布在 Gitee 与 GitHub。2024 年两条线分叉：GitHub 停在 0.5.10（205 个提交），Gitee 已到 1.2.2（466 个提交），两个仓库的 master 内容完全不同。用户与机器人主要从 Gitee 拉取，GitHub 仅作展示与备份。

## 决策

1. Gitee 是唯一主线，GitHub 是镜像；两边 `master` 必须始终指向同一提交。
2. 新功能与修复先落在分支，通过 `scripts/check-source.mjs` 与 `node --test tests/*.test.mjs` 后再合入 master。
3. 每次发布同时推送两个远端，并用 `git ls-remote` 核对两个 master 的 SHA。
4. 不向 GitHub 单独提交，避免再次分叉。

## 后果

- 发布步骤多一步双远端校验；换取历史不会再分叉。
- 旧分支（如 `dev-sp`）如无用途应删除，避免误合。
- 镜像同步失败（代理、TLS）必须重试并确认，不能只推一边。
