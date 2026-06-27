# 3D Cloud MVP

Three.js 3D 云文字实验。它把输入文字采样成云状点阵，并用 Shader 做柔软云团、深度和 hover dissolve 效果。

## 当前状态

- 使用本地 `vendor/three.module.js`，所以目录体积比另外两个 Canvas 实验大。
- 控制项包括密度、云朵大小、缩放、深度、对比度、柔软度、hover cut 和光照。
- 与 2D 粒子和光栅噪点项目分开维护。

## 文件

- `index.html`：3D 云 Demo 页面。
- `style.css`：全屏 3D 画布和控制面板样式。
- `app.js`：Three.js 场景、文字采样和 Shader 动画。
- `vendor/three.module.js`：本地 Three.js 依赖。

## 预览

在本目录启动静态服务后打开 `index.html`。
