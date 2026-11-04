import type { Chapter, Section, Notation } from './types';

const S = (id: string, title: string, paragraphs: string[], extra: Partial<Section> = {}): Section => ({ id, title, paragraphs, ...extra });
const N = (symbol: string, meaning: string, shape?: string, example?: string): Notation => ({ symbol, meaning, shape, example });
const R = (title: string, author: string, url: string, reason: string) => ({ title, author, url, reason });

export const visionSequenceChapters: Chapter[] = [
{
 id:'conv-geometry',title:'卷积几何：窗口怎样覆盖一张图',english:'Stride, Padding, Dilation & Receptive Field',module:2,minutes:5,
 topicIds:['convolution-geometry','pooling-receptive-field','cnn-hierarchy'],prerequisites:['convolution'],summary:'先画出窗口经过的位置，再理解输出尺寸、池化、感受野与平移等变性的边界。',
 sections:{
 quick:[
  S('windows','先在一条长度为 7 的线上滑动',['把图像的一行看作 7 个格子。宽度为 3 的窗口从第 0 格开始，每次右移 2 格，起点依次是 0、2、4，所以得到 3 个输出。步长决定走多远，填充决定边界外能否参与计算，空洞率决定窗口内部相邻采样点相距多远。','3 个核系数配空洞率 2，会采样位置 0、2、4；覆盖宽度变成 5，但可学习系数仍然只有 3 个。二维图像在高和宽两个方向分别使用同一规则。'],{flow:[{label:'补边界',detail:'两侧各加入指定数量的填充值'},{label:'摆采样点',detail:'核宽与空洞率决定一次覆盖范围'},{label:'按步长移动',detail:'只保留完整可放置的窗口'},{label:'输出网格',detail:'每个窗口产生一个响应'}]}),
  S('pool','池化到底保留了什么',['窗口 [1, 4, 2, 3] 的最大池化输出 4，平均池化输出 2.5。最大池化保留最强响应，平均池化保留局部平均强度；它们通常没有可学习参数。','池化并不认识“猫”。它只是压缩空间；后续层利用压缩后的响应组合更大模式。下采样可以降低开销，但细小物体与精确边界也可能丢失。'],{checkpoint:{question:'3 个核系数、空洞率 2 时，是不是有 5 个可学习参数？',answer:'不是。覆盖宽度是 5，但实际采样只有 3 个位置，所以仍有 3 个核系数。'}}),
 ],
 deep:[
  S('size','输出尺寸来自“最后一个合法起点”',['仍用长度 7、核宽 3、空洞率 1、步长 2、无填充的例子：有效窗口宽度为 3，可移动距离为 4，除以步长得到 2 次移动，再加初始位置得到 3。'],{formula:String.raw`K_{\mathrm{eff}}=D(K-1)+1,\qquad O=\left\lfloor\frac{I+2P-K_{\mathrm{eff}}}{S}\right\rfloor+1`,formulaReading:'有效核宽等于空洞率乘以核宽减一，再加一；输出长度等于可用长度减去有效核宽，除以步长向下取整，再加一。',notation:[N(String.raw`I`,'输入在一个空间轴上的长度','整数','7'),N(String.raw`K`,'该轴上核系数的个数','正整数','3'),N(String.raw`D`,'空洞率，即相邻核采样点的间隔','正整数','1'),N(String.raw`P`,'该轴每侧的对称填充长度','非负整数','0'),N(String.raw`S`,'窗口移动步长','正整数','2'),N(String.raw`K_{\mathrm{eff}}`,'有效覆盖宽度；下标 eff 表示 effective'),N(String.raw`O`,'输出在同一轴上的长度'),N(String.raw`\lfloor\cdot\rfloor`,'向下取整；中间点号代表被取整的数'),N(String.raw`+,-,\times,/`,'分别表示加、减、乘、除；2P 表示 2 乘 P')]}),
  S('receptive','感受野要把前层的步长也算进去',['第一层宽 3、步长 2，其输出相邻格对应原输入相距 2；第二层再用宽 3、步长 1，会覆盖第一层的 3 格，也就是原输入宽 7。不能简单把两个 3 相加。','理论感受野记录“可能影响这里”的输入范围；有效感受野讨论实际梯度或响应集中在哪里。范围很大不表示每个远处像素都得到同样关注。'],{formula:String.raw`j_l=j_{l-1}s_l,\qquad r_l=r_{l-1}+(k_l-1)d_lj_{l-1},\qquad j_0=r_0=1`,formulaReading:'第 l 层相邻输出在原图上的间隔，等于前层间隔乘本层步长；本层感受野宽度，等于前层宽度加上新增跨度。',notation:[N(String.raw`l`,'层编号；0 表示原始输入'),N(String.raw`j_l`,'第 l 层相邻输出中心在原输入上的间隔'),N(String.raw`r_l`,'第 l 层单个输出的理论感受野宽度'),N(String.raw`s_l`,'第 l 层步长'),N(String.raw`k_l`,'第 l 层核宽'),N(String.raw`d_l`,'第 l 层空洞率'),N(String.raw`l-1`,'紧邻的前一层；所有量按同一空间轴计算'),N(String.raw`j_0,r_0`,'输入层的初始间隔与单像素覆盖宽度，均为 1'),N(String.raw`+,-`,'加法与减法；相邻符号连写表示乘法')]}),
  S('equivariance','等变、不变与特征层级',['步长 1 的共享卷积在无限网格上具有平移等变性：输入移动，输出响应随之移动。等变允许输出变化，只要求变化遵循对应规则；平移不变则要求输出不变。','有限图像的边界填充、步长大于 1 的采样相位、裁剪都会破坏任意单像素平移的严格等变性。最大池化也不保证对所有位移完全不变。','浅层容易形成局部边缘或纹理响应，深层可以组合更大模式；这是一种常见经验现象，不是“第 3 层必然表示眼睛”的固定语义字典。反例与数据分布都值得检查。']),
 ],
 implementation:[
  S('code','打印尺寸，也检查池化结果',['代码只需要 PyTorch。输入张量形状依次是批次、通道、高、宽；这里批次与通道均为 1，高为 1，宽为 7。kernel_size 的两个整数分别指定高和宽。'],{code:`import torch
import torch.nn.functional as F
x = torch.arange(7., dtype=torch.float32).reshape(1, 1, 1, 7)
kernel = torch.ones(1, 1, 1, 3)
y = F.conv2d(x, kernel, stride=(1, 2), dilation=(1, 1))
assert tuple(y.shape) == (1, 1, 1, 3)
assert torch.equal(y.flatten(), torch.tensor([3., 9., 15.]))
patch = torch.tensor([[[[1., 4.], [2., 3.]]]])
print(F.max_pool2d(patch, 2).item())  # 4
print(F.avg_pool2d(patch, 2).item())  # 2.5`}),
  S('check','让“等变”成为可检验的声明',['比较移动输入后的输出，与原输出移动后的结果时，先去掉受边界影响的位置，再确认位移是否是总步长的整数倍。否则测到的差异可能仅仅来自采样相位。','试把代码里的 dilation 宽方向改为 2：同样三个系数覆盖宽 5，输出宽变为 2。若同时想保留更多输出，应重新计算 padding，不能机械地沿用旧值。']),
 ]},misconceptions:['相同输出尺寸不代表相同感受野；改变空洞率和补零可以保尺寸而改覆盖。','平均池化是否把补零计入分母依赖 API 参数，必须明确 count_include_pad。'],references:[R('Conv2d','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.Conv2d.html','核对输出尺寸、groups 与空洞率。'),R('Computing Receptive Fields of Convolutional Neural Networks','Araujo et al. · Distill','https://distill.pub/2019/computing-receptive-fields/','从单路径递推扩展到有分支的感受野。')]},
{
 id:'classic-vision',title:'经典 CNN：把局部响应逐层变成分类依据',english:'LeNet, AlexNet & VGG',module:2,minutes:5,topicIds:['classic-cnn'],prerequisites:['convolution','conv-geometry'],summary:'用可运行的小分类器理解特征提取、非线性、降采样与分类头，再对照三代经典设计。',
 sections:{quick:[
 S('purpose','一张图如何变成十个分数',['手写数字输入是空间网格，分类输出是十个类别的分数。卷积提取每处局部模式，激活函数允许组合非线性特征，下采样压缩空间，分类头把全图证据汇总。','例如 1 张单通道 28×28 图，经 8 个带补零的 3×3 核仍有 28×28 位置；2×2 池化后变为 8 个 14×14 特征图。通道数是模式种类，不是图片张数。'],{flow:[{label:'28×28 灰度图',detail:'一个输入通道'},{label:'卷积与激活',detail:'8 种局部响应'},{label:'池化',detail:'空间降至 14×14'},{label:'分类头',detail:'输出 10 个未归一化分数'}]}),
 S('history','三种设计各自回答什么问题',['LeNet 把局部连接、共享参数与下采样组合成文档识别网络。AlexNet 在更大规模图像任务上结合深层卷积、ReLU、数据增强和 GPU 训练。VGG 系统研究堆叠小型 3×3 核的深度价值。','这些是历史设计案例，不是今天所有视觉任务的性能排序。原始 LeNet 的部分连接与下采样细节、AlexNet 的分组安排，都不能由一个通用 Conv-ReLU-Pool 示例完整代表。'],{checkpoint:{question:'最后输出十个实数，是否必须先做 Softmax 才能送入 PyTorch 交叉熵？',answer:'不需要。CrossEntropyLoss 接收原始 logits，内部计算 log-softmax；提前做 Softmax 会改变输入含义。'}})],
 deep:[
 S('count','参数不随图片位置重复储存',['一个 3×3 核从 3 个输入通道得到 16 个输出通道：每个输出通道需要 27 个核系数和 1 个偏置，总共 448。图从 32×32 变为 64×64 时，参数仍是 448，但计算位置更多。'],{formula:String.raw`P=C_{\mathrm{out}}(C_{\mathrm{in}}k^2+1)`,formulaReading:'参数量等于输出通道数，乘以每个输出通道的输入通道数乘核面积，再加一个偏置。',notation:[N(String.raw`P`,'含偏置的普通二维卷积参数量；此式限定 groups=1'),N(String.raw`C_{\mathrm{out}}`,'输出通道数；下标 out 表示 output','整数','16'),N(String.raw`C_{\mathrm{in}}`,'输入通道数；下标 in 表示 input','整数','3'),N(String.raw`k`,'正方形卷积核边长','整数','3'),N(String.raw`k^2`,'核面积；上标 2 表示平方'),N(String.raw`1`,'每个输出通道的一个偏置'),N(String.raw`+`,'加法；紧邻符号表示乘法')]}),
 S('small-kernels','为什么堆叠两个 3×3',['两个步长为 1 的 3×3 层可以获得宽 5 的理论感受野，中间还多一次非线性。若通道宽相同且忽略偏置，两个小核需要的核面积系数是 18，而单个 5×5 是 25。','这不说明二者功能完全相同：非线性、层间通道瓶颈、边界处理都不同。堆叠小核是可训练的结构选择，不是把任意大核精确分解的定理。']),
 S('heads','展平和全局平均读出了不同信息',['展平会保留每个空间位置的独立坐标，接全连接层时参数可能很大；全局平均池化先把每个通道的所有位置平均，分类头只需读取通道强度。','全局平均更节省参数，但会丢失空间布局信息；对于检测框和分割边界，通常要保留空间特征。训练阶段还需检查分类器是否只学了背景捷径，而非目标本身。'])],implementation:[
 S('code','运行一个小型 CNN，不下载数据',['下面是教学分类器而非原版 LeNet。两张随机图仅用于形状和梯度检查，随机标签的损失不能用于证明识别能力。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
model = nn.Sequential(
    nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(),
    nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(16, 10))
images = torch.randn(2, 1, 28, 28)
labels = torch.tensor([3, 7])
logits = model(images)
assert tuple(logits.shape) == (2, 10)
loss = nn.CrossEntropyLoss()(logits, labels)
loss.backward()
print('parameters:', sum(p.numel() for p in model.parameters()))
print('loss:', loss.item())`}),
 S('practice','从形状检查走向真正训练',['换成真实数据时，把标准化统计量只从训练集估计；验证集关闭数据增强并使用 model.eval()。检查一个极小训练子集能否被拟合，常比直接跑一百轮更容易定位实现错误。','把全局平均换成展平后，计算线性层的输入维数，并比较参数量。再对输入平移几格，比较分数变化；不要把一次结果解释为网络具有普遍平移不变性。'])]},misconceptions:['卷积层越多不自动越好；优化、数据量与分辨率都影响结果。','历史模型不是只靠架构取得效果，训练策略同样重要。'],references:[R('Very Deep Convolutional Networks for Large-Scale Image Recognition','Simonyan & Zisserman','https://arxiv.org/abs/1409.1556','查看 VGG 对深度与小卷积核的系统研究。'),R('ImageNet Classification with Deep Convolutional Neural Networks','Krizhevsky et al.','https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks','原始 AlexNet 论文及训练细节。'),R('Gradient-Based Learning Applied to Document Recognition','LeCun et al.','https://ieeexplore.ieee.org/document/726791','LeNet 与文档识别系统原文。')]},
{
 id:'connected-cnn',title:'ResNet、Inception 与 DenseNet：信息怎样跨层流动',english:'Residual, Multi-branch & Dense Connections',module:2,minutes:5,topicIds:['inception-densenet','resnet-vision','model-resnet'],prerequisites:['backprop','convolution'],summary:'分清相加、拼接和并行分支，它们改变的是不同的信息流与计算预算。',
 sections:{quick:[
 S('residual','先让网络学“需要改多少”',['若已有表示是 [2, 5]，新分支给出修正 [0.1, −0.2]，残差输出就是 [2.1, 4.8]。分支输出接近零时，主路径可以保留原有表示。','跳跃连接使梯度有一条直接经过加法节点的路径，常有利于深网络优化。它不保证梯度永远稳定，也不保证所有层都真正学习了有用修正。'],{flow:[{label:'输入表示',detail:'一条支路保留输入'},{label:'残差分支',detail:'卷积、非线性等计算修正'},{label:'按元素相加',detail:'两个张量必须形状兼容'},{label:'后续层',detail:'继续处理合并后的表示'}]}),
 S('three','三个网络的连接不是一回事',['Inception 让同一输入经过不同尺度分支，再沿通道拼接。DenseNet 把此前层的特征拼接给后续层，鼓励特征重用。ResNet 通常把捷径与新分支按元素相加，维数不因此增长。','若两个分支各输出 8 通道，相加后仍为 8，拼接后为 16。这个差别直接决定下一层核的输入通道数和内存需求。'],{checkpoint:{question:'8 通道和 16 通道的分支能直接做普通残差相加吗？',answer:'通常不能。需要投影或其他明确的形状匹配；依赖偶然广播会改变模型含义。'}})],deep:[
 S('gradient','相加节点为什么提供直接梯度路径',['把残差分支想成对原表示的微小修正。上游传回的损失梯度，在相加处会同时进入捷径与残差分支，最终汇合，而不是只穿过长串非线性。'],{formula:String.raw`y=x+F(x;\theta),\qquad \frac{\partial L}{\partial x}=\left(I+J_F(x)\right)^\top\frac{\partial L}{\partial y}`,formulaReading:'输出等于输入加残差函数；对输入的损失梯度，是单位映射与残差函数雅可比之和的转置，乘输出梯度。',notation:[N(String.raw`x`,'输入列向量','d×1'),N(String.raw`y`,'同维输出列向量','d×1'),N(String.raw`d`,'展开后的特征维数'),N(String.raw`F`,'残差分支函数，输出维数与输入相同'),N(String.raw`\theta`,'残差分支内可学习参数；分号仅分隔输入与参数'),N(String.raw`L`,'标量损失'),N(String.raw`\partial L/\partial x,\partial L/\partial y`,'分别是对输入、输出的列梯度','d×1'),N(String.raw`J_F(x)`,'残差分支对输入的雅可比；第 i 行第 j 列为第 i 个输出对第 j 个输入的导数','d×d'),N(String.raw`I`,'单位矩阵','d×d'),N(String.raw`\top`,'矩阵转置'),N(String.raw`+`,'按元素相加；矩阵相邻表示矩阵乘法')]}),
 S('bottlenecks','1×1 卷积并非无用的小窗口',['1×1 卷积不混合邻近空间位置，却能混合通道。Inception 可先压缩通道再做昂贵的大核，ResNet bottleneck 可先降维、做空间变换、再升维。','例如将 64 通道先压成 16，后续 3×3 核在较窄空间计算，代价显著降低。但过窄瓶颈也会限制信息，不能只看参数越少越好。']),
 S('dense-cost','DenseNet 的增长率与内存',['一个 dense block 若每层新产生 12 通道，后续层会读取之前所有通道的拼接。输入 24 通道时，经过 3 层后拼接宽度为 60；这里 12 就是增长率。','拼接保留可直接访问的旧特征，却可能增加激活储存和内存读写。参数少不等于峰值显存低。比较这些网络时，应固定任务、训练预算，并分别记录参数、计算和实测时延。'])],implementation:[
 S('code','验证残差相加和拼接的形状',['这个块只演示同通道的残差关系；没有复刻原始 ResNet 的归一化和激活布局。将第二个卷积清零后，整个块应严格成为恒等映射，这是很有用的单元检查。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
branch = nn.Sequential(nn.Conv2d(8, 8, 3, padding=1), nn.ReLU(),
                       nn.Conv2d(8, 8, 3, padding=1))
nn.init.zeros_(branch[-1].weight)
nn.init.zeros_(branch[-1].bias)
x = torch.randn(2, 8, 8, 8, requires_grad=True)
y = x + branch(x)
assert torch.equal(x, y)
y.sum().backward()
assert torch.allclose(x.grad, torch.ones_like(x))
print('sum:', y.shape)
print('concat:', torch.cat([x.detach(), branch(x).detach()], dim=1).shape)`}),
 S('downsample','跨尺度时把捷径也画出来',['若残差分支把空间尺寸减半、通道翻倍，捷径常用步长为 2 的 1×1 投影匹配形状。此时捷径不再是纯恒等映射，上一节单位矩阵的梯度公式也要替换为投影的雅可比。','实现 DenseNet 时别把通道拼接写成相加；实现 Inception 时先检查每个并行分支的空间高宽一致。图中看起来都像“连线汇合”，张量运算却不同。'])]},misconceptions:['ResNet 的捷径不是把数据从训练绕过去，分支依然接收梯度。','DenseNet 的 dense 指层间连接，不等于普通全连接层。'],references:[R('Deep Residual Learning for Image Recognition','He et al.','https://arxiv.org/abs/1512.03385','残差参数化与深层视觉模型原文。'),R('Going Deeper with Convolutions','Szegedy et al.','https://arxiv.org/abs/1409.4842','多尺度分支和降维设计。'),R('Densely Connected Convolutional Networks','Huang et al.','https://arxiv.org/abs/1608.06993','检查特征拼接、增长率与 transition layer。')]},
{
 id:'efficient-vision',title:'高效 CNN：把空间处理和通道混合拆开',english:'Depthwise Separable Convolution, MobileNet & EfficientNet',module:2,minutes:5,topicIds:['efficient-cnn'],prerequisites:['convolution'],summary:'计算深度可分离卷积究竟省在哪里，并区分理论乘加量与设备上的真实时延。',
 sections:{quick:[
 S('split','先各看各的，再交换通道信息',['普通卷积同时跨空间和通道求和。深度可分离卷积先给每个输入通道单独做空间卷积，再用 1×1 卷积混合通道。','例如输入 8 通道、输出 16 通道、3×3 核：普通卷积需要 1152 个核系数，拆开后是 72+128=200。节省来自一种结构约束，并不是任意普通卷积都可无损替代。'],{flow:[{label:'输入 8 通道',detail:'每个位置是 8 维特征'},{label:'Depthwise 3×3',detail:'每个通道独立提取空间模式'},{label:'Pointwise 1×1',detail:'跨通道混合为 16 维'},{label:'输出 16 通道',detail:'空间大小由步长与补零决定'}]}),
 S('families','MobileNet 和 EfficientNet 不只是一层卷积',['MobileNet V1 使用深度可分离结构；V2 引入先扩展、再逐通道处理、再线性投影的 inverted residual。中间可以很宽，输入输出的瓶颈较窄。','EfficientNet 同时考虑深度、宽度和分辨率的扩张，强调预算需要协调分配。它不是“把三个数字都翻倍”这样的固定规则。'],{checkpoint:{question:'Depthwise 阶段会自动把红色通道与绿色通道的信息混合吗？',answer:'不会。每个通道独立处理；跨通道混合由后续 pointwise 1×1 卷积负责。'}})],deep:[
 S('cost','在同一输出位置比较乘加数',['仍以输入 8、输出 16、核宽 3 为例，普通方案每处 1152 次乘加，分离方案每处 200 次。先把比较条件固定：同一输出网格、通道乘子为 1、不计偏置和激活。'],{formula:String.raw`\frac{M_{\mathrm{sep}}}{M_{\mathrm{full}}}=\frac{k^2C_{\mathrm{in}}+C_{\mathrm{in}}C_{\mathrm{out}}}{k^2C_{\mathrm{in}}C_{\mathrm{out}}}=\frac{1}{C_{\mathrm{out}}}+\frac{1}{k^2}`,formulaReading:'分离卷积的乘加数除以普通卷积的乘加数，等于逐通道空间开销加通道混合开销，再除以完整开销；化简得到输出通道数的倒数加核面积的倒数。',notation:[N(String.raw`M_{\mathrm{sep}}`,'单个输出位置的分离卷积乘加次数；sep 表示 separable'),N(String.raw`M_{\mathrm{full}}`,'单个输出位置的普通卷积乘加次数；full 表示完整混合'),N(String.raw`k`,'正方形核边长'),N(String.raw`k^2`,'核面积，上标 2 为平方'),N(String.raw`C_{\mathrm{in}},C_{\mathrm{out}}`,'输入与输出通道数；in/out 表示输入/输出'),N(String.raw`+`,'加法；相邻符号为乘法；横分数线表示除法'),N(String.raw`1`,'单位数，形成倒数')]}),
 S('expressiveness','省下的参数对应什么限制',['逐通道空间核为同一输入通道提供一种空间滤波，再由 1×1 系数分配给不同输出；完整卷积可以为每个输入—输出通道组合使用不同空间核。','因此分离结构限制单层的表达形式。扩展中间通道和叠加非线性可以缓解限制，但比较模型时仍需要用目标任务验证，而不能仅凭参数公式宣布等价。']),
 S('latency','为什么 FLOPs 更低还可能更慢',['GPU 需要读取输入、启动算子并写回输出。小尺寸逐通道卷积可能受内存带宽或启动开销限制；高效矩阵乘法单元也未必能充分利用。','增加分辨率会增加空间位置，增加宽度会同时影响输入和输出通道，增加深度则增加串行层数。复合缩放要平衡这些不同成本，并针对部署硬件实测。'])],implementation:[
 S('code','用 groups 明确逐通道处理',['groups 等于输入通道数，并保持相同输出通道数时，每个通道使用独立核。此代码关闭偏置，让参数数量与上面的手算一致。'],{code:`import torch
from torch import nn
full = nn.Conv2d(8, 16, 3, padding=1, bias=False)
separable = nn.Sequential(
    nn.Conv2d(8, 8, 3, padding=1, groups=8, bias=False),
    nn.Conv2d(8, 16, 1, bias=False))
x = torch.randn(1, 8, 16, 16)
assert full(x).shape == separable(x).shape == (1, 16, 16, 16)
count = lambda model: sum(p.numel() for p in model.parameters())
assert count(full) == 1152 and count(separable) == 200
print(count(full), count(separable))`}),
 S('measure','公平比较部署性能',['测试时固定批次、数据类型、输入尺寸和线程数，先预热，再用重复测量报告中位数；GPU 计时需要同步，否则只测到异步调度时间。','上面两个随机初始化层输出不会相同，不能用输出相等作为正确性标准。要评估可替代性，应在相同数据与训练预算下分别训练，再比较质量和时延。'])]},misconceptions:['分组卷积与深度卷积不是同义词；深度卷积是特殊分组方式。','参数减少的比例通常不能直接当作推理加速比。'],references:[R('MobileNets','Howard et al.','https://arxiv.org/abs/1704.04861','深度可分离卷积与宽度/分辨率选择。'),R('MobileNetV2','Sandler et al.','https://arxiv.org/abs/1801.04381','倒残差与线性瓶颈。'),R('EfficientNet','Tan & Le','https://arxiv.org/abs/1905.11946','协调深度、宽度、分辨率的缩放研究。')]},
{
 id:'dense-vision',title:'U-Net 与检测分割：预测要回到哪里',english:'U-Net, Detection & Segmentation',module:2,minutes:5,topicIds:['unet-vision','detection-segmentation','model-unet'],prerequisites:['convolution','conv-geometry'],summary:'分清整图类别、框、像素标签与实例，并理解 U-Net 的跨尺度特征融合。',
 sections:{quick:[
 S('tasks','猫在哪里，和每个像素是什么，是不同任务',['分类输出整张图的类别；检测输出若干类别与边界框；语义分割给每个像素一个类别；实例分割还要区分同类别的不同个体。','图中两只猫的像素在语义分割中都叫“猫”，实例分割却要区分猫 1 和猫 2。不能拿一个分类头直接解释这些输出。']),
 S('unet','U 形结构把语境与定位连接起来',['编码路径降采样，获得更大范围的上下文；解码路径上采样，恢复输出网格。来自编码器同尺度的跳跃特征提供较细的位置信息，与解码特征沿通道拼接。','原始 U-Net 使用未补零卷积并裁剪跳跃特征；现代 same-padding 变体常保留尺寸。这里示例采用后一种教学简化。'],{flow:[{label:'高分辨率编码',detail:'保存边缘与细节特征'},{label:'低分辨率语境',detail:'通过降采样扩大覆盖'},{label:'上采样与跳跃拼接',detail:'合并语境与定位信息'},{label:'逐像素类别分数',detail:'输出保留二维位置'}],checkpoint:{question:'恢复到原图尺寸，是否表示丢失的细节已经自动找回？',answer:'不是。插值只生成更密的网格；细节需要来自保存的特征、学习到的先验和训练监督。'}})],deep:[
 S('fusion','拼接先检查空间尺寸',['若上采样特征有 16 通道，跳跃特征有 8 通道，且二者都是 16×16，拼接得到 24 通道。后续卷积再混合这些来源。'],{formula:String.raw`Z=\mathrm{Concat}_{C}\!\left(\mathrm{Up}(D),E\right)`,formulaReading:'先将解码器特征上采样到编码器特征的空间尺寸，再沿通道轴拼接，得到融合张量。',notation:[N(String.raw`D`,'较低分辨率的解码器特征','B×16×8×8'),N(String.raw`E`,'对应尺度的编码器跳跃特征','B×8×16×16'),N(String.raw`B`,'批次中的图像数量'),N(String.raw`\mathrm{Up}`,'上采样操作，明确指定目标高宽；本示例为双线性插值'),N(String.raw`\mathrm{Concat}_{C}`,'沿通道轴 C 拼接，不是相加'),N(String.raw`C`,'通道轴；下标表示拼接轴'),N(String.raw`Z`,'拼接后的融合特征','B×24×16×16'),N(String.raw`\left(\cdot,\cdot\right)`,'括号内两个输入，逗号仅分隔参数')]}),
 S('loss','像素损失和图像指标不要混用',['多类别语义分割常输出“批次×类别×高×宽”的原始分数，标签则为“批次×高×宽”的整数类别。交叉熵逐像素计算，再按有效像素聚合。','背景占 99% 时，全预测背景可能有很高像素准确率。应按类别检查交并比、Dice 等指标，并明确忽略标签、空类别和平均方式；它们并非同一个数。']),
 S('detection','检测为什么还需要匹配与去重',['检测框的数量通常可变。候选框方法要把预测与真实目标匹配，并分别学习类别和位置；多个高度重合的候选还可能需要非极大值抑制。基于集合预测的方法可以使用一对一匹配。','框坐标回归损失只度量位置，不能代替类别监督。分割掩膜也不自动解决实例对应：相邻两个同类物体可能需要额外的检测或实例机制。'])],implementation:[
 S('code','两级 U 形模块的最小前向与梯度',['输入是两张 16×16 灰度图；输出有 3 个像素类别。随机标签只验证梯度链通畅，不代表模型已经学会分割。'],{code:`import torch
from torch import nn
import torch.nn.functional as F
torch.manual_seed(0)
encoder = nn.Conv2d(1, 8, 3, padding=1)
bottom = nn.Conv2d(8, 16, 3, padding=1)
decoder = nn.Conv2d(24, 8, 3, padding=1)
head = nn.Conv2d(8, 3, 1)
image = torch.randn(2, 1, 16, 16)
skip = F.relu(encoder(image))
low = F.relu(bottom(F.max_pool2d(skip, 2)))
up = F.interpolate(low, size=skip.shape[-2:], mode='bilinear', align_corners=False)
logits = head(F.relu(decoder(torch.cat([up, skip], dim=1))))
target = torch.randint(0, 3, (2, 16, 16))
loss = F.cross_entropy(logits, target)
loss.backward()
assert logits.shape == (2, 3, 16, 16)
print(loss.item())`}),
 S('alignment','预测对齐比看起来更重要',['奇数尺寸经过下采样后可能无法靠 scale_factor=2 精确返回，因此代码以跳跃特征的实际高宽作为插值目标。训练图和标签必须经过同一几何变换，标签缩放通常用最近邻以保持离散类别。','评估医学或遥感数据时，按患者、场景或采集批次划分数据；随机切分高度相邻的小块可能把几乎相同的内容同时放入训练集和测试集。'])]},misconceptions:['U-Net 是一种编码解码与跳跃连接组织，不等同于所有分割算法。','转置卷积不是一般卷积的数学逆；它也可能产生上采样伪影。'],references:[R('U-Net: Convolutional Networks for Biomedical Image Segmentation','Ronneberger et al.','https://arxiv.org/abs/1505.04597','原始结构、裁剪与生物图像分割设定。'),R('Faster R-CNN','Ren et al.','https://arxiv.org/abs/1506.01497','区域建议、分类与框回归的组合。'),R('End-to-End Object Detection with Transformers','Carion et al.','https://arxiv.org/abs/2005.12872','用集合预测与匹配理解检测的另一种组织。')]},
{
 id:'vision-transformers',title:'ViT：图像块也可以作为序列',english:'Vision Transformer & Inductive Bias',module:2,minutes:5,topicIds:['vit-vision','model-vit'],prerequisites:['attention','convolution'],summary:'从图像块到 token，逐个核对序列长度、位置编码和分类读出，理解它与 CNN 的不同约束。',
 sections:{quick:[
 S('patches','把 8×8 图切成四块',['一张 8×8 RGB 图可切成四个 4×4 图像块，每块展开后有 48 个数。用一个共享线性映射将每块投影成 16 维 token，得到长度为 4 的序列。','加入位置表示后，Transformer 可以让不同图像块交换信息。分类可以读取额外的 class token，也可以对块表示求平均；两者都是设计选择。'],{flow:[{label:'8×8×3 图像',detail:'空间输入'},{label:'4 个 4×4 图像块',detail:'每块展开为 48 个值'},{label:'共享投影',detail:'4 个 16 维 token'},{label:'Transformer 与读出',detail:'位置交互后汇总类别信息'}]}),
 S('bias','少一些局部约束，多一些学习负担',['CNN 的局部连接与空间共享直接写进结构；标准 ViT 的自注意力允许远处图像块直接交换信息。它仍有 patch 划分和共享投影等归纳偏置，不能说完全“没有先验”。','原始 ViT 研究强调大规模预训练的重要性。是否适合小数据任务，还取决于增强、正则化、蒸馏和预训练来源，不是 CNN 与 Transformer 的永久胜负。'],{checkpoint:{question:'把 patch 边长减半，token 数和完整注意力矩阵大小如何变？',answer:'高和宽各多一倍块，token 数变为 4 倍；注意力矩阵元素数大约变为 16 倍。'}})],deep:[
 S('shape','序列长度是分辨率和 patch 共同决定的',['高宽均为 224、patch 边长为 16 时，沿每轴有 14 块，总共 196 个图像 token；若加 class token 则为 197。下面先不计额外 token。'],{formula:String.raw`N=\frac{HW}{P^2},\qquad Z=X_{\mathrm{patch}}E+P_{\mathrm{pos}}`,formulaReading:'图像块数等于图像面积除以单块面积；每块展开后的矩阵乘共享投影，再加位置表示，得到输入 token 序列。',notation:[N(String.raw`H,W`,'输入图像高与宽，假设均可被 P 整除'),N(String.raw`P`,'正方形 patch 边长；与后面的带下标位置矩阵不同'),N(String.raw`P^2`,'patch 面积，上标 2 表示平方'),N(String.raw`N`,'图像 token 数，不含 class token'),N(String.raw`C`,'颜色或输入通道数'),N(String.raw`d`,'投影后的 token 特征维数'),N(String.raw`X_{\mathrm{patch}}`,'逐块展平的图像矩阵；下标 patch 表示图像块','N×(P²C)'),N(String.raw`E`,'所有图像块共享的投影矩阵','(P²C)×d'),N(String.raw`P_{\mathrm{pos}}`,'位置表示；下标 pos 表示 position','N×d'),N(String.raw`Z`,'进入 Transformer 的 token 表示','N×d'),N(String.raw`+`,'逐元素加法；相邻矩阵符号表示矩阵乘法')]}),
 S('positions','为什么换分辨率还要处理位置',['同一幅图换尺寸后，patch 数量通常变化。若使用学习到的二维网格位置向量，就需要有明确的插值或重采样策略；不能把旧长度的位置表直接相加。','注意力本身不会自动知道左上角是哪块。位置编码、局部窗口或二维相对偏置可以补充空间关系，不同视觉 Transformer 的方案各不相同。']),
 S('details','patch 大小也是信息瓶颈',['大 patch 减少序列长度和注意力开销，却把更多像素提前压进一个 token；细粒度边界可能更难保留。小 patch 保留更密空间采样，却增加计算与内存。','分类只需整图读出，检测或分割往往需要多尺度特征或更密的输出。把分类 ViT 接到密集预测任务，通常还要设计特征重排、上采样或任务专属头。'])],implementation:[
 S('code','Conv2d 也能实现 patch 投影',['核宽和步长均为 patch 边长的卷积，恰好执行不重叠图像块的共享线性投影。代码加入 class token 后有 5 个 token；随机权重仅做形状检查。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
patch = nn.Conv2d(3, 16, kernel_size=4, stride=4)
image = torch.randn(2, 3, 8, 8)
tokens = patch(image).flatten(2).transpose(1, 2)
cls = nn.Parameter(torch.zeros(1, 1, 16))
pos = nn.Parameter(torch.zeros(1, 5, 16))
x = torch.cat([cls.expand(2, -1, -1), tokens], dim=1) + pos
layer = nn.TransformerEncoderLayer(16, 4, dim_feedforward=32,
                                   batch_first=True, dropout=0.0)
logits = nn.Linear(16, 3)(layer(x)[:, 0])
assert tokens.shape == (2, 4, 16)
assert logits.shape == (2, 3)
logits.sum().backward()
print('patches:', tokens.shape, 'logits:', logits.shape)`}),
 S('verify','核对实现与论文时看哪些位置',['检查 patch embedding 是否带偏置、位置表示类型、LayerNorm 位于子层前还是后、分类读出来自 class token 还是平均池化。它们都会改变具体模型。','示例没有声称复刻 ViT-B/16：深度、宽度、训练策略都大幅缩小。真正复现实验时应使用原作者或可信实现的配置，并逐项记录修改。'])]},misconceptions:['把图像展成序列不等于丢弃所有二维结构，patch 与位置表示仍保留结构信息。','全局注意力的长距离连接不保证模型真的利用了正确的远处证据。'],references:[R('An Image is Worth 16x16 Words','Dosovitskiy et al.','https://arxiv.org/abs/2010.11929','原始 ViT 的图像块序列、预训练与迁移。'),R('Vision Transformer implementation','Google Research','https://github.com/google-research/vision_transformer','对照原作者配置和实现。')]},
{
 id:'recurrent-memory',title:'RNN 与 BPTT：把过去压进一个状态',english:'Recurrent Neural Networks, BPTT & Bidirectionality',module:3,minutes:5,topicIds:['rnn-bptt','bidirectional-rnn','model-rnn'],prerequisites:['backprop'],summary:'沿时间展开共享参数的计算图，理解状态、梯度传递和双向信息的代价。',
 sections:{quick:[
 S('state','每读一步，都更新一份摘要',['阅读“我 / 很 / 喜欢”时，RNN 在每个位置读取当前输入，并把旧状态更新为新状态。状态不是原文备份，而是有限维的可学习摘要。','一个标量示例：旧状态为 0，输入为 1，输入权重为 1、循环权重为 0.5、偏置为 0，则新状态为 tanh(1)，约 0.762。下一步即使输入为 0，也会通过旧状态继续产生响应。'],{flow:[{label:'当前输入',detail:'本时刻的向量'},{label:'旧隐藏状态',detail:'此前内容的有限维摘要'},{label:'共享更新函数',detail:'同一组参数用于每个时刻'},{label:'新状态与输出',detail:'继续传给下一步或任务头'}]}),
 S('unroll','展开后就是普通计算图',['长度为 3 的输入让同一个 RNN 单元执行 3 次。展开图里看见三个单元，不代表存了三份参数；每个时刻的参数梯度最终要相加。','时间反向传播 BPTT 是对这张展开图应用链式法则。它不是另一种独立的优化器；算出的梯度仍可交给 SGD 或 Adam 更新。'],{checkpoint:{question:'同一个循环权重在三个时间步被使用，反向传播只取最后一次的梯度吗？',answer:'不是。共享参数会接收所有使用位置产生的梯度贡献，并将它们累加。'}})],deep:[
 S('recurrence','形状从输入到状态都要匹配',['输入是 3 维、隐藏状态是 5 维时，输入映射为 5×3，循环映射为 5×5。二者的结果都是 5 维，才可以相加。'],{formula:String.raw`h_t=\tanh(W_xx_t+W_hh_{t-1}+b)`,formulaReading:'本时刻隐藏状态等于输入线性变换、前一状态线性变换和偏置之和，再逐元素经过双曲正切。',notation:[N(String.raw`t`,'时间步编号，从 1 开始；t−1 是前一时刻'),N(String.raw`x_t`,'时刻 t 的输入列向量','d×1'),N(String.raw`d`,'单个输入的特征维数'),N(String.raw`h_t,h_{t-1}`,'当前与前一隐藏状态','m×1'),N(String.raw`m`,'隐藏状态维数'),N(String.raw`W_x`,'输入到状态的共享权重；下标 x 指输入分支','m×d'),N(String.raw`W_h`,'状态到状态的共享权重；下标 h 指循环分支','m×m'),N(String.raw`b`,'偏置列向量','m×1'),N(String.raw`\tanh`,'逐元素双曲正切激活，输出在 −1 与 1 之间'),N(String.raw`+`,'逐元素相加；相邻矩阵和向量表示矩阵乘法')]}),
 S('long-gradients','远处输入为何难以影响今天',['来自末端的梯度要穿过许多状态更新，每步都乘局部导数和循环权重相关的矩阵。反复压小会造成梯度消失，反复放大可能造成爆炸；真实情况还依赖矩阵方向与非线性状态。','截断 BPTT 在一段长度后切断梯度图，可以控制内存和训练开销，但不会让跨截断边界的远期误差信号神奇地回来。保存状态值与保存完整梯度历史是两件事。']),
 S('bidirectional','双向网络读取了未来',['双向 RNN 分别按正序和逆序处理输入，并在同一位置拼接两个状态。若每个方向宽 5，拼接后就是 10 维。','完整双向模型适合离线标注，因为当前位置可以利用后文；严格流式系统没有完整未来，必须改用有限前视、分块或单向模型。不能把双向模型离线结果直接当作零延迟性能。'])],implementation:[
 S('code','对照手写循环与 PyTorch RNN',['代码关闭偏置，把同一组权重复制给 nn.RNN。batch_first=True 使输入和输出的轴为批次、时间、特征，但最终隐藏状态仍是方向/层、批次、隐藏维度。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
x = torch.randn(2, 4, 3)
rnn = nn.RNN(3, 5, bias=False, batch_first=True)
h = torch.zeros(2, 5)
states = []
for t in range(x.shape[1]):
    h = torch.tanh(x[:, t] @ rnn.weight_ih_l0.T + h @ rnn.weight_hh_l0.T)
    states.append(h)
manual = torch.stack(states, dim=1)
output, last = rnn(x)
assert torch.allclose(manual, output, atol=1e-6)
assert last.shape == (1, 2, 5)
bi = nn.RNN(3, 5, batch_first=True, bidirectional=True)
print('unidirectional:', output.shape, 'bidirectional:', bi(x)[0].shape)`}),
 S('detach','有状态训练先明确何时重置',['同一长序列的相邻分块可以传递状态，但进入下一块之前是否 detach 要按截断 BPTT 设计决定。不同样本之间不要无意共享状态，否则会出现数据泄漏或顺序依赖。','变长序列中的 padding 也可能继续改变状态；使用打包序列或明确的掩码/长度管理。单看最终张量形状正常，无法证明状态语义正确。'])]},misconceptions:['隐藏状态不是一个可无限保存全部历史的容器。','双向 RNN 的 backward 方向是逆序前向计算，与梯度反向传播不是同一概念。'],references:[R('Learning Long-Term Dependencies with Gradient Descent Is Difficult','Bengio et al.','https://ieeexplore.ieee.org/document/279181','循环网络长期依赖与梯度问题的经典分析。'),R('RNN','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.RNN.html','核对共享参数与输入、输出、最终状态的形状。')]},
{
 id:'gated-memory',title:'LSTM 与 GRU：用门决定保留和改写',english:'Long Short-Term Memory & Gated Recurrent Units',module:3,minutes:5,topicIds:['gated-rnn','model-lstm','model-gru'],prerequisites:['recurrent-memory'],summary:'门是逐元素的连续控制量；看清 LSTM 的细胞状态和 GRU 的更新混合，避免把“记忆”当成玄学。',
 sections:{quick:[
 S('gate','门可以开一半',['旧记忆为 2，遗忘门为 0.9，候选新内容为 0.5，输入门为 0.2，则新细胞状态为 1.9：保留 1.8，再写入 0.1。门通常由 sigmoid 给出 0 到 1 之间的连续数，不是非开即关的布尔开关。','门值根据当前输入与旧状态计算，并通过任务损失训练；它们不是人为指定的语法规则。每个隐藏维度可以有不同门值。'],{flow:[{label:'输入与旧状态',detail:'共同决定本步门值'},{label:'保留旧内容',detail:'遗忘门逐元素调节'},{label:'写入候选内容',detail:'输入门逐元素调节'},{label:'输出隐藏状态',detail:'细胞状态经激活与输出门读取'}]}),
 S('two-models','LSTM 分开存与读，GRU 合并得更紧凑',['LSTM 显式维护细胞状态与隐藏状态：前者沿加法路径更新，后者是受输出门控制的读出。GRU 通常只维护一个状态，通过重置门构造候选，再用更新门混合旧状态和候选。','GRU 的实现约定并不完全统一。尤其重置门放在循环线性变换之前还是之后，会得到不同公式；对照库实现时必须核对。'],{checkpoint:{question:'遗忘门设为 1、输入门设为 0，会发生什么？',answer:'忽略数值误差时，细胞状态原样保留；隐藏状态仍可能因输出门不同而变化。'}})],deep:[
 S('cell','先只看 LSTM 的记忆主路径',['门值和候选已经算好时，细胞更新只是逐元素乘法与加法。下式刻意聚焦这条路径，而非省略号式地堆出四组线性映射。'],{formula:String.raw`c_t=f_t\odot c_{t-1}+i_t\odot g_t,\qquad h_t=o_t\odot\tanh(c_t)`,formulaReading:'新细胞状态等于遗忘门乘旧细胞状态，加输入门乘候选内容；隐藏状态等于输出门乘细胞状态的双曲正切。',notation:[N(String.raw`t,t-1`,'当前与前一个时间步'),N(String.raw`c_t,c_{t-1}`,'当前与前一步细胞状态','m 维向量'),N(String.raw`h_t`,'当前隐藏状态，供输出或下一步使用','m 维向量'),N(String.raw`m`,'状态的维数'),N(String.raw`f_t`,'遗忘门，每维在 0 到 1 之间'),N(String.raw`i_t`,'输入门，每维在 0 到 1 之间'),N(String.raw`o_t`,'输出门，每维在 0 到 1 之间'),N(String.raw`g_t`,'候选写入内容，通常为 tanh 的输出'),N(String.raw`\odot`,'对应位置逐元素相乘，不是点积'),N(String.raw`\tanh`,'逐元素双曲正切'),N(String.raw`+`,'逐元素相加')]}),
 S('gradients','加法通道改善传播，但不是绝对保障',['固定门值、只看细胞状态的直接通路时，相邻状态的导数由遗忘门控制；门接近 1 时，这条路径可较好保留梯度。','完整网络里门值本身也依赖旧状态，因此总导数还包括其他分支。LSTM 缓解长依赖训练困难，并不保证任意长度的记忆，也仍可能需要梯度裁剪。']),
 S('gru','GRU 更新门的约定要说清',['在 PyTorch 约定里，更新门越接近 1，就越多保留旧隐藏状态；越接近 0，就越多采用新候选。有的教材使用互补命名，不能只看字母猜作用。','PyTorch 的候选计算把重置门乘在循环仿射结果上，包括相应偏置；某些原始写法则先用重置门调制旧状态再作线性映射，两者一般不等价。比较实现时应逐项对齐。'])],implementation:[
 S('code','一次前向比较两种状态接口',['这里批次为 2、序列长 4、输入维 3、隐藏维 5。LSTM 返回隐藏状态和细胞状态两个张量；GRU 只返回隐藏状态。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
x = torch.randn(2, 4, 3)
lstm = nn.LSTM(3, 5, batch_first=True)
gru = nn.GRU(3, 5, batch_first=True)
y_lstm, (h, c) = lstm(x)
y_gru, h_gru = gru(x)
assert y_lstm.shape == y_gru.shape == (2, 4, 5)
assert h.shape == c.shape == h_gru.shape == (1, 2, 5)
old = torch.tensor([2.0])
new = torch.tensor([0.9]) * old + torch.tensor([0.2]) * torch.tensor([0.5])
assert torch.allclose(new, torch.tensor([1.9]))
print('LSTM parameters:', sum(p.numel() for p in lstm.parameters()))
print('GRU parameters:', sum(p.numel() for p in gru.parameters()))`}),
 S('inspect','探测门值时避免反向解释过度',['观察某维遗忘门偏高，只说明该控制量倾向保留对应细胞维度，不能直接说“这里储存了主语”。要支持语义解释，需要控制输入、做干预，并检查输出变化。','若手写 LSTMCell 与 nn.LSTMCell 对比，应核对门拼接顺序、两组偏置和初始状态。先比较单步，再比较多步，避免错误在时间维度上累积。'])]},misconceptions:['LSTM 的 cell state 与 hidden state 并非两个叫法指同一张量。','门控并没有让循环计算自动并行化，时间步仍有依赖。'],references:[R('Long Short-Term Memory','Hochreiter & Schmidhuber','https://www.bioinf.jku.at/publications/older/2604.pdf','原始长期记忆设计。'),R('Learning Phrase Representations using RNN Encoder–Decoder','Cho et al.','https://arxiv.org/abs/1406.1078','GRU 与编码解码模型的重要早期来源。'),R('LSTM / GRU API','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.GRU.html','核对 GRU 重置门与更新门的具体约定。'),R('LSTM API','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.LSTM.html','核对细胞状态、投影与形状。')]},
{
 id:'sequence-translation',title:'Seq2Seq：每个输出步骤从输入中取什么',english:'Encoder–Decoder & Additive Attention',module:3,minutes:5,topicIds:['seq2seq','attention-families'],prerequisites:['recurrent-memory','attention'],summary:'输入和输出可以长度不同；编码器保存来源信息，解码器一边生成，一边查询需要的部分。',
 sections:{quick:[
 S('different-length','翻译不要求词与词一一对齐',['把三词输入翻译成四词输出时，不能给每个输入位置固定配一个输出。编码器先生成输入表示，解码器依据已经生成的内容逐步输出，并用结束符决定何时停止。','早期固定向量 Seq2Seq 将整个输入压进一个摘要；注意力允许每个输出步骤重新读取所有编码位置，降低单一摘要承担的压力。']),
 S('alignment','一个输出词可以综合多个输入位置',['假设两个输入状态分别为 [1, 0] 和 [0, 2]，当前输出步赋予权重 0.25 和 0.75，则上下文向量是 [0.25, 1.5]。权重不是硬对齐标签，且不必对应语言学上的唯一解释。'],{flow:[{label:'编码输入序列',detail:'保留每个来源位置的状态'},{label:'当前解码状态',detail:'提出本输出步骤的查询'},{label:'打分并归一化',detail:'对来源位置分配权重'},{label:'上下文与预测',detail:'加权汇总后生成下一个输出'}],checkpoint:{question:'输入长 3、输出长 4 时，交叉注意力矩阵必须是方阵吗？',answer:'不必。行对应 4 个输出查询，列对应 3 个输入来源，因此可以是 4×3。'}})],deep:[
 S('additive','加性注意力先学习“如何比较”',['查询与来源状态可能维度不同，先分别投影到同一个比较空间，再相加、过非线性，最后压成一个分数。每个输出步对所有来源位置独立打分。'],{formula:String.raw`e_{t,j}=v^\top\tanh(W_ss_t+W_hh_j+b)`,formulaReading:'输出步骤 t 对输入位置 j 的分数，是解码状态和编码状态分别投影相加后，经双曲正切，再与评分向量点乘。',notation:[N(String.raw`t`,'输出序列的位置编号'),N(String.raw`j`,'输入序列的位置编号'),N(String.raw`e_{t,j}`,'该输出步骤对该输入位置的未归一化评分','标量'),N(String.raw`s_t`,'当前解码器查询状态','d_s×1'),N(String.raw`h_j`,'第 j 个编码器状态','d_h×1'),N(String.raw`d_s,d_h`,'解码与编码状态的维度'),N(String.raw`a`,'注意力比较空间的维度'),N(String.raw`W_s`,'查询投影矩阵；下标 s 指解码状态','a×d_s'),N(String.raw`W_h`,'来源投影矩阵；下标 h 指编码状态','a×d_h'),N(String.raw`b`,'比较空间偏置','a×1'),N(String.raw`v`,'将比较特征压成分数的向量','a×1'),N(String.raw`\top`,'转置；v 的转置乘向量得到点积'),N(String.raw`\tanh`,'逐元素双曲正切'),N(String.raw`+`,'逐元素相加；相邻符号为矩阵乘法')]}),
 S('dot','加性与点积怎样选择',['点积注意力直接比较查询与键的方向和大小，易于用大矩阵乘法并行；缩放点积进一步用维数平方根控制分数尺度。加性注意力通过小网络学习兼容函数，允许查询和来源原始维数不同。','两者都要在正确轴做 Softmax：对同一个查询，应在可见来源位置之间归一化。给 padding 的来源位置分配权重会把无效内容混进上下文。']),
 S('training','Teacher forcing 提供真实前缀',['训练时常把真实的前一个输出作为下一步输入，使多个目标位置可以得到稳定监督；推理时前一个输出来自模型自己，两种前缀分布可能不同。','注意力解决的是如何读取来源，并不自动解决推理误差累积、搜索、长度偏好或终止条件。输出结束符必须属于训练目标，推理还需合理的最大长度。'])],implementation:[
 S('code','四行查询、三个来源，算出上下文',['代码使用批次 2、输出查询 4、输入来源 3、比较维 5；广播产生每个查询和每个来源的配对特征。输出上下文保留来源状态的 7 个特征维度。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
query = torch.randn(2, 4, 6)
source = torch.randn(2, 3, 7)
q_proj, h_proj = nn.Linear(6, 5), nn.Linear(7, 5, bias=False)
score = nn.Linear(5, 1, bias=False)
pair = torch.tanh(q_proj(query).unsqueeze(2) + h_proj(source).unsqueeze(1))
energy = score(pair).squeeze(-1)
weights = energy.softmax(dim=-1)
context = weights @ source
assert weights.shape == (2, 4, 3)
assert context.shape == (2, 4, 7)
assert torch.allclose(weights.sum(-1), torch.ones(2, 4))
print(context.shape)`}),
 S('debug','把正确轴写在调试输出里',['打印权重的“最后一维之和”应得到每个输出查询一个 1，而不是把所有矩阵元素求和得到 1。变长批次还需把来源 padding 位置在 Softmax 前屏蔽。','为了检验对齐是否有用，可固定解码前缀，扰动一个来源位置，并测量预测变化。仅凭热力图颜色深不能证明模型的唯一因果依据。'])]},misconceptions:['交叉注意力的查询来自解码侧，键和值来自编码侧；不能把来源轴和目标轴混称为同一个时间。','注意力权重并非人工标注的词对齐概率，模型也可能通过别的路径使用信息。'],references:[R('Sequence to Sequence Learning with Neural Networks','Sutskever et al.','https://arxiv.org/abs/1409.3215','固定向量编码解码的原始背景。'),R('Neural Machine Translation by Jointly Learning to Align and Translate','Bahdanau et al.','https://arxiv.org/abs/1409.0473','加性注意力的来源与联合训练方式。'),R('Effective Approaches to Attention-based Neural Machine Translation','Luong et al.','https://arxiv.org/abs/1508.04025','不同对齐打分方式与注意力组织。')]},
{
 id:'causal-generation',title:'自回归与因果掩码：训练时也不能偷看答案',english:'Autoregressive Factorization & Causal Masks',module:3,minutes:5,topicIds:['autoregression','causal-masking'],prerequisites:['attention'],summary:'把联合概率拆成前缀条件概率，逐项检查输入右移、目标对齐与可见范围。',
 sections:{quick:[
 S('prefix','一次只决定接下来的一个词',['生成“我 喜欢 音乐”时，模型先决定“我”，再依据“我”决定“喜欢”，最后依据“我 喜欢”决定“音乐”。一条序列的概率是这些条件概率相乘。','假设三步概率分别为 0.5、0.4、0.8，则整条序列概率为 0.16。这里的前缀必须固定为这条候选序列实际包含的词。']),
 S('shift','输入与标签错开一格',['训练输入可以是 [BOS, 我, 喜欢]，标签是 [我, 喜欢, 音乐]。BOS 是起始符。每个位置都预测它右边的下一个词，因此允许看到当前输入位置，但不能看到更右边的位置。','整个序列的各位置可在一次前向中并行计算，因果掩码保证每一行的可见信息仍只有对应前缀；推理时未知下一个词，所以通常逐步生成。'],{flow:[{label:'右移目标',detail:'起始符放在输入开头'},{label:'屏蔽未来位置',detail:'每行只读当前及更早输入'},{label:'并行预测下一词',detail:'每个位置有不同的真实目标'},{label:'汇总损失',detail:'只统计有效标签位置'}],checkpoint:{question:'训练可以并行计算所有位置，是否说明自回归模型可以在推理时同时独立生成全部词？',answer:'不是。训练有真实前缀；推理前缀由前面的生成结果决定，存在顺序依赖。'}})],deep:[
 S('factor','概率链式法则与建模选择',['链式分解是概率恒等关系；神经网络选择的是如何近似每个前缀条件分布。位置越后，条件中包含的已知词越多。'],{formula:String.raw`p(x_{1:T})=\prod_{t=1}^{T}p(x_t\mid x_{<t})`,formulaReading:'整条序列的概率，等于从第一个到最后一个位置，各词在此前前缀条件下的概率连乘。',notation:[N(String.raw`p`,'模型给出的概率分布'),N(String.raw`x_t`,'第 t 个离散词元'),N(String.raw`T`,'序列长度'),N(String.raw`t`,'从 1 到 T 的位置编号'),N(String.raw`x_{1:T}`,'第 1 到 T 个词元组成的完整序列'),N(String.raw`x_{<t}`,'严格早于 t 的前缀；t=1 时为空前缀或起始条件'),N(String.raw`\mid`,'条件概率符号，读作“在……条件下”'),N(String.raw`\prod_{t=1}^{T}`,'把所有位置的概率相乘；上下标给出起止位置')]}),
 S('mask','掩码不是把未来分数设成零',['Softmax 前若未来位置的分数只设成 0，指数仍为 1，仍会分到权重。常用加性掩码把这些分数设为负无穷，归一化后权重成为零。','以 3 个输入位置为例：第一行只看第 1 位，第二行看前 2 位，第三行看全部 3 位。padding 掩码是另一约束，不能与因果掩码混淆。不同 PyTorch API 对布尔 mask 的 True 含义可能相反，必须看接口文档。']),
 S('objective','训练损失还要处理有效位置',['最大化序列概率通常实现为对目标词的负对数概率求和或平均。求平均时，分母应是有效目标数；把 padding 也计入会使不同长度批次的尺度不一致。','语言模型的因果掩码只限制网络的信息流，不能修复训练数据和评估数据重复造成的泄漏。评估还需明确上下文窗口、分词和样本边界。'])],implementation:[
 S('code','用三乘三矩阵亲眼验证未来权重为零',['这个示例显式构造加性掩码，不依赖任何库对布尔 mask 的特殊约定。数值 0、1、2 仅为教学 token ID。'],{code:`import torch
import torch.nn.functional as F
scores = torch.tensor([[1., 2., 3.], [1., 2., 3.], [1., 2., 3.]])
future = torch.triu(torch.ones(3, 3, dtype=torch.bool), diagonal=1)
weights = scores.masked_fill(future, float('-inf')).softmax(-1)
assert torch.equal(weights[future], torch.zeros(3))
assert torch.allclose(weights.sum(-1), torch.ones(3))
tokens = torch.tensor([[0, 1, 2, 3]])  # 0 acts as BOS here
inputs, targets = tokens[:, :-1], tokens[:, 1:]
logits = torch.randn(1, 3, 4, requires_grad=True)
loss = F.cross_entropy(logits.reshape(-1, 4), targets.reshape(-1))
loss.backward()
print(inputs, targets, weights, sep=chr(10))`}),
 S('leak-test','最有用的因果性测试',['固定序列前半段，只改变后半段输入。处于前半段的 logits 应保持不变，测试时关闭 dropout 并保证没有其他跨时间统计泄漏。','增量解码的查询长度可能为 1、键长度却很长，矩形 mask 的对齐约定尤其容易出错。不要把方阵训练时正确的 is_causal 用法不加检查地搬到缓存解码。'])]},misconceptions:['因果对角线通常允许读取当前输入，因为标签已经右移；不是允许看到当前预测答案。','自回归是一种概率分解与生成方式，不专属于 Transformer。'],references:[R('Attention Is All You Need','Vaswani et al.','https://arxiv.org/abs/1706.03762','解码器掩码与右移目标的原始说明。'),R('Scaled Dot Product Attention','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html','核对 is_causal、布尔 mask 与矩形注意力的接口行为。')]},
{
 id:'position-signals',title:'位置编码：相同词放在不同地方为何不同',english:'Sinusoidal Positions, RoPE & ALiBi',module:3,minutes:5,topicIds:['position-encoding'],prerequisites:['attention'],summary:'区分加在输入上的位置向量、旋转查询键的 RoPE、以及直接修改分数的 ALiBi。',
 sections:{quick:[
 S('order','先把词袋与句子分开',['“狗 咬 人”和“人 咬 狗”包含相同词，但关系不同。没有位置相关机制时，自注意力对 token 排列具有置换等变性：重排输入会相应重排输出，无法凭空识别原始顺序。','绝对位置向量加在 token 表示上；RoPE 对查询与键作依位置而变的旋转；ALiBi 在注意力分数中加入距离偏置。这三者注入位置的地方不同。'],{flow:[{label:'内容表示',detail:'词元本身的特征'},{label:'选定位置机制',detail:'输入相加、Q/K 旋转或分数偏置'},{label:'比较内容与位置',detail:'注意力对距离和方向敏感'},{label:'加权读取',detail:'仍从值向量中汇总内容'}]}),
 S('numbers','旋转不改变长度，却改变相对方向',['二维向量 [1, 0] 旋转四分之一圈变成 [0, 1]，长度仍为 1。若查询和键一起旋转同一角度，它们的点积不变；如果旋转角度不同，点积会随相对角度改变。','RoPE 利用这个性质，把位置差引入查询与键的比较。实际隐藏维度被成对旋转，不同维度对使用不同角度频率；下面只画一对维度。'],{checkpoint:{question:'RoPE 把位置向量直接加到每个 token 的 embedding 上吗？',answer:'标准 RoPE 的关键步骤是按位置旋转查询和键，而不是把一个位置向量加到 embedding 上。具体模型也可能另外使用其他位置机制。'}})],deep:[
 S('rotation','从一个二维旋转读懂 RoPE',['把角度设为零，旋转矩阵就是单位矩阵，输入不变；把角度设为半圈，则两个坐标都变号。'],{formula:String.raw`R(\phi)=\begin{bmatrix}\cos\phi&-\sin\phi\\\sin\phi&\cos\phi\end{bmatrix},\qquad q_m=R(m\omega)q,\quad k_n=R(n\omega)k`,formulaReading:'旋转矩阵由正弦与余弦组成；位置 m 的查询按 m 乘频率的角度旋转，位置 n 的键按 n 乘频率的角度旋转。',notation:[N(String.raw`R(\phi)`,'角度为 φ 的二维旋转矩阵','2×2'),N(String.raw`\phi`,'旋转角度，以弧度计'),N(String.raw`\sin,\cos`,'正弦和余弦三角函数'),N(String.raw`q,k`,'未添加位置旋转的查询与键列向量','2×1'),N(String.raw`m,n`,'查询与键的位置编号'),N(String.raw`\omega`,'该维度对使用的旋转角频率，每个位置前进多少弧度'),N(String.raw`q_m,k_n`,'旋转后的查询与键；下标为位置','2×1'),N(String.raw`-`,'负号；相邻符号为标量乘法或矩阵乘向量')]}),
 S('relative','相对位置为何出现在点积中',['两个旋转矩阵组合时角度相加，而转置对应反向旋转。因此查询位置和键位置的共同平移会抵消，保留下来的旋转由二者位置差决定。','这个结论描述一对旋转维度的点积结构，不等于“模型必然能外推到任意长度”。更长位置产生的角度组合、训练分布与频率设计仍影响泛化。']),
 S('alternatives','正弦绝对位置与 ALiBi',['经典正弦位置编码为各特征维提供不同频率的正弦或余弦值，再与输入表示相加；学习式绝对位置则把位置当作可学习查表索引。','ALiBi 为不同注意力头设置不同的距离惩罚斜率。在因果情形下，距离越远通常扣得越多；它改变的是 Softmax 前的分数，不需要为每个位置储存学习向量。','RoPE、ALiBi 的长度外推都应在实际上下文长度和任务上评估。位置编号错位、缓存重用时偏移错误，可能破坏本来正确的推理。'])],implementation:[
 S('code','用纯 Python 验证共同位移会抵消',['此例不需要 PyTorch。q 和 k 是二维列向量的列表表示；omega 是每个位置增加的角度。我们比较同时把两个位置加 10 前后的点积。'],{code:`import math
def rotate(v, angle):
    c, s = math.cos(angle), math.sin(angle)
    return [c*v[0]-s*v[1], s*v[0]+c*v[1]]
def dot(a, b):
    return sum(x*y for x, y in zip(a, b))
q, k, omega = [1.0, 0.3], [0.2, 0.8], 0.17
original = dot(rotate(q, 2*omega), rotate(k, 5*omega))
shifted = dot(rotate(q, 12*omega), rotate(k, 15*omega))
assert abs(original-shifted) < 1e-12
assert abs(dot(q,q)-dot(rotate(q,omega),rotate(q,omega))) < 1e-12
print(original, shifted)`}),
 S('dimensions','从两维推广时检查配对规则',['真实实现可以把相邻特征配成一对，也可能先把特征分成前后两半再配对。两种布局需要匹配对应的权重与缓存约定，不能只因为都叫 RoPE 就混用。','在多头注意力里，旋转通常作用于每个头的查询和键的某些或全部特征维度。先确认头维数、旋转比例和位置偏移，再比较不同实现的数值。'])]},misconceptions:['位置编码允许计算更长位置，不代表模型在更长上下文上一定可靠。','旋转保持向量长度，不代表旋转后的查询键点积对位置不敏感；共同平移抵消的是共同部分。'],references:[R('RoFormer: Enhanced Transformer with Rotary Position Embedding','Su et al.','https://arxiv.org/abs/2104.09864','二维推导与多维旋转位置表示。'),R('Train Short, Test Long','Press et al.','https://arxiv.org/abs/2108.12409','ALiBi 的距离偏置与长度外推实验。'),R('Attention Is All You Need','Vaswani et al.','https://arxiv.org/abs/1706.03762','原始正弦位置编码定义。')]},
{
 id:'transformer-organizations',title:'BERT、GPT、T5：同类组件，三种信息组织',english:'Encoder-only, Decoder-only & Encoder–Decoder',module:3,minutes:5,topicIds:['transformer-families','model-bert','model-gpt','model-t5'],prerequisites:['attention','causal-generation','sequence-translation'],summary:'从可见信息、训练目标和输入输出接口理解三类模型，而不是记一张名称排行榜。',
 sections:{quick:[
 S('visibility','先问每个位置允许看见谁',['Encoder-only 常让所有输入位置双向交流，适合为完整输入构建表示；decoder-only 语言模型按前缀预测下一个词；encoder–decoder 先读取来源，再让生成侧通过交叉注意力查询来源。','相同句子“我 [MASK] 音乐”：BERT 风格任务可利用左右两侧猜中间词；GPT 风格任务在生成“喜欢”时尚不能读取后面的“音乐”；T5 风格可以输入损坏文本，再生成被移除的片段。']),
 S('families','模型名称还包含训练方案',['BERT 原始方案使用掩码语言建模，并包含下一句预测任务；GPT 的核心是自回归预训练；T5 把任务统一成文本到文本，并系统研究预训练和迁移选择。','不能仅凭“有 TransformerEncoderLayer”就称完整模型为 BERT，也不能把所有 decoder-only 模型都视为同一个 GPT 配置。分词、位置机制、归一化、数据和目标都属于模型定义。'],{flow:[{label:'来源输入',detail:'可由双向编码器一次读取'},{label:'目标前缀',detail:'生成器只看已经给出的目标词'},{label:'交叉注意力',detail:'生成位置读取来源表示'},{label:'词表预测',detail:'逐步输出并由结束符终止'}],checkpoint:{question:'T5 解码器可以读取整个来源句，是否违反自回归生成？',answer:'不违反。自回归约束限制未生成的目标词；来源句已知，可以作为所有生成步骤的条件。'}})],deep:[
 S('conditional','把来源与目标两根时间轴分开',['来源句长度可以为 3，输出长度为 5。每个目标位置同时依赖完整来源和此前目标，交叉注意力因此是 5 行对 3 列，而不是把它们拼成同一轴。'],{formula:String.raw`p(y_{1:U}\mid x_{1:T})=\prod_{u=1}^{U}p(y_u\mid y_{<u},x_{1:T})`,formulaReading:'给定完整来源序列时，目标序列概率等于每一步目标词在此前目标和完整来源条件下的概率连乘。',notation:[N(String.raw`p`,'条件概率分布'),N(String.raw`x_{1:T}`,'长度为 T 的完整来源词元序列'),N(String.raw`T`,'来源序列长度'),N(String.raw`y_{1:U}`,'长度为 U 的完整目标词元序列'),N(String.raw`U`,'目标序列长度，与 T 可不同'),N(String.raw`u`,'目标位置编号，从 1 到 U'),N(String.raw`y_u`,'目标第 u 个词元'),N(String.raw`y_{<u}`,'严格早于 u 的目标前缀'),N(String.raw`\mid`,'读作“在……条件下”'),N(String.raw`\prod_{u=1}^{U}`,'将全部目标位置的条件概率相乘'),N(String.raw`,`,'分隔两个条件：目标前缀与来源序列')]}),
 S('bert-objective','双向读取怎样避免直接抄答案',['掩码语言模型不能把每个原词原样提供再要求原位置重建，否则会形成简单复制捷径。BERT 原始训练只选择部分位置作为目标，并用掩码、随机替换或保留原词的混合方式构造输入。','只对被选位置计算对应重建目标，和给所有位置做下一词预测是不同训练信号。双向表示适合完整输入理解，但不因此自动拥有标准左到右生成接口。']),
 S('interfaces','相同宽度不意味着相同组件数',['encoder-only 块通常有自注意力和 FFN；encoder–decoder 的解码块还多一个来源交叉注意力。decoder-only 名称不意味着一定存在“另一个编码器”的输出。','本网站的微型 Transformer 是教学计算，不代表 BERT、GPT 或 T5 的全部原版结构。T5 的相对位置偏置与归一化、GPT 各代具体配置，均应查对应公开文档，不能从品牌名称推断未公开细节。'])],implementation:[
 S('code','最小编码解码的三种张量',['PyTorch nn.Transformer 展示经典编码解码接口。source 是来源特征，target_prefix 是右移后的目标特征；随机数只验证维度和掩码，尚未包含词嵌入、位置编码、词表头或训练数据。'],{code:`import torch
from torch import nn
torch.manual_seed(0)
model = nn.Transformer(d_model=8, nhead=2, num_encoder_layers=1,
                       num_decoder_layers=1, dim_feedforward=16,
                       dropout=0.0, batch_first=True)
source = torch.randn(2, 3, 8)
target_prefix = torch.randn(2, 5, 8)
mask = nn.Transformer.generate_square_subsequent_mask(5)
output = model(source, target_prefix, tgt_mask=mask)
assert output.shape == (2, 5, 8)
output.sum().backward()
print('source:', source.shape, 'target output:', output.shape)`}),
 S('choose','选择架构时先写下任务接口',['若整个输入已经可见、目标是逐词标签或句子表示，双向编码器是自然起点；若目标是续写未知后缀，自回归解码器直接匹配目标；若来源与输出职责不同，编码解码提供明确分工。','这些是设计出发点，不是能力禁区。许多任务能用多种架构解决，最终要比较训练目标、数据、推理开销和实际质量，而非给架构排单一名次。'])]},misconceptions:['encoder 与 decoder 是信息流角色，不能只按 API 类名判断训练目标。','双向上下文更充分不代表对所有生成任务都更合适。'],references:[R('BERT','Devlin et al.','https://arxiv.org/abs/1810.04805','双向编码与掩码预训练的原始方案。'),R('Improving Language Understanding by Generative Pre-Training','Radford et al.','https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf','GPT 的生成式预训练来源。'),R('Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer','Raffel et al.','https://jmlr.org/papers/v21/20-074.html','T5 的文本到文本框架及系统比较。'),R('Transformer','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.Transformer.html','核对来源、目标和三类掩码接口。')]},
{
 id:'cached-decoding',title:'KV Cache、MQA 与 GQA：少重复计算，少搬动记忆',english:'Incremental Decoding & Shared Key–Value Heads',module:3,minutes:5,topicIds:['kv-cache'],prerequisites:['attention','causal-generation'],summary:'缓存过去的键和值，逐步扩展序列；再区分查询头数量与键值头数量如何影响内存。',
 sections:{quick:[
 S('reuse','生成第十一个词时，前十个为什么再算一次',['无缓存解码每一步都重新处理整个前缀。对确定性的因果 Transformer，过去 token 的层内表示不因追加未来 token 而改变，因此过去的键和值可以保存并重用。','新 token 只生成自己的查询、键和值，再把新键值追加到缓存中；查询仍需读取此前的键值，所以缓存没有让注意力开销变成与上下文长度无关。'],{flow:[{label:'已有 KV',detail:'各层保存已处理前缀的键和值'},{label:'新 token 投影',detail:'只计算当前 token 的查询、键和值'},{label:'追加并读取',detail:'新查询访问完整有效前缀'},{label:'预测下一词',detail:'保留更新后的各层缓存'}]}),
 S('heads','查询头可以多，键值头可以少',['MHA 为每个查询头配一组键和值；MQA 让所有查询头共享一组键值；GQA 把查询头分组，每组共享一组键值。','例如 8 个查询头配 2 个键值头，每组 4 个查询头共用键值，但查询仍各不相同。共享减少缓存和读取量，却改变了模型的参数化；不是加载普通模型后随便删几组缓存。'],{checkpoint:{question:'用了 KV cache 后，每生成一个新词只需关注最近一个词吗？',answer:'不是。新查询通常仍读取整个有效前缀的键和值；缓存减少重复投影，不自动改成局部注意力。'}})],deep:[
 S('memory','先数每层储存多少元素',['批次 1、上下文 100、2 个键值头、头宽 8、4 层、每元素 2 字节时，键和值共占 25,600 字节。这里只算缓存主体，不含模型权重、激活、分页和分配开销。'],{formula:String.raw`M_{\mathrm{bytes}}=2BLTH_{\mathrm{kv}}d_hs`,formulaReading:'缓存字节数等于键和值两份，乘批次、层数、已缓存长度、键值头数、每头维度和每元素字节数。',notation:[N(String.raw`M_{\mathrm{bytes}}`,'缓存主体的字节数；下标 bytes 表示字节单位'),N(String.raw`2`,'分别储存 Key 和 Value 两份张量'),N(String.raw`B`,'同时解码的序列数，即批次大小'),N(String.raw`L`,'需要缓存的注意力层数'),N(String.raw`T`,'当前已缓存的 token 数'),N(String.raw`H_{\mathrm{kv}}`,'键和值的头数；下标 kv 表示 key/value'),N(String.raw`d_h`,'每个键值头的特征维数；下标 h 表示 head'),N(String.raw`s`,'每个缓存元素占用的字节数，例如 FP16 为 2'),N(String.raw`BLTH_{\mathrm{kv}}d_hs`,'连写表示这些数量相乘；此式假设各层配置相同')]}),
 S('correctness','缓存等价需要哪些条件',['比较完整前缀重算与缓存解码时，必须使用相同权重、位置编号、掩码和数值约定，且关闭 dropout。若存在双向读取，追加未来词可能改变旧表示，简单缓存就不再等价。','使用 RoPE 时，旧键通常已经带正确位置旋转；追加新 token 不能把位置从零重新编号。滑动窗口丢弃旧缓存时，也要明确保留的绝对位置或偏移。']),
 S('prefill','Prefill 和 decode 的瓶颈不同',['Prefill 一次处理提示词，查询长度较大，容易形成较大的矩阵计算；逐 token decode 的查询很短，却要读取长缓存，更容易受内存带宽限制。','MQA/GQA 在这种解码情形下特别有价值，但最终加速取决于内核、硬件、批次和缓存布局。直接 repeat 共享键值头便于教学，却会在物理上复制张量，失去真正实现应有的内存优势。'])],implementation:[
 S('code','验证单头缓存与完整因果计算一致',['这里先对固定输入算好查询、键和值，再模拟逐步追加缓存，验证注意力核心的数值等价。它不是完整多层语言模型的推理器。'],{code:`import torch
torch.manual_seed(0)
x = torch.randn(5, 4)
wq, wk, wv = [torch.randn(4, 4) for _ in range(3)]
q, k, v = x @ wq, x @ wk, x @ wv
scores = q @ k.T / 2.0  # sqrt(head dimension=4)
future = torch.triu(torch.ones(5, 5, dtype=torch.bool), 1)
full = scores.masked_fill(future, -torch.inf).softmax(-1) @ v
cached_k, cached_v, outputs = [], [], []
for t in range(5):
    cached_k.append(k[t]); cached_v.append(v[t])
    keys, values = torch.stack(cached_k), torch.stack(cached_v)
    weights = (q[t:t+1] @ keys.T / 2.0).softmax(-1)
    outputs.append(weights @ values)
incremental = torch.cat(outputs)
assert torch.allclose(full, incremental, atol=1e-6)
print('maximum error:', (full-incremental).abs().max().item())`}),
 S('production','把缓存当成有生命周期的数据',['新请求、分支搜索、前缀复用和模型参数更新都会影响缓存有效性。不能在不同说话人、不同提示词或不同适配权重之间无条件复用旧缓存。','监测推理内存时，将权重、KV、临时激活和运行时保留内存分别估算。量化 KV 或分页管理可以降低开销，但也引入精度或调度上的取舍。'])]},misconceptions:['KV cache 不缓存所有未来答案，也不等于模型的永久知识。','MQA/GQA 不减少查询头数量，而是减少键值头数量。'],references:[R('Fast Transformer Decoding: One Write-Head is All You Need','Shazeer','https://arxiv.org/abs/1911.02150','共享键值对增量解码带宽的影响。'),R('GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints','Ainslie et al.','https://arxiv.org/abs/2305.13245','GQA 的分组设计与模型转换训练。')]},
{
 id:'attention-io',title:'FlashAttention：不把整张分数表搬来搬去',english:'IO-aware Exact Attention & Online Softmax',module:3,minutes:5,topicIds:['flashattention'],prerequisites:['attention','cached-decoding'],summary:'用分块与在线归一化理解内存访问优化，分清算出的函数和执行它的方法。',
 sections:{quick:[
 S('memory','中间矩阵可能比输入更大',['长度为 4096 的序列，单个注意力头的分数矩阵有 16,777,216 个元素。即使每个元素只占 2 字节，也约为 32 MiB；还没算其他头、梯度和概率矩阵。','标准实现若把分数与归一化权重完整写入显存，再读回来乘值向量，就会产生大量内存流量。FlashAttention 的核心是分块计算并融合步骤，避免完整中间表长期落在显存里。'],{flow:[{label:'读入小块 Q/K/V',detail:'利用较快的片上存储'},{label:'局部打分',detail:'只形成当前分块的分数'},{label:'更新在线统计量',detail:'调整归一化尺度并累计输出'},{label:'写回最终输出',detail:'不物化完整注意力权重矩阵'}]}),
 S('exact','精确算法与浮点完全相同不是一回事',['这里“exact”表示计算同一个稠密注意力函数，而非用稀疏选择或低秩近似替代。浮点加法顺序改变仍可能产生微小误差，不能要求所有设备上逐位一致。','它主要改变执行策略，不给模型新增一种语义能力；也不自动把标准稠密注意力的理论乘法量从二次变为线性。'],{checkpoint:{question:'FlashAttention 不存完整注意力矩阵，是否意味着它只关注少数 token？',answer:'不是。标准稠密版本仍计算完整注意力效果，只是分块和融合避免物化整张中间矩阵。'}})],deep:[
 S('online','遇到更大的分数，旧累计量要重新缩放',['先读到分数 1 和 2 时，可以减去 2 再求指数；之后读到分数 4，统一尺度变成减去 4，旧累计量需要乘上 exp(2−4)。这就能把两个分块合并成同一次 Softmax。'],{formula:String.raw`m'=\max(m,\max_j s_j),\qquad \ell'=e^{m-m'}\ell+\sum_j e^{s_j-m'}`,formulaReading:'新的最大值取旧最大值与新块最大值中较大者；新的指数和等于重缩放后的旧指数和，加新块在新尺度下的指数和。',notation:[N(String.raw`s_j`,'新分块第 j 个注意力分数','标量'),N(String.raw`j`,'新分块内部的位置索引'),N(String.raw`m`,'处理新块之前已见分数的最大值'),N(String.raw`m'`,'合并新块之后的最大值；撇号表示更新后，不是导数'),N(String.raw`\ell`,'旧累计指数和，使用旧最大值 m 作为减去的基准'),N(String.raw`\ell'`,'合并后的累计指数和，使用新最大值作为基准'),N(String.raw`\max`,'取最大值；内层对新块各位置，外层比较旧值与新块'),N(String.raw`\sum_j`,'对新分块内所有位置求和'),N(String.raw`e^z`,'自然指数函数，这里的 z 代表指数位置上的实数差'),N(String.raw`+,-`,'加、减；相邻数量表示乘法')]}),
 S('numerator','输出分子也要用同一个新尺度',['光更新分母还不够。输出是“指数权重乘值向量”的累计和除以指数和，因此向量分子也必须按相同倍率重新缩放，并加入新分块的加权值。','只有所有分块合并完成后才得到最终归一化结果。下面代码逐元素流式读取是为了说明数学；真正 GPU 内核会以矩阵块并行处理，不能据此代码速度推断 FlashAttention 性能。']),
 S('training','反向重算换掉昂贵的存储',['训练反向传播通常需要前向的中间信息。FlashAttention 的实现利用保存的归一化统计等信息，在反向中重算必要块，减少完整注意力矩阵的储存。','性能依赖头维、序列长度、dtype、掩码和硬件。调用统一 scaled_dot_product_attention 接口时，框架可能选择 Flash、其他优化内核或数学后端；在 CPU 上调用它不等于正在运行 CUDA FlashAttention。'])],implementation:[
 S('code','纯 Python 验证在线归一化',['values 是每个位置的二维值向量。numerator 是尚未除以分母的加权和，denominator 是指数和；每次最大值改变时，两者一起换尺度。'],{code:`import math
scores = [1.0, 2.0, 4.0, -1.0]
values = [[1., 0.], [0., 2.], [3., 1.], [-1., 2.]]
maximum, denominator = -math.inf, 0.0
numerator = [0.0, 0.0]
for score, value in zip(scores, values):
    new_max = max(maximum, score)
    old_scale = math.exp(maximum-new_max)
    weight = math.exp(score-new_max)
    numerator = [old_scale*a + weight*b for a,b in zip(numerator,value)]
    denominator = old_scale*denominator + weight
    maximum = new_max
online = [a/denominator for a in numerator]
exps = [math.exp(s-max(scores)) for s in scores]
reference = [sum(w*v[d] for w,v in zip(exps,values))/sum(exps) for d in range(2)]
assert max(abs(a-b) for a,b in zip(online,reference)) < 1e-12
print(online)`}),
 S('benchmark','核验优化时同时看结果、内存和耗时',['先在小尺寸检查优化输出与参考实现足够接近，再测试更长序列的峰值内存和时延。设置相同 dropout、mask 和缩放系数，否则比较的已经不是同一函数。','需要注意力热力图时，直接返回整张权重表可能抵消内存优势。可为少量选定查询重新计算权重，而不是要求所有训练步骤导出完整矩阵。'])]},misconceptions:['FlashAttention 是计算和内存访问算法，不是另一个训练好的语言模型。','二次规模的分数计算与二次规模的中间存储不是同一个成本，可以优化其中一个而保留另一个。'],references:[R('FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness','Dao et al.','https://arxiv.org/abs/2205.14135','分块、在线归一化与显存访问分析。'),R('FlashAttention-2','Dao','https://arxiv.org/abs/2307.08691','进一步理解并行化和工作划分。'),R('Scaled Dot Product Attention','PyTorch','https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html','了解后端选择、掩码和数值差异。')]},
];
