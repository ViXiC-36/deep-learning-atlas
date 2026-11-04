export type LearningMode = 'quick' | 'deep' | 'implementation';

export type Section = {
  id: string;
  title: string;
  paragraphs: string[];
  formula?: string;
  code?: string;
  bullets?: string[];
};

export type Chapter = {
  id: 'backprop' | 'convolution' | 'attention' | 'ctc';
  title: string;
  english: string;
  module: number;
  minutes: number;
  summary: string;
  prerequisites: string[];
  sections: Record<LearningMode, Section[]>;
  misconceptions: string[];
  references: { title: string; author: string; url: string; reason: string }[];
};

export const chapters: Chapter[] = [
  {
    id: 'backprop',
    title: '反向传播：让误差找到每个参数',
    english: 'Backpropagation',
    module: 1,
    minutes: 5,
    summary: '把一个复杂导数拆成局部导数，沿计算图反向传递；分支汇合时，把所有路径的贡献相加。',
    prerequisites: ['函数与导数', '矩阵乘法', '链式法则'],
    sections: {
      quick: [
        {
          id: 'idea',
          title: '先回答一个小问题：哪个旋钮该调多少？',
          paragraphs: [
            '神经网络可以看成一串带参数的运算。输入经过乘法、加法和非线性函数得到预测，损失函数再给出一个标量：这次预测有多差。训练需要知道，每个参数稍微增大，损失会增大还是减小，变化有多快。这个量就是损失对参数的偏导数。',
            '反向传播（Backpropagation）负责高效计算这些偏导数；优化器（Optimizer）再使用它们更新参数。两者是训练循环的不同步骤。梯度是当前位置的局部信息，并不保证一次更新就到达全局最优。',
          ],
          formula: String.raw`\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t)`,
          bullets: ['θ：可训练参数；L：标量损失；η：学习率。', '前向：算预测与损失，并保留反向所需的中间值。', '反向：由损失出发，把梯度传给输入和参数。', '更新：用优化器改变参数，然后重新前向计算。'],
        },
        {
          id: 'scalar-example',
          title: '亲手算一次：一个 ReLU 神经元',
          paragraphs: [
            '取 x = 2、w = 0.5、b = −0.5，目标 y = 1。前向依次得到 z = wx + b = 0.5，a = ReLU(z) = 0.5，L = ½(a − y)² = 0.125。这里所有变量都是标量。',
            '从终点往回：∂L/∂a = a − y = −0.5。因为 z > 0，ReLU 的局部导数为 1，所以 ∂L/∂z = −0.5。再经过线性层，∂L/∂w = (∂L/∂z)x = −1，∂L/∂b = −0.5。负梯度告诉我们：稍微增大 w 或 b，会降低当前损失。',
            '用学习率 0.1 同时更新，得到 w′ = 0.6、b′ = −0.45。重新前向得到 a′ = 0.75，L′ = 0.03125。注意更新后必须重算，不能把旧的中间值继续当作新预测。',
          ],
          formula: String.raw`\frac{\partial L}{\partial w}=\underbrace{(a-y)}_{-0.5}\cdot\underbrace{\mathbf 1[z>0]}_{1}\cdot\underbrace{x}_{2}=-1`,
        },
        {
          id: 'experiment',
          title: '在实验台上观察梯度',
          paragraphs: [
            '先单步查看前向与反向，再修改输入、权重或学习率。预测更接近目标时，平方误差通常会减小；学习率过大时，即使梯度计算完全正确，也可能越过低损失区域。',
            '实验台使用 tanh，和上面的 ReLU 手算例子分别演示两种激活。通过偏置让 |z| 变大，会看到 tanh 进入饱和区，局部导数 1−a² 接近零，梯度随之减弱。实验台使用小型教学模型，它展示计算机制，不代表真实任务的训练效果。',
          ],
        },
      ],
      deep: [
        {
          id: 'graph',
          title: '计算图、局部导数与梯度汇合',
          paragraphs: [
            '把每个运算画成节点，边携带张量。对于一个中间变量 v，它可能通过多个后继节点影响损失；反向传播必须把每条出边返回的梯度相加。漏掉某个分支会得到错误的梯度。',
            '例如 L = x² + 3x。x 沿两条路径进入最终加法，贡献分别为 2x 和 3，因此 dL/dx = 2x + 3。残差连接也是同一种结构：y = x + F(x) 的导数含有一条恒等路径。',
          ],
          formula: String.raw`\frac{\partial L}{\partial v}=\sum_{u\in\operatorname{children}(v)}\frac{\partial L}{\partial u}\frac{\partial u}{\partial v},\qquad \frac{\partial (x+F(x))}{\partial x}=I+J_F(x)`,
        },
        {
          id: 'matrix',
          title: '从一个神经元推广到一个 batch',
          paragraphs: [
            '采用行向量样本约定：X 的形状为 B × D，权重 W 为 D × H，偏置 b 为 H，Z = XW + b 为 B × H。偏置沿 batch 维广播。若上游梯度 G = ∂L/∂Z 的形状是 B × H，下面三个公式分别给出参数和输入的梯度。',
            '维度是最实用的校验器：XᵀG 为 D × H，和 W 相同；GWᵀ 为 B × D，和 X 相同；对 batch 求和得到 H，和 b 相同。如果损失对 batch 取平均，1/B 已经包含在上游梯度里，不应再重复除一次。',
          ],
          formula: String.raw`Z=XW+\mathbf 1_Bb^\top,\quad \frac{\partial L}{\partial W}=X^\top G,\quad \frac{\partial L}{\partial X}=GW^\top,\quad \frac{\partial L}{\partial b}=\sum_{i=1}^{B}G_{i,:}`,
        },
        {
          id: 'reverse-mode',
          title: '为什么反向模式适合神经网络？',
          paragraphs: [
            '设 f 将数百万个参数映射到一个标量损失。逐个扰动参数的有限差分法，每个参数都需要额外前向计算；反向模式自动微分则复用一次前向留下的中间结果，以向量–Jacobian 乘积逐层回传，一次反向便能得到所有参数的梯度。',
            '这里不必显式构造巨大的完整 Jacobian。对于 y = f(x)，给定上游向量 g，局部反向规则直接计算 J_f(x)ᵀg。代价通常与前向处于同一数量级，但需要存储或重算激活，因此速度与显存存在取舍。',
          ],
          formula: String.raw`\nabla_x L=J_f(x)^\top\nabla_y L,\qquad J_f\in\mathbb R^{m\times n},\quad \nabla_yL\in\mathbb R^m`,
        },
        {
          id: 'nonlinear',
          title: '激活、梯度消失与不可导点',
          paragraphs: [
            '深层网络反向时会连续相乘多个局部 Jacobian。若相关方向上的缩放长期小于 1，梯度会衰减；长期大于 1，则可能放大。不能只靠“层数多”判断问题，还要看初始化、激活、归一化和网络结构。',
            'Sigmoid 的导数最大为 1/4，在饱和区更接近零。ReLU 在正半轴导数为 1、负半轴为 0；在 0 处数学上不可导，PyTorch 采用导数 0 的约定。一个样本上的零梯度，并不自动意味着整个神经元永远失效。',
          ],
          formula: String.raw`\sigma'(z)=\sigma(z)(1-\sigma(z)),\qquad \operatorname{ReLU}'(z)=\begin{cases}1&z>0\\0&z<0\end{cases}`,
        },
        {
          id: 'gradient-check',
          title: '用有限差分检查，而不是替代反向传播',
          paragraphs: [
            '在小模型上，可以用中心差分近似某个参数的导数，并与解析梯度对比。ε 过大会产生截断误差，过小会受到浮点舍入影响。检查时使用 float64，关闭随机性，并避开 ReLU 的拐点。',
            '若梯度计算正确，训练仍然可能失败：数据或标签错误、损失定义不合适、学习率过大、梯度累积忘记清零，都不属于链式法则本身的问题。',
          ],
          formula: String.raw`\frac{\partial L}{\partial\theta_i}\approx\frac{L(\theta+\varepsilon e_i)-L(\theta-\varepsilon e_i)}{2\varepsilon}`,
        },
      ],
      implementation: [
        {
          id: 'autograd-code',
          title: '用 PyTorch 复现上面的每一个数',
          paragraphs: [
            '下面的完整 CPU 示例不需要数据集。requires_grad=True 让叶子张量参与梯度记录；backward() 从标量损失出发回传；参数更新放在 no_grad() 中，因为更新动作本身不属于下一次前向的计算图。',
            'PyTorch 会把梯度累加到 .grad，因此每一轮要清零。对同一张已经释放的计算图重复 backward() 与对新一次前向的损失 backward() 是两回事。',
          ],
          code: `import torch

x = torch.tensor(2.0, dtype=torch.float64)
y = torch.tensor(1.0, dtype=torch.float64)
w = torch.tensor(0.5, dtype=torch.float64, requires_grad=True)
b = torch.tensor(-0.5, dtype=torch.float64, requires_grad=True)

prediction = torch.relu(w * x + b)
loss = 0.5 * (prediction - y).square()
loss.backward()

assert torch.allclose(loss, torch.tensor(0.125, dtype=torch.float64))
assert w.grad.item() == -1.0
assert b.grad.item() == -0.5

with torch.no_grad():
    w -= 0.1 * w.grad
    b -= 0.1 * b.grad
w.grad = None
b.grad = None

new_loss = 0.5 * (torch.relu(w * x + b) - y).square()
assert abs(new_loss.item() - 0.03125) < 1e-12
print(w.item(), b.item(), new_loss.item())`,
        },
        {
          id: 'batch-code',
          title: '核对矩阵梯度与 PyTorch 的存储约定',
          paragraphs: [
            '这一段直接按数学公式定义 W，因此 W 的形状为 D × H。nn.Linear(D, H) 则把 weight 存为 H × D，实际计算 x @ weight.T + bias；不要把两种约定混写。',
          ],
          code: `import torch

torch.manual_seed(7)
B, D, H = 3, 2, 4
X = torch.randn(B, D, dtype=torch.float64, requires_grad=True)
W = torch.randn(D, H, dtype=torch.float64, requires_grad=True)
b = torch.randn(H, dtype=torch.float64, requires_grad=True)
Z = X @ W + b
L = Z.square().sum() / 2
L.backward()

G = Z.detach()
assert torch.allclose(W.grad, X.detach().T @ G)
assert torch.allclose(X.grad, G @ W.detach().T)
assert torch.allclose(b.grad, G.sum(dim=0))
print(X.grad.shape, W.grad.shape, b.grad.shape)`,
        },
        {
          id: 'practice',
          title: '自己做两个小实验',
          paragraphs: ['先预测结果，再运行代码。能解释一个失败例子，比只看到 loss 下降更有帮助。'],
          bullets: ['把第一个例子的 b 改成 −2，观察 PyTorch 在 ReLU(0) 处采用的导数。', '保留第一次 .grad，不清零，再执行一次新的前向与反向，观察累积行为。', '给 y = x + x² 写出手工导数，使用 float64 和 autograd 验证。'],
        },
      ],
    },
    misconceptions: [
      '反向传播不等于梯度下降：前者求导，后者更新参数。',
      '梯度不是参数的重要性排名；参数尺度、重参数化和当前样本都会影响它。',
      '残差连接提供恒等梯度路径，但不保证任何深度、任何设置都能稳定训练。',
      '自动微分按照实际执行的运算求导；标签错误或 detach() 用错不会自动被发现。',
    ],
    references: [
      { title: 'A Gentle Introduction to torch.autograd', author: 'PyTorch', url: 'https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html', reason: '核对梯度记录、反向传播和 no_grad 的实际行为。' },
      { title: 'Learning representations by back-propagating errors', author: 'Rumelhart, Hinton & Williams · 1986', url: 'https://www.nature.com/articles/323533a0', reason: '经典神经网络反向传播论文；并非自动微分全部历史的起点。' },
      { title: 'CS231n: Backpropagation, Intuitions', author: 'Stanford CS231n', url: 'https://cs231n.github.io/optimization-2/', reason: '通过计算图练习局部梯度、链式法则和分支相加。' },
      { title: 'Neural Networks', author: '3Blue1Brown / Grant Sanderson', url: 'https://www.3blue1brown.com/topics/neural-networks', reason: '用动态图形补充参数、损失和梯度的几何直觉。' },
    ],
  },
  {
    id: 'convolution',
    title: '卷积：用同一把尺子扫描局部模式',
    english: 'Convolution & CNN',
    module: 2,
    minutes: 5,
    summary: '让一个小型可学习模板滑过输入：局部连接控制感受范围，权重共享让相同模式可以在不同位置被检测。',
    prerequisites: ['矩阵与张量形状', '乘加运算', '反向传播'],
    sections: {
      quick: [
        {
          id: 'idea',
          title: '一个窗口，一次乘加',
          paragraphs: [
            '对一张图像做全连接运算，通常需要给每个位置单独设置参数。卷积层假设：局部模式很有用，而且检测某个模式的规则可以在空间上复用。于是我们使用一个小卷积核（Kernel），在每个位置与输入窗口逐元素相乘，再求和。',
            '深度学习框架通常把互相关（Cross-correlation）称为卷积：核直接滑动，不做数学卷积里的翻转。本章和实验台均采用这种框架约定。',
          ],
          formula: String.raw`Y_{i,j}=\sum_{u=0}^{K_h-1}\sum_{v=0}^{K_w-1}W_{u,v}X_{i+u,j+v}+b`,
        },
        {
          id: 'worked-example',
          title: '从一个 3 × 3 输入算出 2 × 2 输出',
          paragraphs: [
            '输入 X 的三行为 [1, 2, 0]、[0, 1, 3]、[2, 1, 0]；核 W 的两行为 [1, 0]、[0, −1]。设步幅为 1、无填充、偏置为 0。左上窗口得到 1×1 + 2×0 + 0×0 + 1×(−1) = 0。',
            '将窗口向右移动一格，结果为 2−3 = −1；第二行的两个结果分别为 0−1 = −1 和 1−0 = 1。因此输出是 [[0, −1], [−1, 1]]。这一核比较窗口左上角和右下角，数值正负保留了局部差异的方向。',
          ],
          formula: String.raw`\begin{bmatrix}1&2&0\\0&1&3\\2&1&0\end{bmatrix}\star\begin{bmatrix}1&0\\0&-1\end{bmatrix}=\begin{bmatrix}0&-1\\-1&1\end{bmatrix}`,
        },
        {
          id: 'experiment',
          title: '改变核，也改变你看见的特征',
          paragraphs: [
            '在实验台修改输入和卷积核，选择一个输出格，查看它对应的滑动窗口和乘加项。尝试所有系数都为 1 的核，再尝试正负相间的核：前者累积局部总量，后者对某些变化更敏感。平均模糊还需要除以核元素个数。',
            '真实 CNN 通常不由人手写核，而是通过反向传播学习。多个输出通道对应多组核；网络把这些特征继续组合。早期层常呈现局部视觉模式，但不能给每一个通道都强行赋予清晰的人类语义。',
          ],
        },
      ],
      deep: [
        {
          id: 'shapes',
          title: 'Stride、Padding、Dilation 如何决定输出？',
          paragraphs: [
            'Stride（步幅）S 决定相邻窗口起点相隔几格；Padding（填充）P 在输入边缘补值；Dilation（空洞率）D 决定核采样点之间的间隔。一个 K 大小的核，其有效覆盖范围是 D(K−1)+1。',
            '例如输入宽 7，核宽 3，D = 2，S = 2，P = 1：有效核宽为 5，输出宽为 floor((7+2−5)/2)+1 = 3。高和宽分别使用同一公式。这里的 P 表示每一侧的对称填充。',
          ],
          formula: String.raw`H_{\rm out}=\left\lfloor\frac{H+2P_h-D_h(K_h-1)-1}{S_h}+1\right\rfloor,\qquad W_{\rm out}=\left\lfloor\frac{W+2P_w-D_w(K_w-1)-1}{S_w}+1\right\rfloor`,
        },
        {
          id: 'channels',
          title: '通道不是另一个滑动方向',
          paragraphs: [
            '标准二维卷积输入为 B × Cᵢₙ × H × W，权重为 Cₒᵤₜ × Cᵢₙ × Kₕ × K𝑤，输出为 B × Cₒᵤₜ × Hₒᵤₜ × Wₒᵤₜ。每个输出通道都有一组跨所有输入通道的核，先在每个输入通道做局部乘加，再把结果相加。',
            '当输入为 RGB 时，一个 3 × 3 的输出通道需要 3×3×3 个权重，而不是只有 9 个。设置 16 个输出通道并使用偏置，总参数量为 16×(3×3×3+1) = 448；图像变大不会改变这个参数量。',
          ],
          formula: String.raw`Y_{b,o,i,j}=b_o+\sum_{c=1}^{C_{\rm in}}\sum_{u,v}W_{o,c,u,v}X_{b,c,iS_h+uD_h-P_h,jS_w+vD_w-P_w}`,
        },
        {
          id: 'equivariance',
          title: '局部性、权重共享与平移等变性',
          paragraphs: [
            '局部连接限制一次计算能看到的区域；权重共享使同一检测规则用于各个位置。对于无限信号上的步幅 1 卷积，移动输入会对应地移动输出，这叫平移等变（Translation equivariance）。它不同于平移不变：不变要求输出完全不变。',
            '有限图像的边界填充会影响严格等变性；步幅大于 1 的下采样也通常不对任意一像素位移保持等变。池化与全局平均可以降低某些位置变化对结果的影响，但不能笼统宣称“CNN 天生完全平移不变”。',
          ],
          formula: String.raw`f(T_\Delta X)=T_\Delta f(X)\quad\text{(equivariance)},\qquad f(T_\Delta X)=f(X)\quad\text{(invariance)}`,
        },
        {
          id: 'receptive-field',
          title: '堆叠卷积如何扩大感受野？',
          paragraphs: [
            '感受野（Receptive field）指某个输出位置理论上可能受输入哪些位置影响。设第 l 层输出相邻点在原输入上的距离为 jₗ，感受野宽为 rₗ；初始 j₀ = r₀ = 1。下面的递推适用于沿一条顺序路径的卷积或池化层。',
            '连续三个 3×3、stride = 1、dilation = 1 的卷积，理论感受野依次为 3、5、7。理论范围表示“能够影响”，不等于每个输入位置实际上有同等影响。带分支的网络要分别追踪路径。',
          ],
          formula: String.raw`j_l=j_{l-1}S_l,\qquad r_l=r_{l-1}+(K_l-1)D_lj_{l-1}`,
        },
        {
          id: 'cnn-family',
          title: '从卷积层到 CNN，以及与 ViT 的区别',
          paragraphs: [
            '一个简单 CNN 交替执行卷积、非线性和适度下采样，再用汇聚或分类头输出预测。只有线性卷积的串联仍然是线性映射；非线性使网络可以组合更复杂的模式。ResNet 增加残差路径，U-Net 使用编码器与解码器之间的跳跃连接，这些结构解决的困难并不相同。',
            'Depthwise convolution 为每个输入通道独立做空间卷积，随后可用 1×1 pointwise convolution 混合通道。ViT 则把图像切成 patch，再进行 token 间交互；两者的局部性与权重共享方式不同，不能脱离数据、训练和计算预算直接排名。',
          ],
          bullets: ['标准卷积（无偏置）参数量：Cᵢₙ Cₒᵤₜ K²。', 'Depthwise + pointwise（无偏置）参数量：Cᵢₙ K² + Cᵢₙ Cₒᵤₜ。', 'Pooling 是局部汇聚操作，通常没有可学习的卷积核参数。', '本章完成卷积机制；ResNet、U-Net、ViT 的独立模型详情仍在后续计划中。'],
        },
      ],
      implementation: [
        {
          id: 'conv-code',
          title: '把手算矩阵直接交给 conv2d',
          paragraphs: ['F.conv2d 要求输入使用 NCHW 形状，权重使用 OIHW 形状。本例分别补上 batch、输入通道和输出通道维度，复现速通中的互相关结果。'],
          code: `import torch
import torch.nn.functional as F

X = torch.tensor([[1., 2., 0.],
                  [0., 1., 3.],
                  [2., 1., 0.]])[None, None, :, :]
W = torch.tensor([[1., 0.],
                  [0., -1.]])[None, None, :, :]

Y = F.conv2d(X, W, stride=1, padding=0)
expected = torch.tensor([[0., -1.], [-1., 1.]])
assert Y.shape == (1, 1, 2, 2)
assert torch.equal(Y[0, 0], expected)
print(Y[0, 0])`,
        },
        {
          id: 'conv-training',
          title: '多通道卷积与可学习参数',
          paragraphs: [
            '构造 3→16 通道的卷积层，观察形状和参数量。反向传播会同时对核权重及偏置求导。示例损失仅用于演示 API；它不是一个有意义的视觉任务训练目标。',
          ],
          code: `import torch
from torch import nn

torch.manual_seed(7)
layer = nn.Conv2d(3, 16, kernel_size=3, padding=1, bias=True)
X = torch.randn(2, 3, 32, 32)
Y = layer(X)

assert Y.shape == (2, 16, 32, 32)
assert layer.weight.shape == (16, 3, 3, 3)
assert sum(p.numel() for p in layer.parameters()) == 448

loss = Y.square().mean()
loss.backward()
assert layer.weight.grad.shape == layer.weight.shape
print(Y.shape, layer.weight.grad.norm().item())`,
        },
        {
          id: 'practice',
          title: '从输出尺寸反推设计',
          paragraphs: ['尝试用公式先预测形状，再用代码验证。不要仅凭“same”或“stride 2”猜测大小。'],
          bullets: ['将 7×7 输入、3×3 核、dilation=2、stride=2、padding=1 代入 F.conv2d，应得到 3×3 输出。', '把手算示例的核旋转 180°，比较结果，理解卷积与互相关约定的差异。', '固定 3→16 通道和 3×3 核，把输入从 32×32 改为 64×64，确认参数量不变但计算量增加。'],
        },
      ],
    },
    misconceptions: [
      '框架中的 Conv2d 通常计算互相关，不翻转卷积核。',
      '输出通道数是可配置的特征数，与 RGB 的三个输入通道不必相同。',
      '感受野覆盖某个区域，不表示模型均匀使用了这个区域。',
      '权重共享降低参数数量，但特征图越大，计算量和激活显存仍会增加。',
    ],
    references: [
      { title: 'Conv2d', author: 'PyTorch', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html', reason: '核对互相关约定、NCHW/OIHW 形状、groups 和输出尺寸公式。' },
      { title: 'Convolutional Neural Networks', author: 'Stanford CS231n', url: 'https://cs231n.github.io/convolutional-networks/', reason: '从局部连接与参数共享进一步理解卷积网络。' },
      { title: 'Gradient-Based Learning Applied to Document Recognition', author: 'LeCun, Bottou, Bengio & Haffner · 1998', url: 'https://proceedingsoftheieee.ieee.org/gradient-based-learning-applied-to-document-recognition/', reason: '阅读 LeNet 与文档识别系统的经典设计；此处链接到出版方介绍页。' },
      { title: 'Computing Receptive Fields of Convolutional Neural Networks', author: 'Araujo, Norris & Sim · Distill', url: 'https://distill.pub/2019/computing-receptive-fields/', reason: '进一步学习多路径网络的感受野计算与可视化。' },
    ],
  },
  {
    id: 'attention',
    title: 'Attention 到 Transformer：按内容交换信息',
    english: 'Attention & Transformer',
    module: 3,
    minutes: 5,
    summary: '每个位置用 Query 寻找相关 Key，再按归一化权重混合 Value；Transformer 把这种信息交换与逐位置非线性变换反复组合。',
    prerequisites: ['矩阵乘法', 'Softmax', '反向传播'],
    sections: {
      quick: [
        {
          id: 'idea',
          title: '一个 token 如何从其他 token 收集信息？',
          paragraphs: [
            '给每个 token 一个向量。当前 token 产生 Query（查询），候选位置产生 Key（键）和 Value（值）。Query 与各个 Key 的点积形成分数，Softmax 把分数变成总和为 1 的非负权重，最后对 Value 加权求和。',
            'Q 和 K 决定“从哪里取多少信息”，V 承载被混合的内容。它们通常来自可学习的线性投影，而不是预先写好的语言规则。Self-attention 的 Q、K、V 来自同一序列；Cross-attention 的 Q 与 K/V 来自不同序列。',
          ],
          formula: String.raw`Q=XW_Q,\quad K=XW_K,\quad V=XW_V,\qquad \operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V`,
          bullets: ['Softmax 沿每个 query 对应的 key 维度计算。', 'dₖ 是每个 head 的 Key/Query 维度，不是序列长度。', '掩码 M：允许位置为 0，禁止位置为 −∞。', '输出行数由 Query 数决定，输出最后一维由 Value 维度决定。'],
        },
        {
          id: 'two-token',
          title: '两行矩阵就能算一次 Attention',
          paragraphs: [
            '为了隔离计算机制，令 Q = K = [[1,0],[0,1]]，V = [[1,2],[3,0]]，不加掩码。QKᵀ 是单位矩阵，除以 √2 后，第一行分数是 [0.7071,0]。Softmax 得到约 [0.6698,0.3302]。',
            '第一行输出为 0.6698×[1,2] + 0.3302×[3,0] ≈ [1.6605,1.3395]。这就是对内容向量的混合。若加 causal mask，第一位置只能看自己，权重变成 [1,0]，输出就是 [1,2]。',
            '实验台的短句通过确定性教学向量进行同类计算。这些向量没有经过语言模型预训练，因此热力图呈现数学机制，不能解释为模型已经理解句子的真实语义。',
          ],
          formula: String.raw`A\approx\begin{bmatrix}0.6698&0.3302\\0.3302&0.6698\end{bmatrix},\qquad AV\approx\begin{bmatrix}1.6605&1.3395\\2.3395&0.6605\end{bmatrix}`,
        },
        {
          id: 'transformer-overview',
          title: 'Transformer 不只有 Attention',
          paragraphs: [
            '一个 Transformer block 通常包含多头注意力（Multi-head attention）、前馈网络（FFN）、归一化和残差连接。Attention 在 token 之间交换信息；FFN 对每个位置分别进行非线性特征变换，并在各位置共享参数。',
            'Encoder-only 模型常用双向上下文；Decoder-only 模型通过因果掩码进行下一 token 预测；Encoder–Decoder 模型把输入编码结果通过 Cross-attention 交给解码器。BERT、GPT、原始翻译 Transformer 的可见上下文和训练目标不同。',
            '在架构探索器中逐层查看 Embedding、Attention head、Q/K/V、FFN 和输出头。首先跟踪 shape 是否对得上，再讨论各组件的功能。',
          ],
        },
      ],
      deep: [
        {
          id: 'tensor-shapes',
          title: '追踪每一步的张量维度',
          paragraphs: [
            '用 B 表示 batch，T 表示序列长度，D 表示模型维度，h 表示 head 数，dₖ = dᵥ = D/h。输入 X 为 B × T × D，三个投影首先得到同样大小的张量，再拆成 B × h × T × dₖ。QKᵀ 的最后两维进行矩阵乘法，得到 B × h × T × T。',
            '权重乘以 V 后为 B × h × T × dᵥ；把所有 head 沿特征维拼接回 B × T × D，经过输出投影 Wₒ，维度仍然为 B × T × D，因此能够与残差输入相加。',
            'Cross-attention 则可具有不同长度：Q 为 B × h × Tq × dₖ，K 为 B × h × Tk × dₖ，分数为 B × h × Tq × Tk。不能假定所有注意力矩阵都是方阵。',
          ],
          formula: String.raw`\operatorname{MHA}(X)=\operatorname{Concat}(H_1,\ldots,H_h)W_O,\qquad H_i=\operatorname{Attention}(XW_Q^{(i)},XW_K^{(i)},XW_V^{(i)})`,
        },
        {
          id: 'scale-mask',
          title: '缩放与掩码改变的是 Softmax 之前的分数',
          paragraphs: [
            '若 Query 和 Key 各分量近似独立、均值 0、方差 1，dₖ 个乘积之和的方差约为 dₖ。除以 √dₖ 可使分数量级在维度变化时更稳定，减少 Softmax 过早饱和。这是解释缩放的一个统计近似，训练后的分量不必严格满足这些假设。',
            'Causal mask 禁止当前位置读取未来 token。必须在 Softmax 之前把相应分数置为 −∞；如果在 Softmax 后直接清零而不重新归一化，行和通常不再为 1。还应避免一整行都被屏蔽，否则 Softmax 没有有效的归一化对象。',
          ],
          formula: String.raw`M_{ij}=\begin{cases}0&j\le i\\-\infty&j>i\end{cases},\qquad A_{ij}=\frac{\exp(S_{ij}+M_{ij})}{\sum_k\exp(S_{ik}+M_{ik})}`,
        },
        {
          id: 'ffn-residual',
          title: '拆开 FFN、残差与 LayerNorm',
          paragraphs: [
            '普通两层 FFN 先把 D 维扩展到 F 维，应用激活，再投影回 D 维。每个 token 独立经过同一套权重，因此它本身不在 token 之间混合信息。门控 FFN 等现代变体可以改变这一内部形式。',
            '下面展示 Pre-LN block：先归一化，再执行子层，再做残差相加。原始 2017 Transformer 使用 Post-LN，即归一化放在残差相加之后；不能把两种布局当成完全相同的公式。本章实现采用 Pre-LN，并明确使用 GELU，属于教学变体。',
          ],
          formula: String.raw`U=X+\operatorname{MHA}(\operatorname{LN}(X)),\quad Y=U+\operatorname{FFN}(\operatorname{LN}(U)),\quad \operatorname{FFN}(z)=\phi(zW_1+b_1)W_2+b_2`,
          bullets: ['固定 D=8、h=2、F=32，忽略注意力投影偏置：Q/K/V/O 共 4D² = 256 个参数。', 'FFN 含偏置时为 DF+F+FD+D = 552 个参数。', '两次 LayerNorm 都有缩放和偏移参数时，共 4D = 32 个参数。', '上面这个 block 共 840 个参数，不包括 Embedding、位置参数和语言模型输出头。'],
        },
        {
          id: 'position',
          title: '为什么还需要位置信息？',
          paragraphs: [
            '没有位置编码与其他位置相关结构时，双向 Self-attention 对 token 排列具有置换等变性：重排输入会相应地重排输出。要区分“谁先谁后”，模型需要位置信号。原始 Transformer 把正弦位置编码加到 token embedding 上。',
            'RoPE 则把与位置相关的旋转作用到 Q 和 K，影响它们的点积；它不是简单给 Value 加一个位置向量。不同位置机制对长度外推和计算形式有不同影响，本版只建立概念入口，完整 RoPE 与 ALiBi 推导安排在后续章节。',
          ],
          formula: String.raw`PE_{p,2i}=\sin\!\left(p/10000^{2i/D}\right),\qquad PE_{p,2i+1}=\cos\!\left(p/10000^{2i/D}\right)`,
        },
        {
          id: 'training-inference',
          title: '训练、生成与 KV Cache',
          paragraphs: [
            '自回归训练时，已知完整序列，可以用移位标签和因果掩码并行计算所有位置的下一 token 损失。生成时，新 token 尚未知，需要逐步采样并追加到上下文中。并行训练不等于可以同时知道所有未来 token。',
            'KV Cache 保存历史 token 在各层的 Key 和 Value，避免每生成一步都重算它们。它加速自回归推理，但会占用随上下文长度增长的显存，也不会让长上下文变成零成本。FlashAttention 则通过分块和减少高带宽显存读写计算精确注意力，核心不在于把注意力规则改成另一种近似。',
          ],
          formula: String.raw`p(x_{1:T})=\prod_{t=1}^{T}p(x_t\mid x_{<t}),\qquad L=-\sum_{t=1}^{T}\log p(x_t\mid x_{<t})`,
        },
      ],
      implementation: [
        {
          id: 'attention-code',
          title: '用 12 行核心计算复现两 token 示例',
          paragraphs: ['明确指定 Softmax 的 dim=-1，表示对 key 位置归一化。这里没有 dropout，所有值可重复计算；使用 causal mask 时，第一行应恰好只保留第一个位置。'],
          code: `import math
import torch

Q = torch.eye(2, dtype=torch.float64)
K = Q.clone()
V = torch.tensor([[1., 2.], [3., 0.]], dtype=torch.float64)

scores = Q @ K.T / math.sqrt(Q.shape[-1])
A = scores.softmax(dim=-1)
Y = A @ V
assert torch.allclose(A.sum(dim=-1), torch.ones(2, dtype=A.dtype))
assert abs(Y[0, 0].item() - 1.6604769) < 1e-6

future = torch.ones(2, 2, dtype=torch.bool).triu(diagonal=1)
A_causal = scores.masked_fill(future, float('-inf')).softmax(dim=-1)
assert torch.equal(A_causal[0], torch.tensor([1., 0.], dtype=A.dtype))
print(A)
print(Y)
print(A_causal)`,
        },
        {
          id: 'block-code',
          title: '一个可运行的 Pre-LN Transformer block',
          paragraphs: [
            '这个教学 block 使用无偏置 Q/K/V/O 投影、两个带仿射参数的 LayerNorm，以及 GELU FFN。输入约定为 B × T × D，并假定输入已经含有位置信息。它没有 tokenizer、embedding、输出词表投影或训练数据，因此并不是一个完整语言模型。',
            'reshape 与 transpose 把 head 维移动到序列维之前；还原后用 contiguous() 明确连续内存，再 reshape 拼接各个 head。参数数量与深入模式中的 840 一致。',
          ],
          code: `import math
import torch
from torch import nn

class TinyBlock(nn.Module):
    def __init__(self, d_model=8, n_heads=2, d_ff=32):
        super().__init__()
        assert d_model % n_heads == 0
        self.h = n_heads
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.out = nn.Linear(d_model, d_model, bias=False)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(nn.Linear(d_model, d_ff),
                                 nn.GELU(),
                                 nn.Linear(d_ff, d_model))

    def forward(self, x, causal=True):
        B, T, D = x.shape
        qkv = self.qkv(self.norm1(x))
        qkv = qkv.reshape(B, T, 3, self.h, D // self.h)
        q, k, v = qkv.permute(2, 0, 3, 1, 4).unbind(0)
        scores = q @ k.transpose(-2, -1) / math.sqrt(D // self.h)
        if causal:
            future = torch.ones(T, T, device=x.device,
                                dtype=torch.bool).triu(1)
            scores = scores.masked_fill(future, float('-inf'))
        weights = scores.softmax(dim=-1)
        attended = weights @ v
        attended = attended.transpose(1, 2).contiguous().reshape(B, T, D)
        x = x + self.out(attended)
        return x + self.ffn(self.norm2(x)), weights

torch.manual_seed(7)
block = TinyBlock()
x = torch.randn(2, 5, 8)
y, weights = block(x)
assert y.shape == (2, 5, 8)
assert weights.shape == (2, 2, 5, 5)
assert sum(p.numel() for p in block.parameters()) == 840
assert torch.allclose(weights.sum(-1), torch.ones(2, 2, 5))
assert torch.count_nonzero(weights.triu(1)) == 0
print(y.shape, weights.shape)`,
        },
        {
          id: 'practice',
          title: '三个检查，排除最常见的实现错误',
          paragraphs: ['热力图很好看并不代表计算正确；先检查下列不变量。'],
          bullets: ['开启因果掩码时，上三角权重应为零；每个有效 query 的权重行和应为 1。', '不加位置信息且关闭掩码时，对输入作同样置换，输出也应等变地置换。', '把未来 token 的值修改后，因果模型较早位置的输出应保持不变（关闭 dropout）。'],
        },
      ],
    },
    misconceptions: [
      'Attention 权重不是自动成立的因果解释；较大权重不等于这个 token 决定了最终答案。',
      '每个 head 不必恰好对应一种可命名的语言规律。',
      'FFN 对每个位置共享参数，但不同位置的输入不同，输出自然不同。',
      '示例 embedding 和投影是教学构造，不能当作真实预训练模型的语义分析。',
      'Transformer 是架构家族，RAG 则是结合检索与生成的系统方法。',
    ],
    references: [
      { title: 'Attention Is All You Need', author: 'Vaswani et al. · 2017', url: 'https://arxiv.org/abs/1706.03762', reason: '核对原始 Encoder–Decoder、缩放点积注意力和位置编码。' },
      { title: 'The Annotated Transformer', author: 'Harvard NLP / Rush; Huang et al.', url: 'https://nlp.seas.harvard.edu/annotated-transformer/', reason: '沿可运行代码阅读完整翻译模型，并留意实现与原论文的归一化布局差异。' },
      { title: 'The Illustrated Transformer', author: 'Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/', reason: '用逐层图解巩固 Q/K/V、多头和 Encoder–Decoder 的关系。' },
      { title: 'FlashAttention: Fast and Memory-Efficient Exact Attention', author: 'Dao et al. · 2022', url: 'https://arxiv.org/abs/2205.14135', reason: '理解精确注意力如何通过 IO 优化降低显存访问成本。' },
      { title: 'CS336: Language Modeling from Scratch', author: 'Stanford', url: 'https://cs336.stanford.edu/', reason: '继续学习 tokenizer、Transformer 训练与系统实现。' },
    ],
  },
  {
    id: 'ctc',
    title: 'CTC：没有逐帧标签，也能学习对齐',
    english: 'Connectionist Temporal Classification',
    module: 6,
    minutes: 5,
    summary: '把许多帧级路径折叠成同一段转写，将所有合法路径的概率相加，再最大化目标转写的总概率。',
    prerequisites: ['概率乘法与求和', 'Softmax', '动态规划基础'],
    sections: {
      quick: [
        {
          id: 'idea',
          title: '语音有很多帧，文字只有几个符号',
          paragraphs: [
            '一段音频经过编码器后产生 T 个时间步，但转写可能只有 U 个符号。我们知道符号顺序，却没有每一帧对应哪个符号的标签。CTC 给词表增加 blank，用一套多对一折叠规则把长度 T 的路径映射为最终文本，并在训练时对所有合法对齐求和。',
            'CTC 是训练目标与对齐建模方法，可以接在 RNN、CNN、Transformer 等编码器后面。它本身不是一种独立的编码器架构。blank 在本章记为 ∅，表示这一时间步不额外输出标签；它不等同于静音、空格或 padding。',
          ],
        },
        {
          id: 'collapse',
          title: '折叠顺序：先合并相邻重复，再删除 blank',
          paragraphs: [
            '路径 [a, a, ∅, a, b, b] 先把原路径中的相邻重复合并为 [a, ∅, a, b]，再删除 blank，得到 aab。blank 把两个 a 分隔开，因此第二个 a 被保留。',
            '如果先删除 blank 再合并，错误地得到 ab。试着在实验台把两个相同符号之间的 blank 加上或去掉，观察最终转写。路径 [a, a] 得到 a；路径 [a, ∅, a] 才能得到 aa。',
          ],
          formula: String.raw`\mathcal B(a,a,\varnothing,a,b,b)=aab,\qquad \mathcal B(a,a)=a,\qquad \mathcal B(a,\varnothing,a)=aa`,
        },
        {
          id: 'probability',
          title: '一条路径的概率，不等于转写概率',
          paragraphs: [
            '考虑两帧、词表 {∅,a}：第一帧概率为 [0.4,0.6]，第二帧为 [0.5,0.5]。折叠为 a 的路径有 [a,a]、[a,∅]、[∅,a]，概率分别为 0.3、0.3、0.2，总和为 0.8。空转写只有 [∅,∅]，概率为 0.2。',
            '所以目标 a 的 CTC loss 是 −ln(0.8) ≈ 0.2231，而不是 −ln(0.3)。训练同时奖励所有能产生目标的路径，不需要人工选定唯一的逐帧标签。',
          ],
          formula: String.raw`p(y\mid x)=\sum_{\pi:\mathcal B(\pi)=y}\prod_{t=1}^{T}p_t(\pi_t\mid x),\qquad L_{\rm CTC}=-\log p(y\mid x)`,
        },
      ],
      deep: [
        {
          id: 'assumptions',
          title: 'CTC 的假设与适用边界',
          paragraphs: [
            'CTC 将给定完整输入 x 时的路径概率分解为各帧标签概率的乘积，这是输出路径的条件独立假设。它不意味着编码器每一帧只能看到局部音频：双向编码器可以利用整段输入。',
            '对齐必须保持标签顺序，无法让后出现的目标标签先被输出。这适合许多语音和手写识别任务，但不适合直接建模需要大幅重排的任意输入输出关系。相邻重复标签需要至少一个 blank 分隔，因此只满足 T ≥ U 还不一定存在合法路径。',
          ],
          formula: String.raw`T\ge U+\sum_{u=2}^{U}\mathbf 1[y_u=y_{u-1}]`,
          bullets: ['例：目标 aa 长度 U=2，但至少需要 T=3。', '下采样太强会让可用帧数小于最短合法路径长度。', '编码器的 contextual representation 与 CTC 路径分解是假设的不同层面。'],
        },
        {
          id: 'dynamic-programming',
          title: '用动态规划避免枚举所有路径',
          paragraphs: [
            '若词表含 C 个符号，直接枚举长度 T 的路径要考虑 Cᵀ 种可能。对非空目标 y 插入 blank 得到扩展序列 l = [∅, y₁, ∅, y₂, …, yᵤ, ∅]，长度为 2U+1。令 αₜ(s) 是到第 t 帧、停在扩展序列第 s 个状态的全部合法部分路径概率。',
            '从前一帧可以留在同一状态、前进一个状态，或在条件满足时前进两个状态。跳过中间 blank 只允许目标状态不是 blank，且与隔一个状态的标签不同；这个条件防止相邻重复标签被错误合并。下面使用从 0 开始的状态索引。',
          ],
          formula: String.raw`\alpha_t(s)=p_t(l_s)\left[\alpha_{t-1}(s)+\alpha_{t-1}(s-1)+\mathbf 1[l_s\ne\varnothing\,\land\,l_s\ne l_{s-2}]\alpha_{t-1}(s-2)\right]`,
        },
        {
          id: 'dp-boundaries',
          title: '初始化、终点和数值稳定性',
          paragraphs: [
            '第一帧只可能处于首个 blank 或首个目标标签：α₁(0)=p₁(∅)，α₁(1)=p₁(y₁)，其余状态为 0。越界状态也视为 0，两个状态的跳转项只在 s≥2 时考虑。最后可以停在最后一个标签或最后一个 blank，二者概率相加得到目标概率。空目标单独处理，其概率是所有帧 blank 概率之积。',
            '这样训练复杂度降为 O(TU)。长序列上直接连乘容易下溢，所以实际实现常在 log-space 中使用 logsumexp。教学实验台可以枚举很小的路径空间来验证直觉，但真实语音训练应使用稳定的动态规划实现。',
          ],
          formula: String.raw`p(y\mid x)=\alpha_T(2U)+\alpha_T(2U-1),\qquad \operatorname{logsumexp}(z)=m+\log\sum_i e^{z_i-m},\quad m=\max_i z_i`,
        },
        {
          id: 'decoding',
          title: '为什么逐帧贪心不一定得到最可能的文本？',
          paragraphs: [
            '贪心解码先逐帧取概率最大的符号，再折叠。这得到最高概率路径的折叠结果，却没有把属于同一个文本的其他路径相加。序列概率最大的文本可能拥有许多概率较小的路径，因此与贪心结果不同。',
            '一个具体反例：两帧、词表 [∅,a,b]，两帧概率都是 [0.40,0.35,0.25]。贪心选择 [∅,∅]，得到空文本，概率 0.16；文本 a 的总概率是 0.35²+0.35×0.40+0.40×0.35=0.4025，高于空文本。',
            'Prefix beam search 会合并产生相同文本前缀的路径，并分别跟踪以 blank 与非 blank 结尾的概率。外部语言模型可以参与解码，但会引入额外的建模与权重选择，不能把其改进都归因于 CTC 声学概率。',
          ],
          formula: String.raw`\mathcal B\!\left(\arg\max_\pi p(\pi\mid x)\right)\ne\arg\max_y\sum_{\pi:\mathcal B(\pi)=y}p(\pi\mid x)\quad\text{in general}`,
        },
        {
          id: 'comparison',
          title: '与 RNN-T、Attention 解码如何区分？',
          paragraphs: [
            'CTC 在每帧给出包含 blank 的分布，路径分数按帧相乘，输出标签的历史依赖通常不由该分解显式建模。RNN-T 增加依赖输出历史的 prediction network，并在时间步和输出步构成的二维网格上对齐。',
            'Attention-based encoder–decoder 直接建模下一个输出标签对先前标签及编码器表示的条件概率；Cross-attention 可以访问输入的多个位置，一般不强制采用 CTC 的单调折叠规则。流式能力取决于具体编码器、注意力约束与实现，而不是仅由模型名称决定。',
            '本版完整展开 CTC；RNN-T 和 Attention ASR 的独立计算实验安排在后续章节。',
          ],
        },
      ],
      implementation: [
        {
          id: 'collapse-code',
          title: '实现折叠函数，并覆盖重复字符边界',
          paragraphs: ['prev 必须记住原始路径的上一个符号，包括 blank。只记住上一个“已输出的字符”，会把 a–blank–a 错误地合并。'],
          code: `from itertools import product

def collapse(path, blank=0):
    output = []
    previous = None
    for token in path:
        if token != previous and token != blank:
            output.append(token)
        previous = token
    return tuple(output)

assert collapse([1, 1, 0, 1, 2, 2]) == (1, 1, 2)
assert collapse([1, 1]) == (1,)
assert collapse([1, 0, 1]) == (1, 1)
assert collapse([0, 0]) == ()

# 仅用于极小例子的穷举；真实训练不要枚举 C**T 条路径。
probs = [[0.4, 0.6], [0.5, 0.5]]
target_probability = 0.0
for path in product(range(2), repeat=2):
    if collapse(path) == (1,):
        target_probability += probs[0][path[0]] * probs[1][path[1]]
assert abs(target_probability - 0.8) < 1e-12
print(target_probability)`,
        },
        {
          id: 'ctc-loss-code',
          title: 'CTCLoss 接收 log-probabilities，不是 logits',
          paragraphs: [
            'PyTorch CTCLoss 的输入形状为 T × N × C，N 是 batch size，C 包含 blank。input_lengths 是每个样本有效的编码器输出帧数，不是原始波形采样点数；target_lengths 是有效标签数。目标中不应含 blank。',
            '下面用 reduction="none" 保留每个样本的原始负对数概率。默认 mean 会先按目标长度归一化再对 batch 求均值，因此比较公式与代码时必须明确 reduction。生产代码从 logits 调用 log_softmax(dim=-1)，避免先 softmax 再 log 带来的数值问题。',
          ],
          code: `import math
import torch

# T=2, N=1, C=2；词表 0=blank, 1=a。
probs = torch.tensor([[[0.4, 0.6]],
                      [[0.5, 0.5]]], dtype=torch.float64)
log_probs = probs.log().requires_grad_()
targets = torch.tensor([1], dtype=torch.long)
input_lengths = torch.tensor([2], dtype=torch.long)
target_lengths = torch.tensor([1], dtype=torch.long)

criterion = torch.nn.CTCLoss(blank=0, reduction='none',
                             zero_infinity=False)
loss = criterion(log_probs, targets, input_lengths, target_lengths)
assert loss.shape == (1,)
assert abs(loss.item() + math.log(0.8)) < 1e-10
print(loss.item())  # 0.2231435513

# 在真实模型中：log_probs = logits.log_softmax(dim=-1)
# 再执行 loss.mean().backward()。`,
        },
        {
          id: 'training-checklist',
          title: '训练前先核对这几个条件',
          paragraphs: [
            '无合法路径时，CTC loss 会是无穷大。zero_infinity=True 可以把这类 loss 及关联梯度清零，但它不会修复错误的长度或标签；若大量样本被置零，模型可能根本没有收到有效训练信号。',
          ],
          bullets: ['检查 blank 的索引与模型输出词表一致，并确认 targets 不含 blank。', '检查下采样后的有效 input_lengths，而不是 padding 后统一最大长度。', '检查重复标签导致的最小帧数要求，特别是短音频与强下采样组合。', '先用两帧穷举例子验证 loss，再扩大到真实数据。', '评估时同时报告转写指标；训练 loss 下降不保证每个样本的 greedy WER 都下降。'],
        },
      ],
    },
    misconceptions: [
      'blank 不等于静音，也不是应该写入目标序列的空格。',
      '必须先合并原路径里的相邻重复，再删除 blank。',
      'CTC loss 对所有合法路径求和，不只使用 greedy path。',
      'T ≥ U 是必要但不总充分的条件：相邻重复标签需要额外时间步。',
      'CTC 的输出条件独立假设不等于编码器各帧没有上下文。',
    ],
    references: [
      { title: 'Connectionist Temporal Classification', author: 'Graves, Fernández, Gomez & Schmidhuber · ICML 2006', url: 'https://www.cs.toronto.edu/~graves/icml_2006.pdf', reason: '原始定义、路径折叠、前向后向算法与序列训练目标。' },
      { title: 'CTCLoss', author: 'PyTorch', url: 'https://docs.pytorch.org/docs/stable/generated/torch.nn.CTCLoss.html', reason: '核对输入形状、长度、blank、reduction 与 zero_infinity 的语义。' },
      { title: 'Sequence Modeling with CTC', author: 'Awni Hannun · Distill', url: 'https://distill.pub/2017/ctc/', reason: '通过交互式对齐图进一步理解动态规划与解码。' },
      { title: 'Sequence Transduction with Recurrent Neural Networks', author: 'Alex Graves · 2012', url: 'https://arxiv.org/abs/1211.3711', reason: '从原始 RNN-T 论文理解显式输出历史与二维对齐。' },
      { title: 'CS224S: Spoken Language Processing', author: 'Stanford', url: 'https://web.stanford.edu/class/cs224s/', reason: '把 CTC 放回语音处理、识别与语言建模的课程结构中。' },
    ],
  },
];

export const chapterById = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter])) as Record<Chapter['id'], Chapter>;
