import type { Chapter } from './types';

/** Original teaching text and small CPU examples; paper links checked 2026-11-04. */
export const generativeChapters: Chapter[] = [
  {
    id: 'clip', title: 'CLIP：让图片与文字落在同一张地图上', english: 'Contrastive Language–Image Pretraining', module: 4, minutes: 18,
    topicIds: ['model-clip'], prerequisites: ['attention', 'information-theory'],
    summary: '给每张图片找到配套文字，用匹配任务学习可比较的图文向量。',
    sections: {
      quick: [
        { id: 'problem', title: '先从四张图片配四段文字开始', paragraphs: ['假设一个批次里有猫、狗、汽车和树四张图，以及四段对应说明。图片编码器看图片，文字编码器看文字，各自输出一个向量。训练要让正确配对的相似度高于其余组合。', '这产生一个 4 × 4 相似度表：第 2 行问“第二张图最像哪段文字”，第 2 列问“第二段文字最像哪张图”。两个方向都学习，而不是只训练图片分类器。'] },
        { id: 'flow', title: '两个编码器，一张匹配表', paragraphs: ['图像输入可以经过 CNN 或 ViT，文字输入经过文本 Transformer。最终先映射到相同维度，再把向量长度归一化到 1。'], flow: [{ label: '图文配对', detail: '批次中每对数据有同一个索引' }, { label: '分别编码', detail: '图像与文本各输出 B × d' }, { label: '两两比较', detail: '得到 B × B 相似度表' }, { label: '双向匹配', detail: '每行与每列都把正确配对作为目标' }] },
        { id: 'use', title: '不用重新训练也能换类别', paragraphs: ['识别图片时，可以先把“a photo of a cat”和“a photo of a dog”编码为两个文本向量，再比较图片与它们的相似度。替换候选文字，就能替换候选类别。', '这叫零样本分类，但仍依赖预训练学到的知识、提示文本和测试分布。CLIP 本身不逐字生成图片说明；那需要另一个生成式解码过程。'], checkpoint: { question: '一个批次有 4 对图文，匹配表中有多少个正配对？', answer: '有 4 个，位于对角线；其余 12 个组合作为批内负配对。现实中不同图片可能有同义说明，负配对不一定语义不相关。' } },
      ],
      deep: [
        { id: 'similarity', title: '把“像不像”变成数字', paragraphs: ['先把第 i 张图的向量记为 v_i，第 j 段文字的向量记为 t_j，它们都已归一化。两者点积就是余弦相似度。温度 τ 是正数，控制匹配概率有多尖锐。', '例如两项相似度是 0.8 和 0.2，温度取 0.1 后，送入 softmax 的分数是 8 和 2。降低温度放大分数差，不会改变谁排名第一。'], formula: String.raw`s_{ij}=\frac{v_i^\top t_j}{\tau}`, formulaReading: '第 i 张图与第 j 段文字的分数，等于两个单位向量的点积除以温度。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 's_{ij}', meaning: '第 i 张图与第 j 段文字的匹配分数', shape: '标量', example: '0.8 / 0.1 = 8' }, { symbol: 'v_i', meaning: '第 i 张图片的单位向量', shape: 'd 维向量' }, { symbol: 't_j', meaning: '第 j 段文字的单位向量', shape: 'd 维向量' }, { symbol: 'i,j', meaning: '批次中的图片索引、文字索引' }, { symbol: '\\top', meaning: '转置；这里使两个向量相乘成为点积' }, { symbol: '\\tau', meaning: '正的温度参数', example: '0.1' }] },
        { id: 'objective', title: '为什么图片方向与文字方向都算一次', paragraphs: ['对于每一行，把正确配对的列号作为分类目标；再转置匹配表，重复相同操作。平均两个交叉熵，就同时约束“图找文”和“文找图”。', '原始 CLIP 学习一个对数温度对应的缩放参数。温度过小会让概率过度尖锐；只增加批次大小也不自动消除错误配对、重复图文和社会偏差。', '对比学习主要对齐样本级语义。单个词与某块像素的对应并没有在这个损失里直接标注，因此相似度高不等于每个细节都正确。'] },
      ],
      implementation: [
        { id: 'code', title: '运行一个四对样本的对齐实验', paragraphs: ['下面仅需 PyTorch，在 CPU 上运行。用四维合成特征代替图片和文字，训练两个线性投影；打印损失和每张“图”选择的“文字”编号。它演示对齐目标，不是训练完整 CLIP。'], code: String.raw`import torch
import torch.nn.functional as F
torch.manual_seed(7)
torch.set_num_threads(1)
images = torch.eye(4)
texts = torch.eye(4)[[2, 0, 3, 1]]
image_encoder = torch.nn.Linear(4, 4, bias=False)
text_encoder = torch.nn.Linear(4, 4, bias=False)
params = list(image_encoder.parameters()) + list(text_encoder.parameters())
optimizer = torch.optim.Adam(params, lr=0.03)
labels = torch.arange(4)
for step in range(150):
    v = F.normalize(image_encoder(images), dim=-1)
    t = F.normalize(text_encoder(texts), dim=-1)
    scores = v @ t.T / 0.1
    loss = (F.cross_entropy(scores, labels)
            + F.cross_entropy(scores.T, labels)) / 2
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
with torch.no_grad():
    scores = F.normalize(image_encoder(images), dim=-1) @ F.normalize(text_encoder(texts), dim=-1).T
print('loss:', round(loss.item(), 4))
print('selected text rows:', scores.argmax(-1).tolist())
assert scores.shape == (4, 4)` },
        { id: 'inspection', title: '怎样读结果，怎样扩展', paragraphs: ['texts 的行顺序已经构成配对关系，所以训练目标仍是 0、1、2、3，不是 one-hot 里非零元素的位置。这个区别能帮助区分“类别标签”与“样本对应”。', '实际 CLIP 把这里的线性层换成大编码器，并使用大量配对数据。做检索时可缓存图像或文本向量；做生成、细粒度定位或语音对齐时，则要重新检查任务和监督方式。'] },
      ],
    },
    misconceptions: ['CLIP 的相似度不等于校准后的真实类别概率。', '对比式双编码器不是自动生成文字的语言模型。', '批内非对应样本可能共享语义，不能认为所有负配对都完全不同。'],
    references: [{ title: 'Learning Transferable Visual Models From Natural Language Supervision', author: 'Radford et al., 2021', url: 'https://arxiv.org/abs/2103.00020', reason: 'CLIP 原始论文：双编码器、对称对比损失与零样本迁移。' }],
  },
  {
    id: 'autoencoder-vae', title: 'Autoencoder 与 VAE：压缩之后，怎样生成？', english: 'Autoencoder · Variational Autoencoder', module: 4, minutes: 23,
    topicIds: ['model-autoencoder'], prerequisites: ['backprop', 'probability-likelihood', 'information-theory'], summary: '普通自编码器学习重建，VAE 还把潜变量组织成可采样的概率模型。',
    sections: {
      quick: [
        { id: 'problem', title: '把两个相关数字压进一个表示', paragraphs: ['若数据总是接近“第二个数字等于第一个数字的两倍”，就不必独立记住两个数字。编码器可以找出更紧凑的表示，解码器再从表示还原输入。', '普通 Autoencoder 把每个输入映射到一个确定的潜向量。训练时重建得很好，不代表随便从标准正态分布取一个潜向量也能解码成合理数据。'] },
        { id: 'flow', title: 'VAE 给每个输入一个分布', paragraphs: ['VAE 的编码器输出潜向量的均值和方差，而不是只输出一个固定点。训练时从这个分布取样重建，同时让它接近预先选择的先验。'], flow: [{ label: '观察输入', detail: '例如一个二维数据点' }, { label: '预测分布', detail: '编码器给出均值与对数方差' }, { label: '随机取样', detail: '用重参数化得到潜向量' }, { label: '解码重建', detail: '重建项与 KL 项一起训练' }] },
        { id: 'tradeoff', title: '既要记住输入，也要方便取样', paragraphs: ['重建项希望编码尽量保留细节；KL 项约束编码分布不要任意偏离先验。两项存在张力，不能简单认为任一项越小越好。', '生成时先从先验采样，再送进解码器；这一步不需要输入图片，也不需要编码器。'], checkpoint: { question: '把潜变量改成均值 0、方差 1，KL 项会怎样？这是否说明模型已经学会生成？', answer: '相对标准正态先验，KL 为 0。但解码器可能重建很差，甚至完全忽略潜变量；要同时检查重建、样本质量与潜变量是否被使用。' } },
      ],
      deep: [
        { id: 'reparameterization', title: '随机采样为何仍能反向传播', paragraphs: ['设编码器输出均值 μ 和标准差 σ。先独立采一个标准正态噪声 ε，再做“μ 加 σ 乘 ε”。随机性被放在 ε 中，而 μ、σ 到结果的计算仍然可微。', '例如 μ=2、σ=0.5、这次采到 ε=−1，得到潜变量 z=1.5。代码通常输出对数方差，再取其一半的指数得到标准差，以保证它为正。'], formula: String.raw`z=\mu+\sigma\odot\epsilon,\qquad \epsilon\sim\mathcal N(0,I)`, formulaReading: '潜变量等于均值加上标准差与标准正态噪声的逐元素乘积。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 'z', meaning: '送入解码器的潜向量', shape: 'd 维' }, { symbol: '\\mu', meaning: '编码器预测的每一维均值', shape: 'd 维' }, { symbol: '\\sigma', meaning: '每一维正标准差', shape: 'd 维' }, { symbol: '\\odot', meaning: '相同位置的元素相乘' }, { symbol: '\\epsilon', meaning: '独立采样的噪声向量', shape: 'd 维' }, { symbol: '\\sim', meaning: '从右侧概率分布采样' }, { symbol: '\\mathcal N(0,I)', meaning: '均值为零、协方差为单位矩阵的多维正态分布' }, { symbol: 'I', meaning: '单位矩阵；表示各维噪声方差为 1、彼此独立', shape: 'd × d' }, { symbol: '0', meaning: '这里是全零均值向量' }] },
        { id: 'loss', title: 'KL 的方向不能颠倒', paragraphs: ['把输入记为 x，编码分布记为 q，先验记为 p，解码器给出的条件分布记为 p_θ。训练常最小化下面的负 ELBO：第一项让重建有高概率，第二项是从编码分布到先验的 KL。', '方向是 KL(q(z|x) || p(z))，不是 KL(p(z) || q(z|x))。这也不是编码分布与真实后验之间的 KL；后者用于解释 ELBO 与真实对数似然的差距。', '若编码分布是对角高斯，先验是标准正态，每一维的 KL 为“均值平方 + 方差 − 1 − 对数方差”的一半。先对潜维度求和，再对批次取平均。'], formula: String.raw`\mathcal L=-\mathbb E_{z\sim q_\phi(z\mid x)}[\log p_\theta(x\mid z)]+D_{\mathrm{KL}}(q_\phi(z\mid x)\Vert p(z))`, formulaReading: '损失等于重建负对数概率的平均，加上编码分布相对先验的 KL 散度。', notation: [{ symbol: '\\mathcal L', meaning: '要最小化的负 ELBO 损失' }, { symbol: 'x', meaning: '观察到的数据' }, { symbol: 'z', meaning: '潜变量' }, { symbol: '\\phi,\\theta', meaning: '分别是编码器、解码器的全部可训练参数' }, { symbol: 'q_\\phi(z\\mid x)', meaning: '看到输入 x 后，编码器给出的潜变量分布' }, { symbol: 'p_\\theta(x\\mid z)', meaning: '给定潜变量 z，解码器给出的数据分布' }, { symbol: 'p(z)', meaning: '事先选定的潜变量先验，例子采用标准正态' }, { symbol: '\\mathbb E', meaning: '对指定采样分布求平均，代码用随机样本估计' }, { symbol: '\\sim', meaning: '按右边分布采样' }, { symbol: '\\log', meaning: '自然对数' }, { symbol: '\\mid', meaning: '条件于；左边变量的分布以右边已知信息为条件' }, { symbol: 'D_{\\mathrm{KL}}(q\\Vert p)', meaning: '按 q 求平均的 log(q/p)，度量 q 相对 p 的差异；顺序有意义' }] },
        { id: 'limits', title: '重建误差不是唯一评价', paragraphs: ['若解码器的观测噪声方差固定为 1，平方误差的一半对应高斯负对数似然，差一个与参数无关的常数。二值观测可以使用伯努利似然，但不能把任意连续像素模型都当成同一个损失。', 'KL 权重改成别的数会改变目标，不再是这里权重为 1 的标准负 ELBO。表达能力太强的解码器可能出现后验坍塌：编码分布接近先验，却几乎不传递输入信息。'] },
      ],
      implementation: [
        { id: 'code', title: '在二维合成数据上训练一个 VAE', paragraphs: ['代码只需 PyTorch，不下载数据。潜维度取 2，重建项采用方差固定为 1 的高斯似然；打印的 loss 不包含常数。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(3)
torch.set_num_threads(1)
encoder = nn.Sequential(nn.Linear(2, 16), nn.Tanh(), nn.Linear(16, 4))
decoder = nn.Sequential(nn.Linear(2, 16), nn.Tanh(), nn.Linear(16, 2))
opt = torch.optim.Adam(list(encoder.parameters()) + list(decoder.parameters()), lr=0.01)
for _ in range(300):
    u = torch.randn(64, 1)
    x = torch.cat([u, 2 * u + 0.1 * torch.randn_like(u)], dim=1)
    mu, logvar = encoder(x).chunk(2, dim=-1)
    z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)
    reconstruction = decoder(z)
    nll = 0.5 * (reconstruction - x).square().sum(-1)
    kl = 0.5 * (mu.square() + logvar.exp() - 1 - logvar).sum(-1)
    loss = (nll + kl).mean()
    opt.zero_grad()
    loss.backward()
    opt.step()
with torch.no_grad():
    samples = decoder(torch.randn(5, 2))
print('negative ELBO without constant:', round(loss.item(), 4))
print('generated decoder means:', samples)
assert samples.shape == (5, 2)` },
        { id: 'inspect', title: '代码输出的究竟是什么', paragraphs: ['samples 是解码器的高斯均值。若要从完整观测模型采样，还需在这些均值上加方差为 1 的高斯噪声；只显示均值是常见的可视化选择，不能把两者混同。', '把 z 固定为 μ 就得到确定性的重建路径；它仍使用已训练的 VAE，而不是把训练目标变成普通 AE。记录重建项与 KL 各自的数值，才能看出模型有没有只优化其中一项。'] },
      ],
    },
    misconceptions: ['AE 的低维瓶颈不自动保证能从标准正态采样。', 'VAE 的 KL 正则是编码分布到先验的方向。', '随机潜变量可以通过重参数化训练；并不要求对随机数生成器本身求导。'],
    references: [{ title: 'Auto-Encoding Variational Bayes', author: 'Kingma & Welling, 2013', url: 'https://arxiv.org/abs/1312.6114', reason: '重参数化、变分下界及高斯潜变量模型的原始推导。' }],
  },
  {
    id: 'gan', title: 'GAN：用一个对手学习生成', english: 'Generative Adversarial Networks', module: 4, minutes: 19, topicIds: ['model-gan'], prerequisites: ['backprop', 'probability-likelihood'], summary: '生成器造样本，判别器比较真伪；两者轮流学习，而不是共享一个固定监督目标。',
    sections: {
      quick: [
        { id: 'problem', title: '只知道真实样本，不知道每个噪声该生成什么', paragraphs: ['假设真实数据是接近数字 2 的一群数。生成器接收随机噪声，输出一个数字，但没有“这个噪声应对应哪个真实样本”的标签。', '判别器提供学习信号：它看到真实数据与生成数据，学习区分两者；生成器则学习让自己的输出被判为真实。最终希望生成分布接近真实分布。'] },
        { id: 'flow', title: '一次训练要分成两个回合', paragraphs: ['更新判别器时把假样本当成固定数据。更新生成器时保持判别器参数固定，但仍让梯度穿过判别器传回生成器。'], flow: [{ label: '采真与假', detail: '真实数据 + 噪声经过生成器的输出' }, { label: '更新判别器', detail: '真标 1、假标 0；假样本停止梯度' }, { label: '再造假样本', detail: '保留生成器的计算图' }, { label: '更新生成器', detail: '让判别器对假样本输出更高真实概率' }] },
        { id: 'limits', title: '为什么看见几张好图仍不够', paragraphs: ['生成器可能只学会少数几种样本，这叫模式坍塌。漂亮的个例不能证明覆盖了真实分布的所有主要模式。', '理论上的理想均衡不保证两个有限神经网络用梯度下降一定达到。判别器太弱不能提供好反馈，太容易识别假样本也可能让某些生成目标的梯度变弱。'], checkpoint: { question: '更新判别器时，为什么通常对生成样本调用 detach？', answer: '这一回合只需要更新判别器。detach 切断生成器计算图，避免无用的生成器梯度；生成器回合必须重新保留这条路径。' } },
      ],
      deep: [
        { id: 'objective', title: '分清原始极小极大目标和常用训练目标', paragraphs: ['把真实样本记为 x，随机输入记为 z，生成器记为 G，判别器给出的真实概率记为 D。下面写的是一次真样本和一次假样本的损失，训练时再对批次取平均。', '判别器最小化真样本和假样本的二分类负对数损失。生成器这里使用非饱和损失：尽量提高假样本的真实概率。它不同于原始极小极大版本里最小化 log(1−D(G(z))) 的生成目标，但希望达到相同的理想分布匹配。'], formula: String.raw`L_D=-\log D(x)-\log(1-D(G(z))),\qquad L_G=-\log D(G(z))`, formulaReading: '判别器损失奖励识别真与假；生成器损失奖励它的样本被判为真。两个损失分别更新不同网络。', notation: [{ symbol: 'L_D,L_G', meaning: '分别用于判别器、生成器的损失；下标标明更新对象' }, { symbol: 'x', meaning: '一个真实数据样本' }, { symbol: 'z', meaning: '从简单分布采样的随机输入' }, { symbol: 'G(z)', meaning: '生成器从随机输入生成的假样本' }, { symbol: 'D(x)', meaning: '判别器认为输入是真实数据的概率，介于 0 和 1' }, { symbol: 'D(G(z))', meaning: '判别器给假样本的真实概率' }, { symbol: '\\log', meaning: '自然对数' }, { symbol: '1-D(G(z))', meaning: '判别器给假样本的虚假概率' }] },
        { id: 'gradients', title: '冻结参数不等于停止所有梯度', paragraphs: ['更新生成器时，可以把判别器参数的 requires_grad 设为 False。这仍保留“判别器输出对输入”的导数，因此生成器能收到反馈。若把整个判别器前向放进 no_grad，反馈路径也会消失。', '实际实现使用 logits 和 BCEWithLogitsLoss，避免先 sigmoid 再 log 的数值不稳定。标签 1 和 0 对应真实/虚假；生成器回合把假样本的目标设为 1，不是为了修改数据标签，而是定义它要优化的对抗目标。'] },
      ],
      implementation: [
        { id: 'code', title: '一个一维分布的完整交替训练', paragraphs: ['只需 PyTorch。训练真实均值约为 2、标准差约为 0.4 的一维数据；输出统计仅用于检查训练行为，300 步不保证收敛。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(5)
torch.set_num_threads(1)
G = nn.Sequential(nn.Linear(1, 16), nn.Tanh(), nn.Linear(16, 1))
D = nn.Sequential(nn.Linear(1, 16), nn.LeakyReLU(0.2), nn.Linear(16, 1))
og = torch.optim.Adam(G.parameters(), lr=0.003)
od = torch.optim.Adam(D.parameters(), lr=0.003)
bce = nn.BCEWithLogitsLoss()
for _ in range(300):
    real = 2 + 0.4 * torch.randn(64, 1)
    fake = G(torch.randn(64, 1)).detach()
    ld = bce(D(real), torch.ones_like(real)) + bce(D(fake), torch.zeros_like(fake))
    od.zero_grad()
    ld.backward()
    od.step()
    for p in D.parameters():
        p.requires_grad_(False)
    fake = G(torch.randn(64, 1))
    lg = bce(D(fake), torch.ones_like(fake))
    og.zero_grad()
    lg.backward()
    og.step()
    for p in D.parameters():
        p.requires_grad_(True)
with torch.no_grad():
    generated = G(torch.randn(1000, 1))
print('D / G loss:', ld.item(), lg.item())
print('generated mean / std:', generated.mean().item(), generated.std().item())` },
        { id: 'inspect', title: '判断是不是只会输出一个数', paragraphs: ['如果生成均值接近 2，但标准差接近 0，模型可能几乎只生成 2。这说明只比较均值会漏掉模式覆盖和多样性问题。', '可把真实数据改成两个远离的高斯簇，再观察模型是否只生成其中一个。需要比较分布、训练曲线和多次随机种子，不能仅凭生成器损失变小判定生成质量提高。'] },
      ],
    },
    misconceptions: ['GAN 不需要为每个噪声指定一个对应的真实输出。', '生成器损失下降不保证样本质量或多样性单调提高。', '非饱和生成目标不是原始 minimax 目标的同一个代数表达式。'],
    references: [{ title: 'Generative Adversarial Networks', author: 'Goodfellow et al., 2014', url: 'https://arxiv.org/abs/1406.2661', reason: '对抗训练框架、理想均衡与非饱和训练建议。' }],
  },
  {
    id: 'normalizing-flow', title: 'Normalizing Flow：让概率随着可逆变换移动', english: 'Normalizing Flow · Change of Variables', module: 4, minutes: 20, topicIds: ['model-normalizing-flow'], prerequisites: ['matrix-calculus-autodiff', 'probability-likelihood'], summary: '用可逆映射改变分布，同时精确记录空间体积的伸缩。',
    sections: {
      quick: [
        { id: 'problem', title: '把坐标拉长两倍，密度会怎样', paragraphs: ['先想一维标准正态噪声。若把每个点变成“原值乘 2，再加 3”，分布中心移到 3，宽度扩大两倍。相同的概率质量铺在更宽区域，因此密度要除以 2。', 'Normalizing Flow 把这种体积修正推广到多维、可学习的非线性变换。它不仅能生成样本，还能在变换可逆且行列式可计算时给出精确密度。'] },
        { id: 'flow', title: '生成和算密度走相反方向', paragraphs: ['约定正向 f 从简单噪声 z 走向数据 x。生成时直接使用 f；给数据算密度时，先逆变换回 z，再做体积修正。'], flow: [{ label: '取简单噪声', detail: 'z 的密度已知' }, { label: '可逆变换', detail: 'x=f(z)，保留体积变化信息' }, { label: '观察数据', detail: '把 x 通过逆映射还原成 z' }, { label: '修正密度', detail: '用 Jacobian 行列式校正空间伸缩' }] },
        { id: 'constraints', title: '为什么不能随意放一个普通 MLP', paragraphs: ['一个把 8 维压到 2 维的普通网络通常无法一一还原输入，不满足这里的可逆要求。即使维度相同，也需要保证映射可逆，并高效计算 Jacobian 的行列式。', '可逆性给了精确密度，却限制了层结构。离散像素还涉及连续化处理；连续密度的数值也不等于一个离散样本的概率。'], checkpoint: { question: '一维 x=2z+3，已知 z 处的密度是 0.4，那么对应 x 处的密度是多少？', answer: '是 0.2。坐标放大两倍，密度除以两倍；对数密度减去 log 2。' } },
      ],
      deep: [
        { id: 'jacobian', title: '行列式的正负号取决于映射方向', paragraphs: ['把噪声到数据的映射记为 f，Jacobian 记为 J_f；它描述 f 在当前点附近对各个方向的局部伸缩。行列式的绝对值给出体积倍率。', '下面使用的是“生成方向”的 Jacobian，所以对数密度要减去其绝对行列式的对数。如果改用数据到噪声的逆映射，就应加上逆映射的 log absolute determinant，两种写法等价。'], formula: String.raw`\log p_X(x)=\log p_Z(z)-\log|\det J_f(z)|,\qquad z=f^{-1}(x)`, formulaReading: '数据的对数密度等于对应噪声的对数密度，减去生成变换的对数体积倍率；噪声由逆映射求得。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 'x,z', meaning: '分别是数据坐标与简单噪声坐标', shape: '同样的 d 维' }, { symbol: 'p_X,p_Z', meaning: '数据空间与噪声空间的概率密度；X、Z 用来区分两个空间' }, { symbol: 'f', meaning: '从噪声到数据的可逆映射' }, { symbol: 'f^{-1}', meaning: 'f 的逆函数，不是逐元素倒数' }, { symbol: 'J_f(z)', meaning: 'f 在 z 处的 Jacobian；元素是输出分量对输入分量的偏导', shape: 'd × d' }, { symbol: '\\det', meaning: '矩阵行列式' }, { symbol: '|\\cdot|', meaning: '取绝对值，因为密度修正使用正体积倍率' }, { symbol: '\\log', meaning: '自然对数' }] },
        { id: 'coupling', title: 'Real NVP 怎样避开昂贵的全矩阵行列式', paragraphs: ['把输入拆成两组。第一组不变，用它预测第二组的缩放与平移。由于缩放用指数表示，它总为正，因此第二组能直接逆变换。', '例如第一维保持不变，第二维乘 exp(0.2×第一维) 再加 0.3×第一维。Jacobian 是三角矩阵，log determinant 就是缩放指数 0.2×第一维。交换两组、叠加多层后，两组都能被改变。', '单个耦合层只更新一部分坐标，表达能力有限。实际模型要交替分组或混合通道；不是只有一次二维仿射变换。'] },
      ],
      implementation: [
        { id: 'code', title: '验证一次耦合变换与密度方向', paragraphs: ['这个完整例子只需 PyTorch：生成、精确逆变换、计算 log density，并验证样本能还原。它是 Real NVP 风格的一层，不是已训练的图像生成器。'], code: String.raw`import math
import torch
torch.manual_seed(11)
z = torch.randn(5, 2, dtype=torch.float64)
s = 0.2 * z[:, :1]
t = 0.3 * z[:, :1]
x = torch.cat([z[:, :1], z[:, 1:] * s.exp() + t], dim=1)
s_inverse = 0.2 * x[:, :1]
t_inverse = 0.3 * x[:, :1]
recovered = torch.cat([x[:, :1], (x[:, 1:] - t_inverse) * (-s_inverse).exp()], dim=1)
log_pz = -0.5 * (recovered.square() + math.log(2 * math.pi)).sum(-1)
log_abs_det_forward = s.squeeze(-1)
log_px = log_pz - log_abs_det_forward
assert torch.allclose(z, recovered, atol=1e-10)
print('reconstruction error:', (z - recovered).abs().max().item())
print('data log density:', log_px)
# Scalar volume check: x = 2z + 3, so density is divided by 2.
assert abs(0.4 / 2 - 0.2) < 1e-12` },
        { id: 'extend', title: '从验证代码到可训练模型', paragraphs: ['把计算 s 和 t 的固定系数换成小网络，就能对真实样本的负对数似然训练。要限制缩放范围，避免 exp 溢出；每层都要保存 log determinant 并求和。', '检查 inverse(forward(z)) 是否近似等于 z，并用小维度自动微分 Jacobian 对比手写行列式。这种双重检查能发现最常见的符号反向和遗漏维度求和问题。'] },
      ],
    },
    misconceptions: ['可逆流的生成方向 log determinant 在密度公式里带负号。', '连续概率密度可以大于 1；它不是离散事件概率。', 'Flow Matching 与使用离散可逆层直接优化精确似然不是同一训练程序。'],
    references: [{ title: 'Density estimation using Real NVP', author: 'Dinh, Sohl-Dickstein & Bengio, 2016', url: 'https://arxiv.org/abs/1605.08803', reason: '仿射耦合层、逆变换与精确似然计算。' }],
  },
  {
    id: 'diffusion', title: 'Diffusion：从去噪任务学会生成', english: 'DDPM · Latent Diffusion', module: 4, minutes: 25, topicIds: ['model-diffusion'], prerequisites: ['probability-likelihood', 'backprop'], summary: '训练时对真实数据加已知噪声；生成时用学到的去噪信息逐步构造新样本。',
    sections: {
      quick: [
        { id: 'problem', title: '为什么先把清楚的数据弄乱', paragraphs: ['给模型一个被噪声污染的样本，并告诉它污染程度，让它预测其中的噪声。这种监督很便宜：原数据和人为加入的噪声都已知。', '不同噪声程度对应不同难度。轻噪声时恢复细节，重噪声时需要学习数据整体结构。训练好的模型可从近似纯噪声开始，反复使用这些信息生成新样本。'] },
        { id: 'flow', title: '训练一次随机抽时刻，采样则走很多步', paragraphs: ['训练不必先把同一个样本逐步加噪所有次数；可以直接采一个时刻并得到它的带噪样本。采样通常需要按时间顺序反复调用模型。'], flow: [{ label: '真实样本', detail: '选一个数据点和随机时刻' }, { label: '直接加噪', detail: '用已知信号与噪声比例生成带噪输入' }, { label: '预测噪声', detail: '模型接收带噪样本与时刻' }, { label: '反向采样', detail: '从随机噪声开始逐步执行去噪更新' }] },
        { id: 'latent', title: 'Latent Diffusion 把计算移到哪里', paragraphs: ['像素空间很大。Latent Diffusion 先用已训练的自编码器把图像压成潜表示，再在这个空间训练扩散模型；生成结束后由解码器还原图像。', '例如从 512×512 像素压到更小的潜网格可以降低计算量，但潜表示仍需保留生成所需的信息。文本条件可通过交叉注意力进入去噪网络；扩散本身不等于文本编码器。'], checkpoint: { question: '训练噪声预测器时，输入的是干净样本吗？目标又是什么？', answer: '输入是带噪样本以及噪声时刻；DDPM 常见参数化的目标是这次人为采样的噪声。干净样本用于构造监督，但不能直接泄漏给模型。' } },
      ],
      deep: [
        { id: 'forward', title: '一个带噪样本由哪两部分组成', paragraphs: ['用 x₀ 表示干净数据，用 ε 表示新采样的标准正态噪声。累计信号保留系数记为 ᾱ_t，取值在 0 与 1 之间；下标 t 表示当前时刻。', '例如 ᾱ_t=0.64 时，信号系数是 0.8，噪声系数是 0.6。若干净值为 2、这次噪声为 −1，带噪值就是 1。这里平方根系数的平方相加为 1，不是系数本身相加为 1。'], formula: String.raw`x_t=\sqrt{\bar\alpha_t}\,x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,\qquad\epsilon\sim\mathcal N(0,I)`, formulaReading: '当前带噪样本等于按信号保留比例缩放的干净数据，加上按剩余比例缩放的标准正态噪声。', notation: [{ symbol: 'x_t', meaning: '时刻 t 的带噪数据', shape: '与原数据相同' }, { symbol: 'x_0', meaning: '干净数据；下标 0 表示未加噪起点' }, { symbol: 't', meaning: '离散加噪时刻' }, { symbol: '\\bar\\alpha_t', meaning: '直到时刻 t 的累计信号保留系数；横线表示累计乘积，不是平均' }, { symbol: '\\sqrt{\\cdot}', meaning: '非负平方根' }, { symbol: '\\epsilon', meaning: '本次采样的噪声', shape: '与数据相同' }, { symbol: '\\sim', meaning: '按指定分布采样' }, { symbol: '\\mathcal N(0,I)', meaning: '零均值、单位协方差的标准多维正态' }, { symbol: 'I', meaning: '单位协方差矩阵，各维噪声独立且方差为 1' }] },
        { id: 'reverse', title: '反向过程不是把同一份噪声简单减回去', paragraphs: ['训练时知道 ε；真实生成时并不知道，因此要用网络根据当前带噪样本和时刻来预测它。DDPM 通过已知噪声日程，把预测噪声转换为反向高斯分布的均值，并按选定方差采样。', '记每一步加入的方差为 beta，单步保留系数为 alpha=1−beta，累计系数是所有 alpha 的乘积。下面代码使用标准 DDPM 噪声预测均值和后验方差；最后一步不再加随机噪声。', '扩散也可用 score 或 velocity 参数化，并有确定性采样器。因此“扩散一定每步随机、Flow Matching 一定只是减噪”的二分法不成立；要检查具体路径、预测目标和求解器。'] },
      ],
      implementation: [
        { id: 'code', title: '训练并采样一个一维 DDPM', paragraphs: ['只需 PyTorch，使用两个一维高斯簇作为数据。这个小模型展示完整训练和反向采样，训练步数刻意较少，不以生成质量作为论文复现结果。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(8)
torch.set_num_threads(1)
T = 64
beta = torch.linspace(0.001, 0.12, T)
alpha = 1 - beta
abar = alpha.cumprod(0)
previous = torch.cat([torch.ones(1), abar[:-1]])
variance = beta * (1 - previous) / (1 - abar)
net = nn.Sequential(nn.Linear(2, 32), nn.SiLU(), nn.Linear(32, 32), nn.SiLU(), nn.Linear(32, 1))
opt = torch.optim.Adam(net.parameters(), lr=0.003)
for _ in range(400):
    clean = (torch.randint(0, 2, (64, 1)).float() * 2 - 1) * 2 + 0.3 * torch.randn(64, 1)
    t = torch.randint(T, (64,))
    eps = torch.randn_like(clean)
    a = abar[t, None]
    noisy = a.sqrt() * clean + (1 - a).sqrt() * eps
    prediction = net(torch.cat([noisy, t[:, None].float() / (T - 1)], 1))
    loss = (prediction - eps).square().mean()
    opt.zero_grad(); loss.backward(); opt.step()
with torch.no_grad():
    x = torch.randn(1000, 1)
    for t in reversed(range(T)):
        time = torch.full_like(x, t / (T - 1))
        eps = net(torch.cat([x, time], 1))
        mean = (x - beta[t] * eps / (1 - abar[t]).sqrt()) / alpha[t].sqrt()
        x = mean + variance[t].sqrt() * torch.randn_like(x) if t > 0 else mean
print('noise MSE:', loss.item())
print('sample mean / std:', x.mean().item(), x.std().item())
assert torch.isfinite(x).all()` },
        { id: 'inspect', title: '不要把简化模型当作图像系统', paragraphs: ['代码的 t=0 对应教材公式里的第一个带噪时刻；previous[0]=1 代表它前面是干净数据，因此最后一次反向更新的方差为零。这个索引约定避免把干净 x₀ 与数组第 0 项混淆。', '真实 Latent Diffusion 还包含自编码器、条件编码器、去噪主干与采样配置。这里没有图像压缩或文本条件，也没有下载任何预训练权重。需要另画直方图并延长训练，才能评价两个数据模式是否被恢复。'] },
      ],
    },
    misconceptions: ['预测噪声不意味着模型在生成时知道最初噪声的正确答案。', '训练随机抽一个时刻，不等于采样只需调用一次模型。', '潜空间扩散仍需要把最终潜变量解码回数据空间。'],
    references: [{ title: 'Denoising Diffusion Probabilistic Models', author: 'Ho, Jain & Abbeel, 2020', url: 'https://arxiv.org/abs/2006.11239', reason: '前向加噪闭式表达、噪声预测训练与反向采样。' }, { title: 'High-Resolution Image Synthesis with Latent Diffusion Models', author: 'Rombach et al., 2022', url: 'https://arxiv.org/abs/2112.10752', reason: '自编码器潜空间、条件机制与扩散生成的分工。' }],
  },
  {
    id: 'dit', title: 'DiT：用 Transformer 承担去噪计算', english: 'Diffusion Transformer', module: 4, minutes: 21, topicIds: ['model-dit'], prerequisites: ['diffusion', 'attention'], summary: '把带噪潜网格切成 token，用带时间条件的 Transformer 预测去噪信息。',
    sections: {
      quick: [
        { id: 'problem', title: '扩散目标不变，换一个处理网格的网络', paragraphs: ['扩散模型需要一个接收带噪数据和时刻、预测噪声或其他目标的神经网络。U-Net 是一种选择；DiT 把这个主干换成处理图像潜空间 patch 的 Transformer。', '例如一个 8×8 的单通道教学网格，用 2×2 patch 切分，会得到 16 个 token。每个 patch 的四个数字投影到较宽向量，再让自注意力在 patch 之间交流信息。'] },
        { id: 'flow', title: '从潜网格到同形状预测', paragraphs: ['Transformer 输出仍需还原成网格，才能作为扩散更新所需的预测。它不是像 GPT 一样逐个追加图像 patch。'], flow: [{ label: '带噪潜网格', detail: '同时输入时间与类别条件' }, { label: 'Patch 编码', detail: '网格分块、线性映射并加入位置' }, { label: '条件 Transformer', detail: '注意力、MLP 与自适应归一化' }, { label: '还原网格', detail: '输出每个 patch 的预测并拼接' }] },
        { id: 'role', title: '时间条件告诉模型当前有多乱', paragraphs: ['同一张看似模糊的输入，在轻噪声与重噪声时需要不同修复方式。DiT 用时间和类别的条件向量，调节网络内部归一化及残差分支。', 'DiT 是扩散主干设计，不是一个与 Diffusion 对立的生成目标。类似 Transformer 主干也能配合其他连续生成目标，但不能因此把不同训练方案叫成同一个算法。'], checkpoint: { question: '8×8 网格改成 1×1 patch，token 数变多少？普通自注意力的 score 表会怎样？', answer: 'token 从 16 增加到 64；score 表元素数从 16² 增至 64²，即 16 倍。这里比较的是注意力矩阵，不是整个网络全部计算量。' } },
      ],
      deep: [
        { id: 'conditioning', title: 'AdaLN 如何把条件变成缩放与平移', paragraphs: ['先给每个 token 的隐藏向量做 LayerNorm，再用条件向量预测的缩放与平移改变它。把隐藏输入记为 h，条件记为 c，缩放与平移分别记为 γ(c)、β(c)。', '例如归一化后的某一维是 0.5，条件预测缩放增量为 0.2、平移为 −0.1，则该维变为 1.2×0.5−0.1=0.5。不同条件可以对同一输入施加不同处理。'], formula: String.raw`\operatorname{AdaLN}(h,c)=(1+\gamma(c))\odot\operatorname{LN}(h)+\beta(c)`, formulaReading: '条件归一化先标准化隐藏向量，再乘上条件产生的缩放倍率，并加上条件产生的平移。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: '\\operatorname{AdaLN}', meaning: '自适应层归一化，函数名' }, { symbol: 'h', meaning: '一个 token 的隐藏特征', shape: 'd 维' }, { symbol: 'c', meaning: '由时间、类别等信息得到的条件向量' }, { symbol: '\\operatorname{LN}', meaning: '对一个 token 的特征维进行 LayerNorm' }, { symbol: '\\gamma(c)', meaning: '条件网络输出的逐特征缩放增量', shape: 'd 维' }, { symbol: '\\beta(c)', meaning: '条件网络输出的逐特征平移', shape: 'd 维' }, { symbol: '1', meaning: '逐维的基础缩放倍率 1' }, { symbol: '\\odot', meaning: '逐元素相乘；同一个条件向量可广播到多个 token' }] },
        { id: 'adalnzero', title: 'AdaLN-Zero 的零初始化是在哪里', paragraphs: ['DiT 的 adaLN-Zero 还用条件产生残差分支的门值，并将产生这些调节量的最后一层初始化为零。因此初始残差分支不改变主路径，有助于稳定训练。它不是把整个模型所有权重都设成零。', '原论文研究了不同条件注入方式。采用 latent patches、位置编码、时间/类别条件、注意力和逐位置 MLP 的组合，才构成具体模型；只把 Conv2d 换成 Attention 并不能说明复现了 DiT。', '原模型还可预测反向方差相关输出。下面为突出数据流，仅预测单通道噪声，且用简单时间 MLP，不是论文全部细节。'] },
      ],
      implementation: [
        { id: 'code', title: '一个可反向传播的微型 DiT 风格 block', paragraphs: ['仅需 PyTorch。输入为两个 8×8 的单通道带噪网格，patch 大小 2，隐藏宽度 16。示例执行前向、损失、反向与一次参数更新。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(9)
torch.set_num_threads(1)
class TinyDiT(nn.Module):
    def __init__(self):
        super().__init__()
        self.patch = nn.Conv2d(1, 16, kernel_size=2, stride=2)
        self.position = nn.Parameter(torch.randn(1, 16, 16) * 0.02)
        self.time = nn.Sequential(nn.Linear(1, 16), nn.SiLU(), nn.Linear(16, 16))
        self.label = nn.Embedding(2, 16)
        self.mod = nn.Linear(16, 6 * 16)
        nn.init.zeros_(self.mod.weight); nn.init.zeros_(self.mod.bias)
        self.norm1 = nn.LayerNorm(16, elementwise_affine=False)
        self.norm2 = nn.LayerNorm(16, elementwise_affine=False)
        self.attn = nn.MultiheadAttention(16, 2, batch_first=True)
        self.ffn = nn.Sequential(nn.Linear(16, 32), nn.GELU(), nn.Linear(32, 16))
        self.out = nn.Linear(16, 4)
    def forward(self, x, time, label):
        h = self.patch(x).flatten(2).transpose(1, 2) + self.position
        c = self.time(time[:, None]) + self.label(label)
        shift1, scale1, gate1, shift2, scale2, gate2 = self.mod(c)[:, None, :].chunk(6, -1)
        a = self.norm1(h) * (1 + scale1) + shift1
        h = h + gate1 * self.attn(a, a, a, need_weights=False)[0]
        a = self.norm2(h) * (1 + scale2) + shift2
        h = h + gate2 * self.ffn(a)
        patches = self.out(h).reshape(x.shape[0], 4, 4, 2, 2)
        return patches.permute(0, 1, 3, 2, 4).reshape(x.shape[0], 1, 8, 8)
model = TinyDiT()
opt = torch.optim.Adam(model.parameters(), lr=0.001)
x = torch.randn(2, 1, 8, 8)
prediction = model(x, torch.tensor([0.2, 0.8]), torch.tensor([0, 1]))
loss = (prediction - torch.randn_like(prediction)).square().mean()
opt.zero_grad(); loss.backward(); opt.step()
print('output shape:', tuple(prediction.shape), 'loss:', loss.item())
assert prediction.shape == x.shape` },
        { id: 'inspect', title: '这个例子证明了什么，没证明什么', paragraphs: ['它验证 patch 化、条件调节、注意力、残差与网格还原的形状一致，且能进行反向传播。随机目标只是通路检查，不是合法的扩散训练数据；完整训练要使用前一章构造的真实加噪与对应噪声。', '这里仅残差调节层零初始化，输出层使用普通随机初始化；原 DiT 的最终输出初始化等细节可查原始实现。没有图像自编码器、预训练模型、分类器无关引导或完整扩散采样器。'] },
      ],
    },
    misconceptions: ['DiT 通常并行处理图像 patch，不是自回归地逐个补 patch。', 'AdaLN-Zero 不等于所有网络参数都设为零。', '主干结构、训练目标与采样器是可分别讨论的设计维度。'],
    references: [{ title: 'Scalable Diffusion Models with Transformers', author: 'Peebles & Xie, 2023', url: 'https://arxiv.org/abs/2212.09748', reason: 'latent patch Transformer、条件方式与 adaLN-Zero 设计。' }],
  },
  {
    id: 'flow-matching', title: 'Flow Matching：学习每个位置该往哪走', english: 'Flow Matching · Conditional Vector Fields', module: 4, minutes: 22, topicIds: ['model-flow-matching'], prerequisites: ['probability-likelihood', 'backprop', 'normalizing-flow'], summary: '构造噪声到数据的连续路径，用回归学习速度，再积分得到新样本。',
    sections: {
      quick: [
        { id: 'problem', title: '从 −1 走到 3，速度应该是多少', paragraphs: ['让一个数字在时间 0 到 1 之间沿直线从 −1 走到 3。整个区间的速度是 4，时间 0.25 时位置为 0。知道起点和终点，就能廉价构造任意中间位置以及监督速度。', '生成建模把起点换成噪声样本，终点换成真实数据。网络看到中间位置与时刻，学习该位置的速度；生成时从新噪声出发，反复按预测速度前进。'] },
        { id: 'flow', title: '训练回归速度，生成求解轨迹', paragraphs: ['本章采用简单的线性条件路径：t=0 是噪声，t=1 是数据。这个时间方向与上一章从干净数据加噪的记号相反，使用公式时必须先检查约定。'], flow: [{ label: '配起点终点', detail: '噪声样本与真实样本' }, { label: '抽中间时刻', detail: '计算路径位置与目标速度' }, { label: '训练速度网络', detail: '输入位置和时间，回归速度' }, { label: '积分采样', detail: '从噪声沿预测向量场走向数据' }] },
        { id: 'interpretation', title: '目标速度可知，真实生成终点不可知', paragraphs: ['训练中我们有成对起终点，但生成时没有真实终点。不同训练路径可能穿过相同位置；网络学到的是条件速度的平均效果，而不是保存每一个样本的专属轨道。', '独立随机配对就可以形成有效的教学训练目标，但不能把它称作最优传输配对。路径如何选择、样本如何耦合，会改变速度场和采样难度。'], checkpoint: { question: '训练时知道 x₁，采样时可否把 x₁ 一并输入网络以获得更准确速度？', answer: '不可以，生成时恰恰没有这个真实终点。网络只接收当前位置、时间和任务允许的条件，目标速度只用于训练监督。' } },
      ],
      deep: [
        { id: 'objective', title: '线性路径的监督可以直接算出来', paragraphs: ['用 x₀ 表示噪声起点，x₁ 表示数据终点，t 是 0 到 1 的时间比例。中间位置是两者加权和；路径速度 u 等于终点减起点。', '速度预测器记为 v_θ，θ 表示其参数。下式是一个训练样本的平方误差；代码再对批次平均。'], formula: String.raw`x_t=(1-t)x_0+tx_1,\quad u=x_1-x_0,\quad L=\|v_\theta(x_t,t)-u\|_2^2`, formulaReading: '先按时间比例混合噪声与数据，再把终点减起点当作速度目标，最小化预测速度与目标速度的平方距离。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 'x_0,x_1', meaning: '分别为时间 0 的噪声起点和时间 1 的真实数据终点', shape: '相同 d 维' }, { symbol: 'x_t', meaning: '时刻 t 的路径位置' }, { symbol: 't', meaning: '0 到 1 之间的连续时间比例', example: '0.25' }, { symbol: 'u', meaning: '当前线性条件路径的目标速度', example: '3 − (−1) = 4' }, { symbol: 'v_\\theta', meaning: '可训练速度预测网络' }, { symbol: '\\theta', meaning: '网络参数，下标用于区分函数的不同参数设置' }, { symbol: 'L', meaning: '单样本速度回归损失' }, { symbol: '\\|\\cdot\\|_2^2', meaning: '各个坐标差值平方后相加；下标 2 表示欧氏范数，外部平方消去平方根' }] },
        { id: 'comparison', title: '它与扩散、可逆流有什么联系', paragraphs: ['Flow Matching 是学习连续向量场的训练方法，可定义多种概率路径，包含与扩散有关的路径。扩散常见训练预测噪声或 score，也可转换为概率流 ODE；两者并非互不相交的模型家族。', '离散 Normalizing Flow 依靠可逆层和行列式直接计算精确似然；这里的代码只回归速度并积分采样，没有计算连续流的散度积分，也没有报告精确密度。', 'Euler 方法每次按“时间步长乘速度”更新位置。步长越小通常数值误差越小，但调用网络次数更多；这与模型本身是否学对速度场是两个不同问题。'] },
      ],
      implementation: [
        { id: 'code', title: '完整的一维条件流匹配与 Euler 采样', paragraphs: ['只需 PyTorch。数据终点来自均值 2、标准差 0.5 的正态分布；起终点独立采样。打印采样统计，不把有限训练和粗步长当作精确分布恢复。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(12)
torch.set_num_threads(1)
velocity = nn.Sequential(nn.Linear(2, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))
opt = torch.optim.Adam(velocity.parameters(), lr=0.003)
for _ in range(400):
    start = torch.randn(128, 1)
    end = 2 + 0.5 * torch.randn(128, 1)
    t = torch.rand(128, 1)
    position = (1 - t) * start + t * end
    target = end - start
    predicted = velocity(torch.cat([position, t], dim=1))
    loss = (predicted - target).square().mean()
    opt.zero_grad(); loss.backward(); opt.step()
with torch.no_grad():
    sample = torch.randn(2000, 1)
    steps = 80
    dt = 1 / steps
    for step in range(steps):
        t = torch.full_like(sample, step / steps)
        sample = sample + dt * velocity(torch.cat([sample, t], 1))
print('velocity MSE:', loss.item())
print('sample mean / std:', sample.mean().item(), sample.std().item())
assert torch.isfinite(sample).all()` },
        { id: 'inspect', title: '怎样分辨建模误差与积分误差', paragraphs: ['固定已训练网络和相同起始噪声，比较 20、80、320 个 Euler 步的结果。变化来自积分精度；再改变训练步数，才是在检查网络拟合。', '若想学习双峰分布，可把 end 改为高斯混合。即使条件路径是直线，最终由共享速度场积分得到的轨迹也未必全部是直线；“直线训练配对”不等于“一步精确生成”。'] },
      ],
    },
    misconceptions: ['Flow Matching 不一定使用最优传输配对。', '训练中的已知终点不能作为生成时的隐藏输入。', '速度回归、噪声预测和精确似然训练应分别说明，不能仅凭名称互换。'],
    references: [{ title: 'Flow Matching for Generative Modeling', author: 'Lipman et al., 2023', url: 'https://arxiv.org/abs/2210.02747', reason: '条件向量场回归、连续流与不同概率路径的联系。' }],
  },
  {
    id: 'moe', title: 'MoE：每个 token 只调用部分专家', english: 'Sparsely Gated Mixture of Experts', module: 4, minutes: 19, topicIds: ['model-moe'], prerequisites: ['backprop', 'attention'], summary: '路由器选择少量子网络计算，增加总容量而不让每个 token 执行全部专家。',
    sections: {
      quick: [
        { id: 'problem', title: '四个专家，但每次只选两个', paragraphs: ['假设有四个结构相同、参数各自独立的 MLP。一个 token 到来时，路由器为四个专家打分，只让其中两个处理它，再把两个输出加权合并。', '这样可增加总参数容量，同时限制每个 token 的专家计算量。路由器、注意力、共享层、数据搬运仍有成本，不能把“激活参数少”直接等同于同倍率加速。'] },
        { id: 'flow', title: '先分发，再收回', paragraphs: ['同一个批次中，不同 token 可以选择不同专家。真实高效实现会把分给同一专家的 token 聚在一起计算，再送回原位置。'], flow: [{ label: '路由打分', detail: '每个 token 得到 E 个分数' }, { label: '选择 Top-k', detail: '保留 k 个专家并计算权重' }, { label: '专家处理', detail: '每个专家只接收分配给它的 token' }, { label: '加权汇合', detail: '输出回到原 token 顺序' }] },
        { id: 'meaning', title: '专家编号不等于人类学科标签', paragraphs: ['专家 0 不会天然表示语音、专家 1 也不会天然表示数学。训练可能形成可分析的分工，但要通过数据和实验验证。', 'MoE 通常替换 Transformer 中部分 FFN，其他模块可能仍然稠密。一个专家不必是一整个完整语言模型。'], checkpoint: { question: '四个专家、Top-2 路由，单个 token 是否执行全部四个专家？', answer: '有效的稀疏实现只执行选中的两个。但一个含多个 token 的批次可能用到全部四个专家；总存储参数也仍包含全部专家。' } },
      ],
      deep: [
        { id: 'formula', title: '一个 token 的输出如何合成', paragraphs: ['用 x 表示一个 token 的特征，集合 S(x) 表示路由选中的专家编号，f_e 是第 e 个专家，g_e(x) 是该专家的合并权重。这里选择在选中的专家内重新归一化权重。', '例如两个专家分别输出 [2,0] 与 [0,4]，权重为 0.75 与 0.25，最后输出就是 [1.5,1]。'], formula: String.raw`y=\sum_{e\in S(x)}g_e(x)f_e(x)`, formulaReading: '输出等于所有被选中专家的输出分别乘以对应路由权重，再加起来。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 'x', meaning: '一个 token 的输入特征', shape: 'd 维' }, { symbol: 'y', meaning: '合并后的输出特征', shape: 'd 维' }, { symbol: 'e', meaning: '专家编号' }, { symbol: 'S(x)', meaning: '输入 x 的 Top-k 专家编号集合', example: '{0, 2}' }, { symbol: '\\in', meaning: '属于该集合' }, { symbol: '\\sum', meaning: '把指定集合中每一项相加' }, { symbol: 'g_e(x)', meaning: '第 e 个专家的非负权重；本例在选中专家内和为 1' }, { symbol: 'f_e(x)', meaning: '第 e 个专家对 x 的网络输出' }] },
        { id: 'routing', title: '离散选择、负载与通信', paragraphs: ['Top-k 的成员选择是离散的，常规实现不会对“换成另一个专家”这个事件直接求导；梯度流向被选专家和其权重。具体训练方案还可加入路由噪声或辅助损失。', '若大多数 token 都被送到同一专家，其他专家学不到东西且负载不平衡。负载均衡损失、容量限制、溢出策略和专家并行决定系统是否有效；不是只写一个 topk 就解决全部问题。', '下面采用 Top-2，并在选中分数上 softmax。若 Top-1 后再强制归一化为 1，主任务损失无法通过这个常数权重训练路由器；真实 Top-1 系统的具体权重与辅助目标要另行检查。'] },
      ],
      implementation: [
        { id: 'code', title: '真正只计算选中 token 的四专家层', paragraphs: ['只需 PyTorch。六个 token、四个专家、每个 token 选择两个。循环按专家收集位置，避免先计算全部专家再把结果乘零的伪稀疏实现。'], code: String.raw`import torch
from torch import nn
torch.manual_seed(10)
torch.set_num_threads(1)
tokens = torch.randn(6, 4)
router = nn.Linear(4, 4)
experts = nn.ModuleList([nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 4)) for _ in range(4)])
scores, ids = router(tokens).topk(2, dim=-1)
weights = scores.softmax(-1)
output = torch.zeros_like(tokens)
loads = []
for expert_id, expert in enumerate(experts):
    positions = (ids == expert_id).nonzero(as_tuple=False)
    loads.append(len(positions))
    if len(positions) == 0:
        continue
    rows, slots = positions[:, 0], positions[:, 1]
    value = expert(tokens[rows]) * weights[rows, slots, None]
    output = output.index_add(0, rows, value)
loss = output.square().mean()
loss.backward()
print('selected experts:', ids.tolist())
print('tokens per expert:', loads)
print('router gradient norm:', router.weight.grad.norm().item())
assert sum(loads) == 6 * 2
assert output.shape == tokens.shape` },
        { id: 'inspect', title: '为什么小代码不会自动跑得更快', paragraphs: ['这段 Python 循环用于展示真实分发逻辑，小批次上调度开销可能比计算还大。工业实现依赖分组矩阵乘法、融合算子和跨设备通信优化。', '代码没有训练循环、容量截断和负载均衡损失，因此不能据其负载分布判断训练后的专业分工。可先增加 token 数观察计数，再比较固定分配和学习路由。'] },
      ],
    },
    misconceptions: ['总参数量、每 token 参与计算的参数量、显存占用和延迟是不同指标。', '把全部专家算完再屏蔽，不会节省专家前向计算。', '专家语义分工必须经验证，不能靠编号想象。'],
    references: [{ title: 'Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer', author: 'Shazeer et al., 2017', url: 'https://arxiv.org/abs/1701.06538', reason: '稀疏路由、专家组合和负载问题的原始工作。' }],
  },
  {
    id: 'ssm-mamba', title: 'SSM、S4 与 Mamba：把历史写进状态', english: 'State Space Models · S4 · Selective SSM', module: 4, minutes: 24, topicIds: ['model-ssm'], prerequisites: ['recurrent-memory', 'tensors-linear-algebra'], summary: '用状态递推压缩历史；结构化和输入相关的更新分别带来效率与内容选择能力。',
    sections: {
      quick: [
        { id: 'problem', title: '一条很长的序列，怎样边读边记', paragraphs: ['最简单的状态可以是一个数：上一状态乘 0.9，再加当前输入。如果输入依次为 1、0、0，状态就是 1、0.9、0.81。旧信息逐步衰减，新信息随时写入。', '状态空间模型把这个记忆扩展为向量，并学习状态如何传播、输入怎样写入、输出怎样读取。推理可以保存固定大小的状态，而不必存全部过去 token 的 key/value。'] },
        { id: 'flow', title: 'S4 与 Mamba 各改变了什么', paragraphs: ['S4 为长序列设计结构化状态转移及高效计算。Mamba 的选择性机制让部分更新量依赖当前输入，使模型能按内容决定保留和忘记。'], flow: [{ label: '读当前输入', detail: '接收这一帧或 token 的特征' }, { label: '决定更新量', detail: '固定 SSM 或输入相关的选择性参数' }, { label: '推进状态', detail: '传播旧状态并写入新信息' }, { label: '读取输出', detail: '从状态读出当前表示' }] },
        { id: 'memory', title: '固定大小状态也有取舍', paragraphs: ['相同状态必须概括不同长度的历史，这能节省存储，也可能压缩掉后续任务需要的信息。注意力则能直接访问过去表示，但通常需要更大的上下文存储。', '所以不能仅凭线性复杂度断言所有任务上都更好。评估要同时看长程记忆、内容检索、吞吐量、状态大小与实际实现。'], checkpoint: { question: 'h₀=0，每次 h=0.9h+u，输入是 1、0、0；第三步状态是什么？', answer: '0.81。第一次写入 1，随后两次各乘 0.9。若衰减系数与当前内容有关，就不能再把所有输入都视作同一种固定衰减。' } },
      ],
      deep: [
        { id: 'recurrence', title: '把状态更新拆成三个容易理解的动作', paragraphs: ['用 u_t 表示当前输入，h_t 表示更新后的状态，y_t 表示输出。Ā_t 推进旧状态，B̄_t 把输入写入状态，C_t 读出状态；D 表示输入直接到输出的支路。', '横线表示已经离散化的更新矩阵，而不是求平均。固定线性时不变 SSM 中，它们不随 t 改变；这里保留下标，是为了同时说明选择性模型。'], formula: String.raw`h_t=\bar A_t h_{t-1}+\bar B_tu_t,\qquad y_t=C_th_t+Du_t`, formulaReading: '新状态等于变换后的旧状态加上写入的当前输入；输出等于状态读出加上输入的直接支路。', notation: [{ symbol: 'm,n,r', meaning: '分别是输入宽度、状态宽度、输出宽度', shape: '正整数' }, { symbol: 't,t-1', meaning: '当前离散时刻与前一时刻' }, { symbol: 'u_t', meaning: '当前输入', shape: 'm 维' }, { symbol: 'h_t,h_{t-1}', meaning: '当前与上一步的内部状态', shape: 'n 维' }, { symbol: 'y_t', meaning: '当前输出', shape: 'r 维' }, { symbol: '\\bar A_t', meaning: '离散状态传播矩阵；横线表示离散化', shape: 'n × n' }, { symbol: '\\bar B_t', meaning: '离散输入写入矩阵', shape: 'n × m' }, { symbol: 'C_t', meaning: '把状态映射到输出的读取矩阵', shape: 'r × n' }, { symbol: 'D', meaning: '从输入直接映射到输出的矩阵', shape: 'r × m' }, { symbol: '\\bar A_t h_{t-1}', meaning: '公式中并列相乘表示矩阵乘法，不是逐元素乘法' }] },
        { id: 'selectivity', title: '选择性究竟来自哪些量', paragraphs: ['原始 Mamba 让离散步长 Δ、输入写入参数 B、状态读取参数 C 依赖输入；连续状态矩阵 A 仍是训练得到的参数，不是每个 token 都重新生成一个任意 A。因为 Δ 变化，离散后的 Ā 也随输入变化。', '线性时不变 SSM 的递推可展开为卷积，因此 S4 能利用结构化核计算。选择性机制破坏了这个固定卷积核的前提，Mamba 使用专门的硬件感知 scan 来高效计算递推。', '下面用标量状态演示精确零阶保持离散化：假设每一步区间内输入保持不变。真实 Mamba 包含更多通道、投影、局部卷积和门控；这个标量例子不是官方网络复现。'] },
      ],
      implementation: [
        { id: 'code', title: '一个输入相关的标量状态模型', paragraphs: ['只需 PyTorch。连续状态系数 A 被限制为负数，保证无输入时连续状态衰减；Δ 用 softplus 保持为正。例子执行六步递推并做一次梯度更新。'], code: String.raw`import torch
from torch import nn
import torch.nn.functional as F
torch.manual_seed(13)
torch.set_num_threads(1)
class ScalarSelectiveSSM(nn.Module):
    def __init__(self):
        super().__init__()
        self.log_rate = nn.Parameter(torch.tensor(0.0))
        self.select = nn.Linear(1, 3)  # time step, input write, state read
        self.direct = nn.Parameter(torch.tensor(0.0))
    def forward(self, sequence):
        h = sequence.new_zeros(())
        outputs = []
        A = -self.log_rate.exp()
        for u in sequence:
            raw_delta, B, C = self.select(u.reshape(1)).unbind(0)
            delta = F.softplus(raw_delta) + 1e-4
            Abar = torch.exp(delta * A)
            Bbar = torch.expm1(delta * A) / A * B
            h = Abar * h + Bbar * u
            outputs.append(C * h + self.direct * u)
        return torch.stack(outputs)
model = ScalarSelectiveSSM()
sequence = torch.tensor([1., 0., 0., 2., 0., -1.])
opt = torch.optim.Adam(model.parameters(), lr=0.01)
output = model(sequence)
target = sequence.cumsum(0)
loss = (output - target).square().mean()
opt.zero_grad(); loss.backward(); opt.step()
print('output:', output.detach().tolist())
print('loss:', loss.item())
assert output.shape == sequence.shape` },
        { id: 'inspect', title: '区分原理演示与高效实现', paragraphs: ['代码按时间用 Python 循环运行，便于看清状态传递，不代表 Mamba 论文中的并行 scan 性能。单次更新也不会让模型学会累加任务。', '可以把 select 的输出换成常数，比较固定 SSM 与选择性 SSM 的状态轨迹。若研究语音口音，需控制输入内容、时间对齐与说话人因素，不能把某次状态差直接解释成专门的“口音参数”。'] },
      ],
    },
    misconceptions: ['Mamba 的连续 A 并非所有元素都由当前输入任意生成。', '固定卷积核的计算等价不直接适用于输入相关的选择性递推。', '状态大小固定不代表没有记忆瓶颈，也不代表所有硬件上都会更快。'],
    references: [{ title: 'Efficiently Modeling Long Sequences with Structured State Spaces', author: 'Gu, Goel & Ré, 2022', url: 'https://arxiv.org/abs/2111.00396', reason: 'S4 的结构化状态空间与高效长序列计算。' }, { title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces', author: 'Gu & Dao, 2024', url: 'https://arxiv.org/abs/2312.00752', reason: '输入相关的 Δ/B/C 选择机制及硬件感知 scan。' }],
  },
  {
    id: 'rag', title: 'RAG：回答之前，先找证据', english: 'Retrieval-Augmented Generation', module: 4, minutes: 20, topicIds: ['system-rag'], prerequisites: ['tokens-embeddings', 'probability-likelihood'], summary: '把外部检索与生成模型串起来；RAG 是系统方法，不是单独的一种神经网络层。',
    sections: {
      quick: [
        { id: 'problem', title: '模型不知道昨天更新的实验室规定', paragraphs: ['如果规则昨天刚修改，模型参数未必知道。把文档放进可搜索索引，提问时先检索相关段落，再让生成器根据这些段落作答，可以把可更新知识留在模型外部。', '例如问“GPU 作业最长运行多久”，检索器应找到计算资源规则，而不是食堂通知。第一步检索失败，后面的生成模型再强也缺少关键证据。'] },
        { id: 'flow', title: '检索与生成各有责任', paragraphs: ['索引构建通常离线完成，查询时再检索。文档切片应保留来源、版本和上下文，避免只检索出一句失去条件的规定。'], flow: [{ label: '整理索引', detail: '分段、保留来源，计算检索特征' }, { label: '检索候选', detail: '按查询找相关片段，可再重排序' }, { label: '构造上下文', detail: '提供问题与选中的证据' }, { label: '生成并核验', detail: '回答附来源，检查结论是否受证据支持' }] },
        { id: 'systems', title: '它不是一种新的 Transformer 层', paragraphs: ['检索器可以是关键词方法、稠密向量模型或混合系统；生成器可以采用不同语言模型。把两者组合起来，才形成具体 RAG 系统。', '检索能提供证据，却不能保证模型不会歪曲、忽略或误读证据。评估要分别检查检索召回率、答案正确性和引用支持关系。'], checkpoint: { question: '文档已更新但答案仍旧，首先应检查什么？', answer: '先看索引是否已更新、检索出来的是哪个版本、相关片段是否进入上下文。不能直接把所有错误都归因于生成模型知识过期。' } },
      ],
      deep: [
        { id: 'marginalization', title: '原始 RAG 的概率视角', paragraphs: ['把问题记为 q，答案记为 y，候选文档记为 d。检索器给文档一个相关性概率，生成器给“在这个文档条件下产生答案”的概率。原始 RAG-Sequence 可以对候选文档求加权和。', '例如两份文档的权重为 0.7、0.3，它们支持同一答案的生成概率为 0.6、0.2，则混合概率为 0.48。下面写的是候选集合内归一化的近似混合模型。'], formula: String.raw`p(y\mid q)\approx\sum_{d\in\mathcal D_k(q)}r(d\mid q)\,g(y\mid q,d)`, formulaReading: '给定问题的答案概率，近似为每份候选文档的检索权重乘以基于该文档的答案概率，再求和。', notation: [{ symbol: 'q', meaning: '用户查询或问题' }, { symbol: 'y', meaning: '整个候选答案序列' }, { symbol: 'd', meaning: '一份候选文档或片段' }, { symbol: '\\mathcal D_k(q)', meaning: '查询 q 检索到的前 k 个候选；下标 k 是保留数量' }, { symbol: 'p(y\\mid q)', meaning: '给定问题时答案的概率' }, { symbol: 'r(d\\mid q)', meaning: '本例在候选集合内归一化的检索概率' }, { symbol: 'g(y\\mid q,d)', meaning: '生成器基于问题和文档给出的答案概率' }, { symbol: '\\mid', meaning: '给定右侧信息作为条件' }, { symbol: '\\approx', meaning: '近似；只考虑有限候选集合' }, { symbol: '\\sum,\\in', meaning: '对属于候选集合的所有文档逐项求和' }] },
        { id: 'practice', title: '常见工程 RAG 不一定显式计算上面的求和', paragraphs: ['许多系统直接把若干片段拼进 prompt，再让一个模型生成一次答案；这与原始论文按文档边缘化的概率模型相关，但实现并不相同。需要说清楚采用哪一种方案。', '切片长度、重叠、检索器、重排序、上下文预算、来源新鲜度都会影响效果。外部文本应作为证据数据，不应让文档中的命令覆盖系统指令。', '在私人或权限分层文档中，检索阶段就应按用户权限过滤。检索命中不表示该用户有权看到内容；后续生成不能修复已经泄露的上下文。'] },
      ],
      implementation: [
        { id: 'code', title: '不需要 API 的检索与证据回答小系统', paragraphs: ['下面只用 Python 标准库，演示词项检索、来源和缺证据拒答。回答器是明确标注的抽取式规则，不假装调用了 LLM；真实系统可在同一接口后接生成模型。'], code: String.raw`import math
import re
from collections import Counter
documents = [
    {'id': 'compute-2026', 'text': 'GPU jobs have a maximum runtime of 12 hours.'},
    {'id': 'library-2026', 'text': 'The library closes at 22:00 on weekdays.'},
    {'id': 'backup-2026', 'text': 'Research data backups run every night.'},
]
def tokenize(text):
    return re.findall(r'[a-z0-9]+', text.lower())
def cosine(query, document):
    a, b = Counter(tokenize(query)), Counter(tokenize(document))
    dot = sum(value * b[key] for key, value in a.items())
    norm = math.sqrt(sum(v*v for v in a.values()) * sum(v*v for v in b.values()))
    return dot / norm if norm else 0.0
def retrieve(question, k=2):
    ranked = sorted([(cosine(question, doc['text']), doc) for doc in documents], key=lambda x: x[0], reverse=True)
    return [(score, doc) for score, doc in ranked[:k] if score > 0]
def answer(question):
    evidence = retrieve(question)
    if not evidence:
        return 'No matching evidence. No answer generated.'
    _, doc = evidence[0]
    return 'Extractive demo: ' + doc['text'] + ' [source: ' + doc['id'] + ']'
print(answer('GPU maximum runtime'))
print(answer('unicorn quantum teleportation'))
assert retrieve('GPU maximum runtime')[0][1]['id'] == 'compute-2026'` },
        { id: 'inspect', title: '把检索正确与回答正确分开测试', paragraphs: ['这个词项方法不理解同义词，也不支持中文分词，刻意使用英文小文档。它有完整可运行的数据流，但不是神经检索、重排序或原始 RAG 的联合训练复现。', '扩展时先做一组有已知证据编号的查询，检查 top-k 是否包含正确段落；再检查回答中的每条主张能否从引用片段推出。若证据矛盾或缺失，要呈现不确定性，而不是用流畅语句填空。'] },
      ],
    },
    misconceptions: ['RAG 是检索与生成的系统组合，不是一种独立网络架构。', '带引用的答案也可能引用不支持其结论的材料。', '文档更新后必须更新索引；外部知识不会自动进入模型参数。'],
    references: [{ title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', author: 'Lewis et al., 2020', url: 'https://arxiv.org/abs/2005.11401', reason: '参数记忆与非参数检索记忆结合、RAG-Sequence/Token 的原始框架。' }],
  },
  {
    id: 'multimodal-transformer', title: 'Multimodal Transformer：让不同输入进入共同计算', english: 'Multimodal Transformers · Visual Instruction Tuning', module: 4, minutes: 21, topicIds: ['model-multimodal'], prerequisites: ['attention', 'clip'], summary: '先把图像、语音或文字转换为可对齐的表示，再选择拼接、自注意力或交叉注意力组织信息。',
    sections: {
      quick: [
        { id: 'problem', title: '“图里有什么”需要文字看到图像信息', paragraphs: ['文字模型只接收 token 向量，不能直接理解一张像素网格。一个常见方案是先用视觉编码器把图片变成一串向量，再用投影层调整宽度，与文字 token 一起交给语言模型。', '例如图像编码器给出 4 个 6 维向量，而语言模型使用 8 维 token。一个 6→8 的线性层就能解决宽度不匹配；但“形状能拼上”还不等于语义已经对齐，需要配对与指令训练。'] },
        { id: 'flow', title: '编码器、连接器与语言模型各做什么', paragraphs: ['编码器保留输入模态的有用特征；连接器把特征接入语言模型；语言模型在条件信息下生成文字。多模态系统也可以生成图像或音频，但需要对应的输出表示和解码器。'], flow: [{ label: '编码原始输入', detail: '图像 patch、声学帧或文字 token' }, { label: '连接与对齐', detail: '投影、重采样或交叉注意力' }, { label: '共同计算', detail: '拼接后自注意力，或显式跨模态读取' }, { label: '生成或理解', detail: '根据任务输出文本、分类或其他模态' }] },
        { id: 'choices', title: '拼接与交叉注意力是两种设计', paragraphs: ['拼接方案把视觉 token 放到文字序列前方，用注意力 mask 决定谁能看谁。交叉注意力方案让文字查询视觉特征，两个序列可保留不同长度。', 'CLIP 的双编码器主要通过相似度对齐样本；视觉语言助手还需要把视觉信息接入生成过程。这些系统解决的问题不同，不能只把“都支持图文”视为同一架构。'], checkpoint: { question: '4 个图像 token 投影后是 4×8，3 个文字 token 是 3×8，拼接后是什么形状？', answer: '沿序列维拼接得到 7×8。特征宽度必须一致；如果沿特征维拼接，长度不同就无法直接操作。' } },
      ],
      deep: [
        { id: 'projector', title: '一个连接器如何对齐张量宽度', paragraphs: ['用 V 表示图像编码器产生的 token 矩阵，W 表示可学习投影，b 表示偏置，T 表示文字 token 矩阵。先把 V 映射到文字宽度，再按序列维拼接。', '例子中 V 是 4×6，W 是 6×8，偏置有 8 个数；投影输出 4×8。与 3×8 的 T 拼接后得到 7×8。'], formula: String.raw`U=VW+b,\qquad X=\operatorname{Concat}_{\mathrm{seq}}(U,T)`, formulaReading: '视觉 token 乘投影矩阵并加偏置，得到与文字相同宽度的向量，再沿序列方向拼接。', notation: [{ symbol: 'd', meaning: '向量的坐标数，也称特征维度', shape: '正整数' }, { symbol: 'V', meaning: '图像编码器输出的视觉 token；这里不是注意力中的 Value', shape: 'N_v × d_v', example: '4 × 6' }, { symbol: 'W', meaning: '可训练连接器权重', shape: 'd_v × d', example: '6 × 8' }, { symbol: 'b', meaning: '对所有视觉 token 广播的偏置', shape: 'd 维', example: '8 个数' }, { symbol: 'U', meaning: '投影后的视觉 token', shape: 'N_v × d', example: '4 × 8' }, { symbol: 'T', meaning: '文字 token 的隐藏表示；不是时间长度', shape: 'N_t × d', example: '3 × 8' }, { symbol: 'X', meaning: '拼接后的多模态序列', shape: '(N_v+N_t) × d', example: '7 × 8' }, { symbol: '\\operatorname{Concat}_{\\mathrm{seq}}', meaning: '沿序列维连接，下标 seq 指 sequence' }, { symbol: 'N_v,N_t,d_v,d', meaning: '分别是视觉 token 数、文字 token 数、原视觉宽度、公共隐藏宽度' }] },
        { id: 'training', title: '训练对齐的不只是矩阵尺寸', paragraphs: ['视觉指令微调把图像、问题和回答一起使用。通常只对需要生成的回答 token 计算语言损失；图像前缀和提示 token 可能作为条件而不直接监督预测。冻结哪些模块、分几个阶段训练，因具体模型而异。', '图像分辨率会影响 token 数，音频还涉及帧率、时长和时间对齐。把所有输入都压成一个向量会节省计算，但可能丢失局部细节；保留更多 token 则增加上下文与注意力成本。', '本章以公开的 LLaVA 类型连接器思路说明原理，不推测任何未公开商业模型的内部结构。多模态理解仍会出现视觉幻觉，需要控制图片证据和文本先验的贡献。'] },
      ],
      implementation: [
        { id: 'code', title: '运行一个视觉前缀加文字的微型模型', paragraphs: ['仅需 PyTorch。随机视觉特征代替已训练视觉编码器；模型用两层 Transformer 计算文本位置的词表分数。示例验证形状、因果可见性和反向传播，不声称具有图像理解能力。'], code: String.raw`import torch
from torch import nn
import torch.nn.functional as F
torch.manual_seed(14)
torch.set_num_threads(1)
batch, visual_count, text_count = 2, 4, 3
projector = nn.Linear(6, 8)
embedding = nn.Embedding(20, 8)
position = nn.Embedding(visual_count + text_count, 8)
layer = nn.TransformerEncoderLayer(d_model=8, nhead=2, dim_feedforward=16, dropout=0, batch_first=True)
backbone = nn.TransformerEncoder(layer, num_layers=2)
head = nn.Linear(8, 20)
visual = torch.randn(batch, visual_count, 6)
text = torch.tensor([[1, 2, 3], [1, 4, 5]])
x = torch.cat([projector(visual), embedding(text)], dim=1)
length = x.shape[1]
x = x + position(torch.arange(length))[None]
# True blocks attention in TransformerEncoder's boolean mask.
mask = torch.ones(length, length, dtype=torch.bool).triu(1)
hidden = backbone(x, mask=mask)
logits = head(hidden[:, visual_count:])
next_tokens = torch.tensor([[2, 3, 6], [4, 5, 7]])
loss = F.cross_entropy(logits.reshape(-1, 20), next_tokens.reshape(-1))
loss.backward()
print('multimodal shape:', tuple(x.shape))
print('text logits shape:', tuple(logits.shape), 'loss:', loss.item())
assert tuple(x.shape) == (2, 7, 8)
assert projector.weight.grad is not None` },
        { id: 'inspect', title: '哪些信息能被哪一个位置读取', paragraphs: ['统一的下三角 mask 让每个文字位置看到所有前置视觉 token 和先前文字，同时禁止看未来文字。例子中的视觉前缀在语言主干内也是因果排列；其他架构可用前缀双向 mask 或单独视觉编码器获得更丰富视觉交流。', '要变成真实系统，需换成有意义的视觉特征、配对训练数据与规范的回答标签屏蔽；还要记录 token 数与位置编码。对比“替换图片、保持问题”和“保持图片、替换问题”可以初步检查模型是否真正依赖视觉输入。'] },
      ],
    },
    misconceptions: ['把两个张量拼起来不代表已经学会跨模态语义对齐。', '支持多模态输入与支持多模态输出是不同能力。', '公开模型的一种连接器设计不能用于推断未公开模型的全部结构。'],
    references: [{ title: 'Visual Instruction Tuning', author: 'Liu et al., 2023', url: 'https://arxiv.org/abs/2304.08485', reason: '视觉编码器连接语言模型、图文指令训练的公开实例。' }, { title: 'Learning Transferable Visual Models From Natural Language Supervision', author: 'Radford et al., 2021', url: 'https://arxiv.org/abs/2103.00020', reason: '与生成式多模态融合区分的双编码器对比学习路线。' }],
  },
];
