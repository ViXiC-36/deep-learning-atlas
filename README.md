# Deep Learning Atlas

**An Interactive Visual Guide to Deep Learning**

以简体中文为主的深度学习可视化知识手册。用「速通 → 深入 → 实现」三个阅读层次，把数学定义、张量形状、PyTorch 示例和可操作图形放在一起。面向具有编程、线性代数、概率与微积分基础的读者。

这是独立的开源教育项目；课程结构参考 Stanford CS229、CS230、CS231n、CS224N、CS336、CS25、CS224S，不是 Stanford 官方课程。资料考察、设计借鉴和数学校验依据见 [docs/sources.md](docs/sources.md)。

## 当前版本：Phase 1

完整课程目录覆盖 8 个模块，已编写的四章提供三种阅读层次、公式、例子、PyTorch 代码、常见误解及延伸阅读。其余主题明确标为规划中。

| 已实现内容 | 可以做什么 |
| --- | --- |
| 反向传播 Backpropagation | 修改教学网络参数，观察前向值、局部导数和反向梯度 |
| 卷积 Convolution | 编辑矩阵与卷积核，调整滑动参数，查看逐项乘加和输出 |
| Attention & Transformer | 输入短句，观察确定性教学 embedding、Q/K/V、score、mask、softmax 和输出 |
| CTC | 编辑帧概率与候选路径，理解 blank、连续重复合并、路径折叠与序列概率 |
| Architecture Explorer | 展开真实计算的微型 Transformer：多头注意力、Q/K/V、FFN、残差、归一化和词表输出 |
| 学习界面 | 首页、响应式阅读器、深浅主题、站内搜索、阅读进度、最近学习、课程目录 |
| 知识地图与架构入口 | 主题筛选、简洁/完整视图、类型化关系、可学习与规划内容的状态区分 |

交互计算在浏览器内完成，不调用模型 API。Transformer Explorer 使用单层 Pre-LN、`T=4`、`d_model=8`、`heads=2`、`d_ff=16`、`vocab=12` 的确定性模型，共 788 个参数。权重未经训练，热图和输出分布用于理解计算，不能视为真实语言能力。

## 本次交付验证状态

完整源码已提交到 [ViXiC-36/deep-learning-atlas](https://github.com/ViXiC-36/deep-learning-atlas)。GitHub Actions 已通过依赖安装、18 项单元测试、TypeScript 检查、Vite 生产构建和 8 项 Chromium 浏览器测试（含 390px 手机与 768px 平板）。[成功的验证运行](https://github.com/ViXiC-36/deep-learning-atlas/actions/runs/41781690268)。Pages API 当前返回 404，部署尚未执行；请先在 Settings → Pages 中选择 GitHub Actions。详细验证记录见 [docs/validation.md](docs/validation.md)。

## 本地运行

推荐 **Node.js 24** 与随附 npm。解压源码（或克隆已创建的仓库），再进入项目根目录：

```bash
npm install
npm run dev
```

打开终端显示的本地地址（通常是 `http://127.0.0.1:5173`）。请通过 HTTP 服务打开，不能直接双击 `index.html`。

```bash
npm test
npm run build
npm run preview
```

- `npm test`：执行计算核心测试，包括梯度、卷积、注意力和 CTC 的数学不变量与边界案例。
- `npm run build`：TypeScript 检查并生成 `dist/` 静态网站。
- `npm run preview`：本地检查生产构建。

云端安装生成的 `package-lock.json` 已保存在成功运行的 `validation-evidence` artifact 中，尚未回写源码；可下载并提交该文件固定依赖。首次本地运行 `npm install` 也会生成锁文件。工作流在有锁文件时使用 `npm ci`，否则使用 `npm install`。

## GitHub Pages 部署

工作流：[.github/workflows/deploy.yml](.github/workflows/deploy.yml)。它按顺序安装依赖（有锁文件时 `npm ci`，否则 `npm install`）、执行 `npm test` 和 `npm run build`，然后上传 `dist/` 并部署。Pull request 仅验证，推送 `main` 或在 `main` 手动运行才部署。

1. 将项目放到 GitHub 仓库 `deep-learning-atlas` 的根目录，默认分支设为 `main`。开源项目可使用公开仓库。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 在 **Actions** 中确保允许运行本仓库使用的官方 `actions/*` 工作流。如果 `github-pages` environment 配置了审批或分支限制，按仓库既有规则完成设置。
4. 将源码及锁文件推送至 `main`，或在 **Actions → Deploy Deep Learning Atlas → Run workflow** 选择 `main`。
5. 等待 `build` 和 `deploy` 两个 job 成功。以 deployment 输出或 Settings → Pages 显示的 URL 为准。

项目站点的通常地址格式为 `https://<owner>.github.io/deep-learning-atlas/`。这只是地址格式，存在部署配置不代表已发布成功。

Vite 使用 `base: './'`；导航使用 hash 路由。资源路径可适配仓库子路径，刷新章节链接时服务器仍请求同一个 `index.html`，无需服务器端 URL 重写或自定义 404 跳转。部署其他静态主机时直接托管 `dist/` 内容即可。

不需要个人访问令牌、数据库、API key 或常驻服务器。工作流使用 GitHub 自动提供的 `GITHUB_TOKEN` 和部署所需 OIDC；部署 job 仅授予 `pages: write`、`id-token: write`。

官方依据（核验于 2026-11-04）：[Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[checkout](https://github.com/actions/checkout)、[setup-node](https://github.com/actions/setup-node)、[configure-pages](https://github.com/actions/configure-pages)、[upload-pages-artifact](https://github.com/actions/upload-pages-artifact)、[deploy-pages](https://github.com/actions/deploy-pages)。

## 项目结构与内容维护

| 路径 | 职责 |
| --- | --- |
| `src/App.tsx` | 页面、hash 路由、搜索和阅读体验 |
| `src/content/chapters.ts` | 四章教学内容、阅读层次、公式、代码与引用 |
| `src/data/curriculum.ts` | 8 个模块、主题、架构关系与完成状态 |
| `src/components/` | Knowledge Graph、Architecture Explorer 等可复用组件 |
| `src/playgrounds/` | 反向传播、卷积、Attention 与 CTC 交互 |
| `src/lib/math.ts` | 可独立测试的数值计算 |
| `src/styles/` | 全局主题和响应式样式 |
| `public/` | 直接复制到构建输出的静态资源 |
| `tests/` | 计算逻辑测试 |
| `docs/sources.md` | 来源核验、许可边界、课程映射与验收基准 |
| `.github/workflows/deploy.yml` | CI 与 GitHub Pages 发布 |

技术栈为 React、TypeScript、Vite、KaTeX、highlight.js 与原生 SVG/CSS。首版采用类型化内容数据，未引入 MDX、D3、React Flow 或状态管理库；后续可在不修改计算核心的情况下迁移内容格式。

新增完整章节时，提供 `quick`、`deep`、`implementation` 三套内容、先修、误解与来源；补上路由和交互后再把课程配置标为 `ready`。只建立目录或给出概述的主题保持 `planned`。图谱的 `prerequisite`、`extends`、`alternative`、`used-in` 是不同关系，不把所有连接画成历史继承链。

## 本地数据、离线与限制

- 主题和学习状态保存在当前浏览器的 `localStorage`，不上传到后台，不在设备间同步；清理站点数据或使用无痕模式会影响保存。
- 核心图形与公式不依赖运行时 CDN；页面加载后交互可在断网状态继续使用。本版本没有 Service Worker，不保证断网后重新打开网站。需要稳定离线使用时下载源码并在本地启动服务。
- 原始论文、外部课程和推荐演示需要联网；这些资源遵循各自的可用性与访问限制。
- 浏览器不执行页面展示的 PyTorch 代码；复制到具有 PyTorch 的 Python 环境运行。代码示例和前端交互均为教学规模，不进行大型模型训练或预训练模型推断。
- 本项目不作模型性能排名，不臆测未公开模型内部结构。Transformer 的教学配置与原论文的完整 Encoder–Decoder 架构在正文中区分。
- 当前内容是 Phase 1，不是全部 8 个模块的完结课程。完整二维分类训练、优化器轨迹比较和 Diffusion Playground 尚待开发。

## 后续路线

1. **Phase 2**：补全优化器、归一化、RNN/LSTM/GRU、ResNet、BERT/GPT/ViT 详情，扩展二维分类训练与优化器演示。
2. **Phase 3**：加入 Diffusion/Flow Matching、MoE、SSM/Mamba、模型训练与推理优化、RLHF 等专题；明确区分示意模拟和真实模型。
3. **Phase 4**：逐章数学审校、可运行代码检查、读屏与键盘体验、移动设备验证、性能与学习路径优化。

## 许可证与致谢

本仓库的原创代码、原创文字与原创图形使用 [MIT License](LICENSE)。第三方依赖、所链接的课程、论文、图表和网站保留各自许可证，不因链接而改用 MIT。本站不包含参考网站的整篇文章、完整图表或视频素材；详见 [资料与许可记录](docs/sources.md)。

感谢 Stanford 相关课程、Distill、3Blue1Brown、Jay Alammar、Lilian Weng、Brendan Bycroft、Dive into Deep Learning、Harvard NLP、TensorFlow Playground 与 PyTorch 对开放学习资源的贡献。
