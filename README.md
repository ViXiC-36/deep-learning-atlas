# Deep Learning Atlas

**An Interactive Visual Guide to Deep Learning**

以简体中文为主的深度学习可视化知识手册。用「速通 → 深入 → 实现」三个阅读层次，把数学定义、张量形状、PyTorch 示例和可操作图形放在一起。面向具有编程、线性代数、概率与微积分基础的读者。

这是独立的开源教育项目；课程结构参考 Stanford CS229、CS230、CS231n、CS224N、CS336、CS25、CS224S，不是 Stanford 官方课程。资料考察、设计借鉴和数学校验依据见 [docs/sources.md](docs/sources.md)。

## 当前版本：V0.2 全模块阅读版

课程覆盖 **8 个模块、101 个主题、66 个章节**，共 **484 个阅读小节、113 个公式块、71 段代码示例**。每章提供「速通 → 深入 → 实现」三种层次，从具体任务和数值例子开始，配合就近的符号定义、中文公式读法、流程图、自检题、常见误解与原始参考资料。相关主题可以共用一章，跨模块的架构入口也会指向对应原理章节，因此主题数与章节数不同。

| 模块 | 章节数 | 内容范围 |
| --- | ---: | --- |
| 0 · 数学与机器学习基础 | 5 | 张量、线性代数、微分、概率、信息论、学习范式与泛化 |
| 1 · 神经网络与优化 | 9 | 线性模型、MLP、激活、反向传播、优化器、调度、归一化与训练数值 |
| 2 · CNN 与视觉模型 | 7 | 卷积、感受野、经典与高效 CNN、ResNet、U-Net、ViT、检测与分割 |
| 3 · 序列模型与 Attention | 9 | RNN、LSTM、GRU、Seq2Seq、Attention、位置编码、缓存与高效注意力 |
| 4 · 主流网络架构图谱 | 11 | 生成模型、扩散、流匹配、MoE、状态空间模型、RAG 与多模态架构 |
| 5 · 生成式 AI 与大语言模型 | 10 | 分词、嵌入、预训练、微调、偏好优化、量化、采样与评估 |
| 6 · 语音与多模态深度学习 | 8 | 声学特征、CTC、Transducer、语音表示、识别、合成与对齐 |
| 7 · 研究与工程实践 | 7 | 自动微分、数据管线、训练循环、调试、评估、表示探测与复现 |

阅读器支持专注阅读、层次切换和章节导航。新增章节以图解、公式、流程和可复制代码展开；浏览器内可操作的实验目前集中在以下四个主题及 Transformer Explorer。

| 交互与学习界面 | 可以做什么 |
| --- | --- |
| 反向传播 Backpropagation | 修改教学网络参数，观察前向值、局部导数和反向梯度 |
| 卷积 Convolution | 编辑矩阵与卷积核，调整滑动参数，查看逐项乘加和输出 |
| Attention & Transformer | 输入短句，观察确定性教学 embedding、Q/K/V、score、mask、softmax 和输出 |
| CTC | 编辑帧概率与候选路径，理解 blank、连续重复合并、路径折叠与序列概率 |
| Architecture Explorer | 展开真实计算的微型 Transformer：多头注意力、Q/K/V、FFN、残差、归一化和词表输出 |
| 学习界面 | 首页、响应式阅读器、专注阅读、深浅主题、站内搜索、阅读进度、最近学习、课程目录 |
| 知识地图与架构入口 | 主题筛选、简洁/完整视图、类型化关系与对应章节跳转 |

交互计算在浏览器内完成，不调用模型 API。Transformer Explorer 使用单层 Pre-LN、`T=4`、`d_model=8`、`heads=2`、`d_ff=16`、`vocab=12` 的确定性模型，共 788 个参数。权重未经训练，热图和输出分布用于理解计算，不能视为真实语言能力。

## 验证与在线访问

源码仓库：[ViXiC-36/deep-learning-atlas](https://github.com/ViXiC-36/deep-learning-atlas)。在线地址：[Deep Learning Atlas](https://vixic-36.github.io/deep-learning-atlas/)。

V0.2 的完整验证正在进行。检查范围包括数值计算与边界案例、课程覆盖与章节结构、公式及符号的 KaTeX 渲染、每段 Python 代码的语法与独立执行、TypeScript 检查、Vite 生产构建，以及 Chromium 交互和响应式布局。具体执行结果、环境限制与发布记录见 [docs/validation.md](docs/validation.md)。

## 本地运行

推荐 **Node.js 24** 与随附 npm。解压源码（或克隆已创建的仓库），再进入项目根目录：

```bash
npm install
npm run dev
```

打开终端显示的本地地址（通常是 `http://127.0.0.1:5173`）。请通过 HTTP 服务打开，不能直接双击 `index.html`。

```bash
npm test
npm run test:examples
npm run build
npm run preview
```

- `npm test`：检查计算核心、架构计算、课程覆盖、章节结构及公式和符号渲染。
- `npm run test:examples`：调用本地 Python，逐段解析并编译教材代码，检查语法。
- `npm run test:examples -- --execute`：在独立 Python 进程中执行每段代码；需先安装示例依赖 PyTorch 与 NumPy。
- `npm run build`：TypeScript 检查并生成 `dist/` 静态网站。
- `npm run preview`：本地检查生产构建。
- `npm run test:e2e`：运行浏览器测试；首次使用需先运行 `npx playwright install chromium`。

云端安装生成的 `package-lock.json` 已保存在成功运行的 `validation-evidence-<attempt>` artifact 中，尚未回写源码；可下载并提交该文件固定依赖。首次本地运行 `npm install` 也会生成锁文件。工作流在有锁文件时使用 `npm ci`，否则使用 `npm install`。

## GitHub Pages 部署

工作流：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)。它按顺序安装依赖（有锁文件时 `npm ci`，否则 `npm install`）、执行 `npm test`、安装 CPU PyTorch 与 NumPy 并独立执行教材代码、进行 TypeScript 检查和生产构建、运行 Chromium 浏览器测试，然后上传 `dist/` 并部署。Pull request 仅验证，推送 `main` 或在 `main` 手动运行才部署。

1. 将项目放到 GitHub 仓库 `deep-learning-atlas` 的根目录，默认分支设为 `main`。开源项目可使用公开仓库。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 在 **Actions** 中确保允许运行本仓库使用的官方 `actions/*` 工作流。如果 `github-pages` environment 配置了审批或分支限制，按仓库既有规则完成设置。
4. 将源码及锁文件推送至 `main`，或在 **Actions → Deploy Deep Learning Atlas → Run workflow** 选择 `main`。
5. 等待 `build` 和 `deploy` 两个 job 成功。以 deployment 输出或 Settings → Pages 显示的 URL 为准。

本项目在线地址：[Deep Learning Atlas](https://vixic-36.github.io/deep-learning-atlas/)。Fork 后以该仓库的 deployment 输出或 Settings → Pages 显示的地址为准。

Vite 使用 `base: './'`；导航使用 hash 路由。资源路径可适配仓库子路径，刷新章节链接时服务器仍请求同一个 `index.html`，无需服务器端 URL 重写或自定义 404 跳转。部署其他静态主机时直接托管 `dist/` 内容即可。

不需要个人访问令牌、数据库、API key 或常驻服务器。工作流使用 GitHub 自动提供的 `GITHUB_TOKEN` 和部署所需 OIDC；部署 job 仅授予 `pages: write`、`id-token: write`。

官方依据（核验于 2026-11-04）：[Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[checkout](https://github.com/actions/checkout)、[setup-node](https://github.com/actions/setup-node)、[configure-pages](https://github.com/actions/configure-pages)、[upload-pages-artifact](https://github.com/actions/upload-pages-artifact)、[deploy-pages](https://github.com/actions/deploy-pages)。

## 项目结构与内容维护

| 路径 | 职责 |
| --- | --- |
| `src/App.tsx` | 页面、hash 路由、搜索和阅读体验 |
| `src/content/chapters.ts` | 汇总 66 章内容，建立章节与主题映射 |
| `src/content/*Chapters.ts` | 各模块的分层教材、数值例、公式、流程、代码与引用 |
| `src/content/types.ts` | 章节、小节、符号定义、公式读法、流程与自检的数据类型 |
| `src/data/curriculum.ts` | 8 个模块与 101 个主题的课程目录 |
| `src/components/` | Knowledge Graph、Architecture Explorer 等可复用组件 |
| `src/playgrounds/` | 反向传播、卷积、Attention 与 CTC 交互 |
| `src/lib/math.ts` | 可独立测试的数值计算 |
| `src/styles/` | 全局主题和响应式样式 |
| `public/` | 直接复制到构建输出的静态资源 |
| `tests/` | 数值、架构、内容、公式与浏览器测试 |
| `scripts/check-examples.mjs` | 教材 Python 示例的语法检查与独立执行 |
| `docs/sources.md` | 来源核验、许可边界、课程映射与验收基准 |
| `docs/writing-guide.md` | 教材写作规范、符号定义与章节验收要求 |
| `docs/validation.md` | 真实验证结果、运行环境与发布记录 |
| `.github/workflows/deploy.yml` | CI 与 GitHub Pages 发布 |

技术栈为 React、TypeScript、Vite、KaTeX、highlight.js 与原生 SVG/CSS。教材采用类型化内容数据，便于统一检查结构、公式和示例。

内容维护遵循 [教材写作规范](docs/writing-guide.md)：每章提供 `quick`、`deep`、`implementation` 三套内容、先修、误解与来源；先说明目的和具体例子，再展开公式。新符号、下标和操作符在附近定义，公式附中文读法，代码须独立可运行。通过 `topicIds` 将课程主题关联到完整章节；交互实验按教学需要另行设计。图谱的 `prerequisite`、`extends`、`alternative`、`used-in` 分别表示先修、扩展、替代方案和使用关系。

## 本地数据、离线与限制

- 主题和学习状态保存在当前浏览器的 `localStorage`，不上传到后台，不在设备间同步；清理站点数据或使用无痕模式会影响保存。
- 核心图形与公式不依赖运行时 CDN；页面加载后交互可在断网状态继续使用。本版本没有 Service Worker，不保证断网后重新打开网站。需要稳定离线使用时下载源码并在本地启动服务。
- 原始论文、外部课程和推荐演示需要联网；这些资源遵循各自的可用性与访问限制。
- 浏览器不执行页面展示的 Python / PyTorch 代码；请复制到具备相应依赖的 Python 环境运行。部分例子仅需标准库。代码示例和前端交互均为教学规模，不进行大型模型训练或预训练模型推断。
- 本项目不作模型性能排名，不臆测未公开模型内部结构。Transformer 的教学配置与原论文的完整 Encoder–Decoder 架构在正文中区分。
- 全模块阅读覆盖不代表每个主题都已有浏览器实验。完整二维分类训练、优化器轨迹比较和 Diffusion Playground 尚待开发。

## 后续路线

1. 持续审校符号定义、数学推导、示例代码与引用，并补充读者容易卡住的数值例子。
2. 为二维分类、优化器轨迹和扩散过程增加浏览器实验，明确教学模拟的假设与边界。
3. 改善读屏、键盘操作、移动设备体验、性能和跨章节学习路径。

## 许可证与致谢

本仓库的原创代码、原创文字与原创图形使用 [MIT License](LICENSE)。第三方依赖、所链接的课程、论文、图表和网站保留各自许可证，不因链接而改用 MIT。本站不包含参考网站的整篇文章、完整图表或视频素材；详见 [资料与许可记录](docs/sources.md)。

感谢 Stanford 相关课程、Distill、3Blue1Brown、Jay Alammar、Lilian Weng、Brendan Bycroft、Dive into Deep Learning、Harvard NLP、TensorFlow Playground 与 PyTorch 对开放学习资源的贡献。
