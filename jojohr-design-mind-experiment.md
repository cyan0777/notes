---
name: "JOJOHR 360 环评"
version: "experiment-2026-06-27"
purpose: "一份实验性的 DESIGN.md 风格设计心智文档，供 coding agent 在修改界面前阅读。本文件不属于 JOJOHR 项目源码。"
sourceProject: "/Users/jojo/Documents/JOJOHR"
designIntent:
  productType: "企业 HR 运营工具"
  audience:
    - "HR 管理员：需要发起、跟进、重开、结束和导出 360 环评项目"
    - "填写人员：需要低成本完成自评和他评"
  personality:
    - "安静"
    - "克制"
    - "可信"
    - "偏运营"
    - "压力下也清楚"
  avoid:
    - "营销页式构图"
    - "装饰性卡片堆叠"
    - "工作流里出现过大的 hero 区"
    - "强烈渐变或装饰性视觉效果"
    - "厚重阴影"
tokens:
  color:
    ink: "#0B1220"
    navy: "#07111F"
    navy2: "#0D1B2E"
    muted: "#526175"
    subtle: "#E8EEF8"
    line: "#CBD7E6"
    paper: "#FFFFFF"
    paper2: "#F7FAFF"
    appBg: "#EEF3F9"
    contentBg: "rgba(255, 255, 255, 0.78)"
    accent: "#2F80ED"
    blue: "#2F80ED"
    orange: "#B7791F"
    red: "#D14343"
    green: "#0F766E"
  darkColor:
    ink: "#EDF4FF"
    muted: "#98A8BD"
    paper: "#101827"
    paper2: "#162235"
    appBg: "#07111F"
    accent: "#7AB7FF"
    orange: "#F2B25F"
    red: "#FF7777"
    green: "#5FD2C2"
  typography:
    ui:
      fontFamily: '"Space Grotesk", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif'
      letterSpacing: "0"
    number:
      fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace'
    body:
      fontSize: "14px"
      lineHeight: "1.55"
    small:
      fontSize: "12px"
      lineHeight: "1.55"
    pageTitle:
      fontSize: "28px"
      lineHeight: "1.2"
      fontWeight: "800"
    sectionTitle:
      fontSize: "19px"
      lineHeight: "1.3"
      fontWeight: "800"
  radius:
    xs: "6px"
    sm: "8px"
    md: "8px"
    pill: "999px"
  border:
    default: "1px solid {tokens.color.line}"
    subtle: "1px solid {tokens.color.subtle}"
    active: "1px solid rgba(47, 128, 237, 0.48)"
  shadow:
    default: "0 18px 48px rgba(10, 26, 46, 0.11)"
    elevated: "0 18px 54px rgba(47, 128, 237, 0.10)"
    dark: "0 22px 64px rgba(0, 0, 0, 0.38)"
  spacing:
    xxs: "4px"
    xs: "6px"
    sm: "8px"
    md: "12px"
    lg: "16px"
    xl: "18px"
    xxl: "24px"
  motion:
    panelEnter:
      duration: "560ms"
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    progress:
      duration: "900ms"
      easing: "ease"
    hover:
      transform: "translateY(-2px) scale(1.006)"
      duration: "180ms"
  components:
    buttonPrimary:
      description: "主按钮，用于下一步、提交、开始评价等关键动作"
      minHeight: "38px"
      radius: "{tokens.radius.sm}"
      background: "linear-gradient(135deg, {tokens.color.blue}, {tokens.color.navy2})"
      textColor: "#FFFFFF"
      fontWeight: "800"
      paddingInline: "12px"
      iconGap: "8px"
    buttonGhost:
      description: "次要按钮，用于返回、取消、查看、辅助操作"
      minHeight: "38px"
      radius: "{tokens.radius.sm}"
      background: "{tokens.color.paper}"
      textColor: "{tokens.color.ink}"
      border: "{tokens.border.default}"
      fontWeight: "800"
      paddingInline: "12px"
    card:
      description: "普通卡片，用于重复项目、指标、人员行和报告块"
      radius: "{tokens.radius.sm}"
      border: "{tokens.border.default}"
      background: "{tokens.color.paper}"
      padding: "18px"
      shadow: "默认不用阴影"
    taskCard:
      description: "任务卡片，用于环评任务、填写入口、人员任务"
      radius: "{tokens.radius.sm}"
      border: "{tokens.border.subtle}"
      background: "{tokens.color.paper2}"
      padding: "12px"
      gap: "10px"
    input:
      description: "表单输入控件"
      minHeight: "38px"
      radius: "{tokens.radius.sm}"
      border: "{tokens.border.default}"
      background: "{tokens.color.paper}"
      padding: "8px 10px"
    statusChip:
      description: "状态标签，用于当前、完成、待处理、风险等状态"
      minHeight: "25px"
      radius: "{tokens.radius.pill}"
      padding: "4px 8px"
      fontSize: "12px"
      fontWeight: "800"
    modal:
      description: "弹窗，用于新建、确认、阻断式决策"
      radius: "{tokens.radius.sm}"
      border: "{tokens.border.default}"
      background: "{tokens.color.paper}"
      shadow: "{tokens.shadow.default}"
      backdrop: "rgba(7, 17, 31, 0.42)"
    sidebar:
      description: "外层侧边导航"
      width: "288px"
      background: "{tokens.color.appBg}"
    adminWorkbenchSidebar:
      description: "管理员工作台内侧导航"
      width: "220px"
      background: "{tokens.color.paper2}"
    topbar:
      description: "顶部栏，轻玻璃感，滚动后增强分隔"
      minHeight: "74px"
      background: "color-mix(in srgb, {tokens.color.contentBg} 92%, transparent)"
      backdropFilter: "blur(14px)"
assets:
  logo: "assets/app-logo.png"
  icons: "lucide-react"
  completeIllustration: "assets/evaluation-complete-placeholder.svg"
  avatars:
    size: "UI 中约 34px-40px，源素材为 124x124 PNG"
    treatment: "8px 圆角，柔和浅蓝或 pastel 底色，细线条插画感"
---

# JOJOHR 设计心智

JOJOHR 应该像一张安静的 HR 运营工作台：精确、有耐心、容易扫读。它不是为了让访客眼前一亮，而是帮助真实的 HR 和员工把敏感的评价工作清楚、稳妥地完成。

这份设计心智是一个受 `google-labs-code/design.md` 启发的实验稿。它把 JOJOHR 现有的视觉语言整理成 coding agent 在改界面前可以阅读的格式。经过人工确认之前，不应把它当成当前项目文件的替代品。

## 北极星

界面应该让“环评工作处在可控状态”这件事变得明显。管理员要知道哪些项目已经开始、哪里卡住、哪些任务可以重开、哪些报告可以导出。填写人员要知道自己需要完成什么、现在填到哪里、输入是否已经保存。

因此，视觉系统应该优先服务这些目标：

- 信息密度中高，但不杂乱
- 用边框、间距和分组建立结构，而不是靠装饰
- 颜色克制，但能清楚承载工作流状态
- 控件紧凑，标签和图标明确
- 响应式布局在移动端也能保持工作面可用

## 品牌气质

JOJOHR 是一个带有柔和 HR 气质的企业工具。它可以使用友好的头像素材和温和的蓝色表面，但核心体验必须保持工作导向。整体语气应该是冷静、帮得上忙、流程清楚。

好的 JOJOHR 页面应该像：

- 干净的内部运营工作台
- 谨慎设计过的评价表单
- 为 HR 审阅准备的结构化报告
- 轻量但可靠的企业工具

不好的 JOJOHR 页面会像：

- SaaS 营销落地页
- 设计公司作品集
- 到处漂浮卡片的装饰性仪表盘
- 隐藏关键状态和进度的表单
- 用刺眼红色制造压力的告警系统

## 布局原则

使用浅层、可预测的结构。

- 应用背景使用浅蓝灰。
- 主要工作内容放在统一的内容表面里。
- 管理员工作流在合适场景中使用固定导航和独立滚动内容区。
- 重复项目可以使用卡片；页面章节不应继续堆成一层层嵌套卡片。
- 移动端可以折叠为单列，但控件能力不能缩水。
- 表格、任务卡、上传区域、抽屉和确认弹窗应通过统一的 8px 圆角和蓝灰边框保持视觉关系。

填写人员页面要减少外框干扰。用户应该尽快进入问卷首页或当前题目作答区。避免全局营销式标题、过大的问候区和额外说明面板。

## 色彩语义

颜色承担功能，而不是装饰。

- 蓝色：主操作、选中态、当前导航、当前进度。
- 绿色：已完成、已提交、安全的正向状态。
- 橙色：待处理、部分完成、提醒、草稿或重试状态。
- 红色：风险、失败、链接失效、破坏性操作。
- 灰蓝色：次要信息、辅助说明、未激活状态。
- 白色和近白色：内容表面。

除非出现新的明确语义类别，不要增加新的主导色。也不要把产品做成一整片蓝色；蓝色应该负责引导注意力，而不是淹没页面。

## 字体

使用 `Space Grotesk` 提供 UI 质感，后接中文系统字体以保证中文渲染稳定。分数、数量、编号、指标值可以使用 `JetBrains Mono` 或系统等宽字体。

字体层级保持紧凑：

- 页面或工作台标题约 28px。
- 分区标题约 19px。
- 任务卡和密集面板中的说明信息约 12px-14px。
- 不要在运营页面里使用 hero 级大字。

文案应该直接、低摩擦。优先使用动作明确的中文标签，例如“开始评价”“返回检查”“确认提交”“重新上传”“预览”。

## 组件

### 按钮

主按钮用于下一步关键动作。它使用蓝到深蓝的渐变、白色文字、8px 圆角和紧凑高度。次要按钮使用白色表面、蓝灰边框和深色文字。

按钮在表达导航、重试、上传、导出、提交、回首页、关闭、刷新等动作时，通常应带 `lucide-react` 图标。只有图标的按钮必须有可访问标签。

除非流程确实需要触控优先的大按钮，否则不要使用过大的胶囊 CTA。

### 卡片

卡片用于重复任务、指标、人员行、上传框和报告块。默认使用 8px 圆角、1px 边框、少阴影或无阴影、紧凑内边距。

避免卡片套卡片。如果页面已经有统一内容表面，内部优先使用分隔线、表格、列表或扁平分区。

### 状态标签

状态标签应该小、粗、语义明确。使用低透明背景和同色边框，不使用高饱和实心色块。它们要帮助快速扫读，而不是大声喊叫。

建议状态映射：

- `tone-blue`：当前、激活、选中
- `tone-green`：完成、已提交、已生成
- `tone-orange`：待处理、草稿、需要注意
- `tone-red`：失败、过期、阻断、破坏性

### 表单

输入控件使用 38px 最小高度、8px 圆角、蓝灰边框、白色背景和简洁标签。错误文案使用红色，小而直接。上传框使用虚线边框和近白背景。

日期时间选择器应该像轻量企业浮层：先选日期，再选小时和分钟；过去日期和时间置灰禁用；底部操作清楚。

### 弹窗和抽屉

弹窗用于聚焦的新建、确认和阻断式决策。抽屉用于任务详情、预览和审阅上下文。弹窗或抽屉打开时，底层页面必须锁定交互。

遮罩使用适度透明的深蓝，不做夸张模糊。对话框继续保持 8px 圆角，以及和其他组件一致的边框与阴影语言。

### 问卷作答工作区

填写人员流程要围绕“完成任务”组织：

- 从任务首页开始，而不是直接进入一长串原始题目。
- 他评任务按关系分组。
- 使用“一题评价多人”的行结构，减少重复阅读。
- 当前题目位置和完成进度要分开表达。
- 底部题目或维度索引固定、紧凑、可扫读。
- 上一题、下一题或提交动作在桌面端和移动端都要可预测。
- 自动保存是后台服务，不应变成用户任务。

已提交任务不应暴露直接编辑入口。重开和修改应该是管理员控制的流程。

### 报告

报告应该像 HR 可以直接审阅的文档：结构清楚、克制、可信。使用指标、关系对比、脱敏开放反馈和风险提示，注意留白但不要变成杂志式排版。

长文本需要有呼吸感，但报告不应过度编辑化或装饰化。

## 动效

动效用于确认状态变化，不用于表演。

- 页面和面板入场：约 560ms，柔和 ease-out。
- 进度条：约 900ms，从空到目标值。
- Hover：轻微上移或边框变化。
- Toast：约 180ms 的短促进入。
- 遵守 `prefers-reduced-motion`。

核心工作页面避免弹跳、游戏感或高度装饰性的动画。

## 可访问性和可用性

每个图标按钮都需要可访问标签。焦点态应该有清楚的蓝色描边。禁用按钮要明显不可用，但仍然可读。紧凑卡片和按钮中的文字不能溢出；较长中文标签应根据上下文换行或省略。

移动端要注意：

- 避免横向页面滚动。
- 动作区使用两列或全宽按钮，保证可点击。
- textarea 输入时不要被固定底部导航挡住。
- 顶部或底部吸附元素不能遮挡任务内容。

## Agent 使用说明

修改 JOJOHR UI 之前，先阅读这份设计心智，再改样式或组件。

应该做：

- 保留现有蓝灰色企业工作台气质。
- 复用 `lucide-react` 图标。
- 优先使用 8px 圆角和 1px 边框。
- 让颜色承担明确语义。
- 保持高信息密度但方便扫读的布局。
- 先让表单和表格实用，再追求视觉表现。
- 修改核心流程时同时检查桌面端和移动端状态。

不应该做：

- 在应用工作流中加入营销页式 hero 区。
- 加装饰性渐变光斑、大插图或纯氛围背景。
- 引入无关的新色彩体系。
- 用过大的卡片替代紧凑工作面。
- 把同一个工作流中的每个模块都做得彼此割裂。
- 把关键工作流状态藏在 hover 之后。

## 实验备注

本文件刻意放在 `/Users/jojo/Documents/Codex/2026-06-17/git-git/notes`，不放进 `/Users/jojo/Documents/JOJOHR`，所以不会改变原项目。

如果这个实验有效，下一步可以把它和现有 `JOJOHR/DESIGN.md` 对照，人工合并最有用的部分，或者在项目根目录创建一个专门给 agent 看的 `DESIGN.agent.md`。
