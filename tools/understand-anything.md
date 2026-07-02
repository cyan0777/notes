# Understand Anything

## 一句话

把代码库、知识库或文档变成一个可搜索、可点击、可提问的交互式知识图谱。

## 链接

- GitHub: https://github.com/Egonex-AI/Understand-Anything
- Demo: https://understand-anything.com

## 适合用来做什么

- 快速理解一个陌生代码库的结构。
- 看文件、函数、类、依赖之间的关系。
- 生成架构导览和新人 onboarding 说明。
- 分析当前改动会影响代码库的哪些部分。
- 把 wiki / docs 变成知识图谱来探索。

## 我为什么觉得它有意思

它不是只做“总结代码”，而是把项目拆成图谱节点和关系，再配一个 dashboard 来浏览。对大型仓库、陌生项目、长期维护的知识库会很有用。

## Codex 使用方式

官方 README 说它支持 Codex。安装命令是：

```sh
curl -fsSL https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/install.sh | bash -s codex
```

安装脚本会把仓库克隆到 `~/.understand-anything/repo`，把各个 skill 链接到 `~/.agents/skills`，并创建一个通用链接 `~/.understand-anything-plugin`。安装后需要重启 CLI / IDE。

常用命令：

```text
/understand
/understand --language zh
/understand-dashboard
/understand-chat How does the payment flow work?
/understand-diff
/understand-explain src/auth/login.ts
/understand-onboard
/understand-domain
/understand-knowledge ~/path/to/wiki
```

## 注意事项

- 第一次 `/understand` 会分析整个项目，大仓库可能消耗较多 token。
- 后续运行默认增量分析，只处理变更文件。
- 如果想生成中文图谱和 dashboard，可以用 `/understand --language zh`。
- 官方安装方式会执行第三方网络脚本，并修改本机 agent / skill 配置；执行前最好先看脚本内容。

## 试用计划

1. 先在一个小项目里安装并运行 `/understand --language zh`。
2. 打开 `/understand-dashboard` 看图谱是否有帮助。
3. 用 `/understand-chat` 问几个真实问题，判断它是否值得长期保留。

## 安装记录

- 2026-06-23：已获得明确同意后尝试运行官方 Codex 安装命令。
- 结果：两次都在 `git clone https://github.com/Egonex-AI/Understand-Anything.git` 阶段断开，错误为 `fetch-pack: unexpected disconnect while reading sideband packet`。
- 追加尝试：改用浅克隆减少下载量，Git 对象曾部分下载成功，但 checkout / restore 阶段继续卡住。已删除不完整的 `~/.understand-anything/repo`。
- 核对：没有保留 `~/.understand-anything/repo`，没有生成 `~/.agents/skills`，没有生成 `~/.understand-anything-plugin`，所以没有半成品安装。
- 2026-06-24：仓库已成功克隆到当前 notes 目录下的 `Understand-Anything/`，并已将本地 `understand-anything-plugin/skills` 中的 8 个 skill 链接到 `~/.agents/skills`。
- 已创建通用插件链接：`~/.understand-anything-plugin`。

## 状态

已安装。需要重启 Codex / CLI / IDE 后再尝试使用相关命令。

## 标签

- AI
- Codex
- codebase-understanding
- knowledge-graph
- onboarding
