# 项目区

这里用来记录具体项目的需求、任务、决策和 agent 开发流程。

## 项目清单

| 项目 | 用途 | 状态 |
| --- | --- | --- |
| [360 环评](360-review/README.md) | 用 agent 辅助开发 360 度评价系统 | 流程搭建中 |
| [动态发光粒子球](electric-particle-orb/README.md) | AI 状态动效，中心发射粒子、液态焦散、外环吸收 | 实验中 |
| [光栅噪点 / 极光页面](glowing-particle-orb/README.md) | NeuroRix 风格 hero，Canvas 极光、grain 噪点、玻璃 UI | 实验中 |
| [3D 云 MVP](3d-cloud-mvp/README.md) | Three.js 文字云团，Shader 柔云和 hover dissolve | MVP |

## 视觉实验分组

这三个视觉实验各自独立维护：

- `electric-particle-orb/`：动态发光粒子球，不和页面 hero 或 3D 云混在一起。
- `glowing-particle-orb/`：光栅噪点/极光页面实验。
- `3d-cloud-mvp/`：Three.js 3D 云实验，包含本地 Three.js vendor 文件，体积会明显大一些。
