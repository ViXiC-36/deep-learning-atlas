# 资料考察与内容校验

核验日期：2026-11-04。以下链接均进行了实际访问。本站是独立编写的中文学习手册，不是 Stanford 官方课程，也不复制课程作业答案。正文、SVG 图形、交互逻辑采用原创实现；外部文章和演示通过链接引导阅读。

## 课程结构依据

| 官方课程 | 实际查看的内容 | 在 Atlas 中的用途 |
| --- | --- | --- |
| [CS229 · Machine Learning](https://cs229.stanford.edu/) | Summer 2026 首页：监督学习、无监督学习、学习理论与先修要求；部分课件需 Stanford 登录 | Module 0 的概率、线性代数、损失函数和泛化背景；不声称已读取受限材料 |
| [CS230 · Deep Learning](https://cs230.stanford.edu/syllabus/) | Fall 2026 课程表：神经网络、优化、CNN、序列模型与 Transformer | Module 1 的训练基础，按概念先修重新编排 |
| [CS231n · Deep Learning for Computer Vision](https://cs231n.stanford.edu/schedule.html) | Spring 2026：优化、反向传播、CNN、经典视觉架构、RNN、Attention | Module 2 的卷积与视觉模型；将局部计算与整体网络分开讲解 |
| [CS224N · NLP with Deep Learning](https://web.stanford.edu/class/cs224n/) | Winter 2026：词向量、张量导数、语言模型、Transformer、预训练、后训练、PEFT | Module 3 的 Attention 主线及 Module 5 的语言模型扩展 |
| [CS336 · Language Modeling from Scratch](https://cs336.stanford.edu/) | Spring 2026：分词、资源核算、架构、MoE、并行、推理、数据、评测和后训练 | 将公式、张量形状、计算资源与最小实现连起来；工程内容独立于架构百科 |
| [CS25 · Transformers United](https://web.stanford.edu/class/cs25/) | V6 研讨课的课程说明和讲座目录 | 前沿延伸阅读入口；不作为初学者线性先修主干 |
| [CS224S · Spoken Language Processing](https://web.stanford.edu/class/cs224s/) | 当前页面为 Spring 2025：音频分析、语音工具、神经 ASR、语音基础模型微调 | Module 6 从声学输入走向对齐与解码；首次访问 502，重试成功 |

组织原则：数学与计算图 → 可微模型与优化 → 视觉/序列的归纳偏置 → Attention → 模型架构与任务 → 训练、推理与研究。`prerequisite` 表示学习先修，`extends` 表示机制扩展，`alternative` 表示可替代设计，`used-in` 表示使用关系；关联边不等同于历史继承或性能排名。RAG 归为系统方法。

## 视觉教学与公开实现

| 资源与作者 | 考察结果与采用的方法 | 版权/复用边界 |
| --- | --- | --- |
| [Distill](https://distill.pub/)；[Feature Visualization](https://distill.pub/2017/feature-visualization/)，Chris Olah、Alexander Mordvintsev、Ludwig Schubert | 可读。文章将问题、图示、推导与解释邻近放置；用局部交互服务明确概念 | 该文正文与原创图为 CC BY 4.0，另有第三方图例外；本项目只链接，不复制图表 |
| [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)，Jay Alammar | 可读。由整体结构逐层拆到 Q/K/V，再展示矩阵计算；采用这一渐进阅读思路 | 页面标明 CC BY-NC-SA 4.0；本项目自行绘制示意图，不转载整篇或翻译图片 |
| [3Blue1Brown · Neural Networks](https://www.3blue1brown.com/topics/neural-networks)，Grant Sanderson | 原主题 URL 重定向首页主题过滤；另核实了 [Backpropagation 具体课程](https://www.3blue1brown.com/lessons/backpropagation/) | 参考从敏感度和局部变化理解链式法则的方法；不复制视频、插图或动画素材 |
| [Lil’Log](https://lilianweng.github.io/)；[Attention? Attention!](https://lilianweng.github.io/posts/2018-06-24-attention/)，Lilian Weng | 首页和文章可读。借鉴术语比较、符号定义、参考文献组织 | 采用外链，本站解释重新编写 |
| [LLM Visualization](https://bbycroft.net/llm)；[llm-viz 仓库](https://github.com/bbycroft/llm-viz)，Brendan Bycroft | 站点文本抓取只返回标题，无法据此确认其 3D 交互运行；仓库 README 可读，说明了小型 GPT 风格模型和网络探索 | 仓库主体 MIT；个人首页和第三方资源有例外。本站实现轻量 2D 层级探索，不拷贝其渲染器或资源 |
| [Dive into Deep Learning](https://d2l.ai/)，Aston Zhang、Zachary C. Lipton、Mu Li、Alexander J. Smola | 可读。数学、代码和训练实践紧邻，章节先修明确 | [仓库 LICENSE](https://github.com/d2l-ai/d2l-en/blob/master/LICENSE) 标示 CC BY-SA 4.0；不将其内容整篇混入本站 |
| [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)，Harvard NLP；Sasha Rush 等 | 可读。用逐行实现把论文公式落实为张量操作；2022 版本列出更新作者 | [实现仓库](https://github.com/harvardnlp/annotated-transformer) 为 MIT；本站最小示例独立编写，旧文章环境依赖不直接照搬 |
| [TensorFlow Playground](https://playground.tensorflow.org/)，TensorFlow 团队 | 可读。控制学习率、激活函数、网络规模，同时观察训练结果 | 页面明确链接 Apache License。Phase 1 优先做四个指定章节；完整二维分类训练作为后续扩展，保留优秀演示外链 |
| [PyTorch 文档](https://pytorch.org/docs/stable/)，PyTorch contributors | stable 入口重定向至当前版本文档；检查了 Autograd、Conv2d、CTCLoss、scaled_dot_product_attention | API 正确性参考；本站示例不依赖浏览器中运行 PyTorch |
| [Papers with Code](https://paperswithcode.com/) | 访问重定向至 [Hugging Face Trending Papers](https://huggingface.co/papers/trending) | 不把旧域名描述为当前仍可用的独立任务排行榜；论文优先链接原始来源 |

## 四个首发章节的核验来源

- **Backpropagation**：[PyTorch Autograd](https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html)、[CS231n 反向传播笔记](https://cs231n.github.io/optimization-2/)、[3Blue1Brown 课程](https://www.3blue1brown.com/lessons/backpropagation/)。重点核验计算图、链式法则、梯度累加与梯度更新的区别。
- **Convolution**：[PyTorch Conv2d](https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html)、[CS231n CNN 笔记](https://cs231n.github.io/convolutional-networks/)。重点核验 cross-correlation、输出尺寸、通道汇总、步幅、填充和空洞系数。
- **Attention & Transformer**：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)，Vaswani et al. (2017)；[PyTorch scaled dot-product attention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html)；[Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)。重点核验缩放因子、softmax 轴、mask、head 拆分及输出投影。
- **CTC**：[Connectionist Temporal Classification](https://www.cs.toronto.edu/~graves/icml_2006.pdf)，Graves、Fernández、Gomez、Schmidhuber (2006)；[PyTorch CTCLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CTCLoss.html)。重点核验折叠顺序、路径边缘化和 PyTorch 输入格式。

## 数学与交互验收建议

这些是可独立计算的验收基准，不表示所有检查已经执行；实际执行结果以测试输出为准。

### 反向传播

- 对 `z = wx + b`、`a = tanh(z)`、`L = (a-y)^2 / 2`，有 `dL/dw = (a-y)(1-a²)x`、`dL/db = (a-y)(1-a²)`、`dL/dx = (a-y)(1-a²)w`。常数 `1/2` 必须与代码一致。
- 在 `x=2,w=0.3,b=-0.1,y=0.7` 等光滑点用中心差分 `ε=1e-5` 校验，绝对误差应小于 `1e-6`。ReLU 的零点不可用此方式判断唯一导数。
- 同一个变量流向多条路径，梯度相加。例如 `L=x²+x`，`x=2` 的梯度为 `5`。
- 反向传播求梯度，优化器执行参数更新；用相同旧参数的梯度同时更新权重与偏置。PyTorch `.backward()` 会累积 `.grad`，训练循环要明确清零。
- 重置应恢复参数、梯度和动画步骤；暂停时不得继续推进。学习率过大并不保证损失下降。

### 卷积

- PyTorch `Conv2d` 使用互相关，不反转卷积核。输入 `[[1,2,3],[4,5,6],[7,8,9]]`、核 `[[1,0],[0,-1]]`、无填充、步幅 1，输出为 `2×2` 的全 `-4` 矩阵。
- 每个空间轴的输出长度为 `floor((n+2p-d(k-1)-1)/s)+1`；例如 `n=5,k=3,p=1,s=2,d=1` 得 `3`。
- `groups=1` 时输出像素对全部输入通道求和；参数量含偏置为 `C_out(C_in k_h k_w + 1)`。
- 步幅为 1、忽略边界时的平移等变性不等于平移不变性；步幅、填充和边界会影响这个性质。
- 修改输入/核/步幅/填充后，滑动窗口、高亮索引、乘加展开式与完整输出同时更新；非法尺寸应显式处理。

### Attention 与 Transformer

- `Q:[T_q,d_k]`、`K:[T_k,d_k]`、`V:[T_k,d_v]`，`S=QKᵀ/√d_k:[T_q,T_k]`，沿 key 轴逐行 softmax；输出 `AV:[T_q,d_v]`。
- 用稳定 softmax：先减每行最大值。无 dropout 时每行概率和约为 1，不能用绝对值归一化替代 softmax。
- `Q=K=I₂,V=I₂` 时，输出第一行约为 `[0.6697615493,0.3302384507]`。启用 causal mask 后第一行严格为 `[1,0]`，第二行不变。
- causal mask 在 softmax 之前把未来位置设为 `-∞`；测试未来位置概率为零。不要创建全部被 mask 的行并产生 NaN。单 token 输入也应可用。
- 对常规多头注意力，`d_model` 应可被 head 数整除；拼接 head 输出后乘 `W_O`。按指定配置标注是否计入偏置。
- PyTorch SDPA 的布尔 mask 中 `True` 表示允许参与，与 `MultiheadAttention.key_padding_mask` 的语义不同；评估时显式 `dropout_p=0.0`。
- 如果 embedding 与权重为确定性的教学数值，应明确这些数值未经训练，不能将其热图解释为真实语言知识。Pre-LN 与原始 Post-LN 架构应分别标注。

### CTC

- **先合并连续重复，再删除 blank**。`[a,a,blank,a,b,b,blank] → [a,a,b]`；`[a,blank,a] → [a,a]`；全 blank → 空串。blank 是无输出符号，不直接等同于静音。
- 路径概率是各帧概率的乘积；转写概率是所有折叠到该转写的路径概率之和。最优单路径的折叠结果未必是概率最大的转写。
- 独立枚举校验：3 帧、每帧 `P(blank)=0.4,P(a)=0.6`，得到 `P(空串)=0.064`、`P(a)=0.792`、`P(aa)=0.144`，总和为 1。
- 目标长度为 `U`，含 `R` 组相邻重复标签时至少需要 `T≥U+R` 帧。例如 `aa` 至少 3 帧，不能只检查 `T≥U`。
- 动态规划状态用插 blank 后的序列；跳两格仅允许落在非 blank 且与前两格不同的符号。长序列需 log-space / log-sum-exp 避免下溢。
- PyTorch `CTCLoss` 接受 **log probability**，一般 shape 为 `[T,N,C]`，`C` 包含 blank；有效 target 不含 blank。与手工负对数概率比较时使用 `reduction='none'` 或 `'sum'`，因为默认 mean 还按目标长度归一化。
- 路径编辑不应悄悄改写帧概率；修改概率后每帧重新归一化并刷新路径分数。重置恢复两者。
