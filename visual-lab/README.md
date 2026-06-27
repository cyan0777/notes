# 视觉实验室

视觉实验室是可视化与视觉工具的实验区，用来沉淀可复用的动效、Shader、Canvas、Three.js 和界面视觉原型。

## 项目目录

| 项目 | 类型 | 说明 |
| --- | --- | --- |
| `electric-particle-orb/` | Canvas 动态粒子 | AI 状态动效，中心发射、液态焦散、外环吸收、白色辉光。 |
| `glowing-particle-orb/` | Canvas 光栅噪点 | NeuroRix 风格 hero，光栅噪点、动态极光、玻璃 UI。 |
| `3d-cloud-mvp/` | Three.js 3D 云 | 文字采样成云团，Shader 柔云、深度和 hover dissolve。 |

## 维护原则

- Notes 里只放目录、方法、判断和设计记录。
- 每个视觉实验保持独立文件夹，避免提交时混在一起。
- 如果某个实验成熟为产品组件，再从实验室迁入正式项目。
