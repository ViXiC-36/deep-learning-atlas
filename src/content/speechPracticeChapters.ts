import type { Chapter } from './types.ts';

export const speechPracticeChapters: Chapter[] = [
  {
    id: 'acoustic-features', title: '把声音变成模型能读取的时间序列', english: 'Waveform, STFT and Mel Features', module: 6, minutes: 8,
    topicIds: ['acoustic-features'], prerequisites: ['张量与形状', '频率是每秒振动的次数'],
    summary: '先分清采样点、短时帧与频率格子，再理解频谱和梅尔特征保留了什么。',
    sections: {
      quick: [
        { id: 'sound-to-frame', title: '一秒声音为什么不是一张图片？', paragraphs: ['波形是按时间记录的振幅。16 kHz 的采样率表示每秒记录 16000 个采样点；kHz 是千赫兹，赫兹表示每秒次数。采样率不是音调，也不是每秒输出多少文字。', '短时傅里叶变换把声音切成可以重叠的小片段，分别查看各频率的强弱。STFT 是 Short-Time Fourier Transform 的缩写。模型随后看到的是随时间变化的频率结构。'], flow: [{label:'波形',detail:'一条按时间排列的振幅序列'},{label:'分帧与加窗',detail:'截取短片段，减轻片段边缘突变'},{label:'短时频谱',detail:'每帧包含许多频率格子的复数系数'},{label:'梅尔与对数',detail:'合并频带并压缩能量的数值范围'}] },
        { id: 'concrete-size', title: '用 16000 个采样点数一遍', paragraphs: ['取一秒、16000 个采样点，每帧 400 点，每次向前走 160 点，不在两端补点。可以取到 98 帧。400 点对应 25 毫秒；160 点对应 10 毫秒。毫秒是千分之一秒。', '对 400 点实数波形做傅里叶变换，保留不重复的非负频率部分，得到 201 个频率格子。把这些格子汇总为 80 个梅尔频带之后，形状就是“98 帧，每帧 80 个数”。这里的 80 是设计选择。'], checkpoint: {question:'把每次向前走的距离减半，主要改变时间分辨率还是最高可表示频率？',answer:'主要增加帧的密度，提高时间采样密度。最高无混叠频率仍由原始采样率决定，不由帧移决定。'} },
      ],
      deep: [
        { id: 'frame-count', title: '先把每个量命名，再计算帧数', paragraphs: ['下面只讨论不补点、只保留完整帧的情况。先放好第一帧，余下长度能容纳多少次完整移动，就再增加多少帧。音频短于一帧时，应另行决定补零还是丢弃。'], formula: String.raw`F=1+\left\lfloor\frac{N-W}{H}\right\rfloor\quad(N\geq W)`, formulaReading:'帧数等于一，加上“采样点数减去帧长，再除以帧移”向下取整。', notation:[{symbol:'F',meaning:'完整帧的数量',shape:'整数',example:'98 帧'},{symbol:'N',meaning:'音频总采样点数',example:'16000'},{symbol:'W',meaning:'一帧包含的采样点数',example:'400'},{symbol:'H',meaning:'相邻帧起点之间相差的采样点数，称为帧移',example:'160'},{symbol:String.raw`\lfloor\cdot\rfloor`,meaning:'向下取整；中间的点表示放入这个操作的数',example:'97.5 变为 97'},{symbol:String.raw`\geq`,meaning:'大于或等于；这里要求音频至少够放一帧'}] },
        { id: 'what-is-lost', title: '幅度、功率、相位与梅尔并不是同一件事', paragraphs: ['傅里叶系数是复数。取其绝对值得到幅度，再平方得到功率；复数的角度提供相位。只保留幅度或功率，会丢弃一部分重建波形所需的信息。', '梅尔滤波组对若干频率格子的功率做加权求和。梅尔尺度在高频处分得较粗，目的是得到更紧凑的感知相关表示。取对数之前需给零能量设置正的下限，避免对零取对数。'] },
        { id: 'frontend-contract', title: '特征提取的配置也是模型的一部分', paragraphs: ['训练和推理必须使用一致的采样率、窗函数、帧长、帧移、梅尔滤波组及归一化方式。把 48 kHz 波形直接当 16 kHz 读取，会同时改变时间和频率解释。重采样需要低通滤波，不能简单每三点取一点就假定安全。', '居中补点会改变帧数和时间戳。频谱图上的颜色通常表示对数能量，不直接等于音高。基频是周期振动的重复频率，谐波则出现在其整数倍附近。'] },
      ],
      implementation: [
        { id: 'stft-code', title: '运行一个形状可检查的频谱例子', paragraphs:['下面生成 440 赫兹的纯音。代码中的 sample_rate 是采样率，wave 是波形，spectrum 是复数频谱；张量形状依次为采样点、频率格子与帧。使用 PyTorch，未调用麦克风。'],code:`import torch
sample_rate = 16000
sample_count = 16000
time_seconds = torch.arange(sample_count) / sample_rate
wave = torch.sin(2 * torch.pi * 440 * time_seconds)
window = torch.hann_window(400)
spectrum = torch.stft(wave, n_fft=400, hop_length=160,
                      win_length=400, window=window,
                      center=False, return_complex=True)
power = spectrum.abs().square()
log_power = power.clamp_min(1e-10).log()
assert spectrum.shape == (201, 98)
assert torch.isfinite(log_power).all()
print(spectrum.shape)` },
        { id: 'frontend-check', title: '先检查输入，再调整模型', paragraphs:['先听原始音频，核对采样率和声道；再画波形与频谱，检查静音、削波、长度和时间戳。批处理中的补零帧必须通过长度或掩码排除。', '这个例子得到的是对数功率频谱，并没有计算梅尔滤波组。不要把变量改名成 mel 就声称完成了梅尔特征提取。'] },
      ],
    },
    misconceptions:['更高采样率不保证识别更好，训练时的前端配置和任务信息需求同样重要。','频谱图中的一条明亮横线表示某频带能量强，不自动表示完整的语音类别。'],
    references:[{title:'torch.stft',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/generated/torch.stft.html',reason:'核对居中补点、窗函数、复数输出与频率格子的定义。'},{title:'Speech and Language Processing',author:'Daniel Jurafsky & James H. Martin',url:'https://web.stanford.edu/~jurafsky/slp3/',reason:'从语音信号、声学特征到识别系统的完整上下文。'}],
  },
  {
    id:'speech-backbones',title:'语音骨干：局部声音怎样接上长程语境',english:'Speech Encoders, Conformer and Whisper',module:6,minutes:8,
    topicIds:['speech-backbones','whisper-conformer'],prerequisites:['声学特征','卷积','Attention'],summary:'区分编码器结构、训练任务和解码方式，再看 Conformer 与 Whisper 各自做了哪些选择。',
    sections:{
      quick:[
        {id:'roles',title:'同一段声音，需要三个不同职责',paragraphs:['声学前端把波形转换成帧；编码器把帧变成包含上下文的表示；输出头或解码器把表示转换成文字。骨干通常指承担主要表示计算的网络，不等于完整识别系统。','卷积善于组合局部邻域；循环网络沿时间维护状态；自注意力根据内容关联不同位置。三者可以组合，选择取决于任务和计算约束。'],flow:[{label:'声学帧',detail:'保留时间顺序与每帧特征'},{label:'下采样',detail:'减少帧数，降低后续计算量'},{label:'上下文编码器',detail:'局部声音与长程关系共同进入表示'},{label:'输出任务',detail:'CTC、转导器或自回归文字解码'}]},
        {id:'two-examples',title:'Conformer 是编码块，Whisper 是一套识别模型',paragraphs:['Conformer 把前馈网络、自注意力和卷积模块放入残差块。前馈网络逐位置处理特征；卷积补充局部模式；自注意力建立远距离联系。原始 Conformer 的两个前馈残差分支分别使用一半的缩放系数。','Whisper 使用对数梅尔特征和 Transformer 编码器—解码器，通过特殊词元指定语言或任务，再自回归地产生文字。它采用的大规模弱监督训练策略，与 Conformer 的块结构属于不同层面的设计。'],checkpoint:{question:'把 Conformer 编码器接到 CTC 输出头后，是否必须逐字自回归解码？',answer:'不必须。CTC 输出头可以逐帧产生分布；编码器的名称不会自动决定输出概率分解方式。'}}
      ],
      deep:[
        {id:'downsampling',title:'下采样为什么显著影响注意力成本',paragraphs:['下面只比较标准自注意力的两两位置打分数量，忽略批大小与头数。把帧数减为一半，两两配对数量会变为原来的四分之一。它不会自动保证运行时间也正好缩短到四分之一。'],formula:String.raw`A=T^2,\qquad A_{\mathrm{half}}=(T/2)^2=A/4`,formulaReading:'长度为 T 的序列有 T 的平方个位置对；长度减半后，位置对数量变为原来的四分之一。',notation:[{symbol:'T',meaning:'输入到注意力层的时间位置数量',shape:'正整数',example:'100 帧'},{symbol:'A',meaning:'一个注意力头中两两位置打分的数量',example:'10000 个分数'},{symbol:String.raw`A_{\mathrm{half}}`,meaning:'帧数减半后的打分数量；half 下标只是“减半”的标签',example:'2500'},{symbol:'{}^2',meaning:'平方，即一个数乘以它自身'},{symbol:'/',meaning:'除法；T/2 表示将帧数除以二'}]},
        {id:'streaming',title:'能处理长序列，不等于能实时识别',paragraphs:['离线双向注意力能读取整句后文。流式系统在某个时刻只能读取已经到达的声音，最多再允许固定长度的前瞻。因此需要因果掩码、分块注意力、缓存和端点策略。','下采样过强会抹掉短暂声学线索，也会提高时间戳的最小粒度。卷积是否因果、归一化是否使用未来帧，都影响流式可用性。不能只在最终注意力矩阵上加一个掩码就认为所有未来信息已消失。']},
        {id:'representation',title:'形状相同，不表示信息相同',paragraphs:['每帧 256 维只表示每个时间位置有 256 个数，不表示其中某一维就是某个音位。表示可能同时包含内容、说话人、录音环境和韵律。','比较两个骨干时固定音频前端、数据切分、参数预算与训练步数，并单独记录推理延迟。否则“结构更好”的结论可能实际来自更多训练数据或不同解码器。']}
      ],
      implementation:[
        {id:'backbone-code',title:'拼一个可检查形状的微型声学编码器',paragraphs:['这是卷积加 Transformer 的教学组合，不是完整 Conformer，也不是 Whisper。batch 表示同时处理的录音数，frames 表示帧数，features 表示每帧特征数。'],code:`import torch
from torch import nn
torch.manual_seed(7)
batch, frames, features = 2, 100, 80
audio_features = torch.randn(batch, frames, features)
downsample = nn.Conv1d(features, 32, kernel_size=3, stride=2, padding=1)
encoded = downsample(audio_features.transpose(1, 2)).transpose(1, 2)
block = nn.TransformerEncoderLayer(d_model=32, nhead=4,
                                   dim_feedforward=64, batch_first=True)
block.eval()
with torch.no_grad():
    output = block(encoded)
assert output.shape == (2, 50, 32)
print(output.shape)`},
        {id:'backbone-check',title:'把“这个模型是什么”拆成可回答的问题',paragraphs:['依次写清楚输入表示、时间压缩倍率、编码块、输出头、训练损失及解码方法。复现论文时不要只抄网络名称。','若真实批次有不同长度，需要将原始长度变换成下采样后的长度，并正确构造注意力补齐掩码。本例两条输入长度相同，省略了补齐掩码。']}
      ]},
    misconceptions:['Conformer 与 CTC 不是互斥选择：前者描述编码结构，后者描述序列概率与训练目标。','Whisper 的训练方式不意味着所有 Transformer 编码器—解码器都具有同样的泛化能力。'],
    references:[{title:'Conformer: Convolution-augmented Transformer for Speech Recognition',author:'Anmol Gulati et al.',url:'https://arxiv.org/abs/2005.08100',reason:'核对卷积、注意力与两个前馈模块的组合。'},{title:'Robust Speech Recognition via Large-Scale Weak Supervision',author:'Alec Radford et al.',url:'https://arxiv.org/abs/2212.04356',reason:'理解 Whisper 的输入、编码器—解码器和多任务训练设计。'}],
  },
  {
    id:'transducer-asr',title:'识别时何时发字：转导器与注意力解码',english:'RNN-T and Attention-based ASR',module:6,minutes:9,
    topicIds:['transducer','attention-asr'],prerequisites:['CTC','自回归','Attention'],summary:'一个模型沿声音时间和文字历史两条轴移动，另一个在发出每个词元时读取声学上下文。',
    sections:{
      quick:[
        {id:'two-axes',title:'声音前进与文字前进是两件事',paragraphs:['RNN-T 是 Recurrent Neural Network Transducer，即循环神经网络转导器；现代版本的声学编码器也可以采用 Transformer 或 Conformer。它把声学编码器、预测网络和联合网络组合起来。','声学编码器读取声音；预测网络读取已经输出的非 blank 词元；联合网络融合二者并给下一个动作评分。blank 是“不输出新词元而推进声学时间”的特殊符号。发出普通词元则推进输出历史，声学位置可以暂时不变。'],flow:[{label:'当前声学位置',detail:'编码器给出该时刻的声音表示'},{label:'已输出的文字',detail:'预测网络提供历史表示'},{label:'联合网络',detail:'融合声音与历史并计算词元概率'},{label:'选择动作',detail:'blank 推进时间；文字词元推进输出历史'}]},
        {id:'contrast-attention',title:'注意力解码器换了一种对齐方式',paragraphs:['基于注意力的语音识别在生成每个文字词元时，对整段可见声学表示计算交叉注意力，再结合已经生成的文字预测下一词元。交叉注意力指查询来自解码器、键和值来自声学编码器。','假设说“你好”时声音有五帧，文字只有两个词元。转导器为不同的“发字时机”路径加总概率；注意力解码器则为两个输出步骤分别读取声学上下文。这是概率模型的差别，不只是画图方式不同。'],checkpoint:{question:'转导器发出一个普通文字词元后，必须立刻消费下一帧声音吗？',answer:'不必须。标准转导器允许在同一声学位置连续发出多个词元；blank 动作才推进声学时间。'}}
      ],
      deep:[
        {id:'conditional-text',title:'先理解注意力识别的概率分解',paragraphs:['以下表达式描述文字序列的条件概率。它没有规定交叉注意力必须怎样实现，只要求预测下一词元时能够使用声音和先前文字。训练时通常提供正确的先前文字，这叫教师强制。'],formula:String.raw`p(y\mid x)=\prod_{u=1}^{U}p(y_u\mid y_{<u},x)`,formulaReading:'整句文字在这段声音下的概率，等于每一个词元在声音与先前文字条件下的概率依次相乘。',notation:[{symbol:'x',meaning:'完整输入声音或其声学表示',shape:'时间序列'},{symbol:'y',meaning:'目标文字词元序列，包含约定的结束符',shape:'长度 U 的离散序列'},{symbol:'U',meaning:'目标序列的词元总数'},{symbol:'u',meaning:'当前输出位置，从 1 数到 U'},{symbol:'y_u',meaning:'第 u 个目标词元；下标表示位置'},{symbol:'y_{<u}',meaning:'严格位于第 u 个词元之前的所有目标词元'},{symbol:String.raw`p(\cdot\mid\cdot)`,meaning:'条件概率；竖线右侧是已知信息，点是待放入的对象'},{symbol:String.raw`\prod_{u=1}^{U}`,meaning:'从第 1 个位置到第 U 个位置，把所有对应概率相乘'}]},
        {id:'alignment-sum',title:'为什么训练转导器需要路径求和',paragraphs:['转写通常没有逐词元发射时间。一次正确转写可以由许多合法路径得到：某个词元早一帧或晚一帧发射都可能符合监督。训练应给这些路径的概率求和，而不是随意挑一条当唯一真相。','动态规划利用二维网格共享计算：一维是声学时间，另一维是已经输出多少个目标词元。与 CTC 不同，转导器的发射分布显式依赖非 blank 输出历史，因此不能套用 CTC 的重复合并规则。']},
        {id:'latency-and-errors',title:'部署选择取决于延迟与错误方式',paragraphs:['转导器常用于流式识别，但仍需因果声学编码器与实际的缓存策略。完整句子交叉注意力容易使用未来声音；要流式运行必须限制可见范围。','自回归解码可能在噪声或静音上给出语言上顺畅、声学上不支持的输出。评估除文字错误率外，还应包含静音插入、专名、口音、长音频及词元发射延迟。']}
      ],
      implementation:[
        {id:'joint-code',title:'看一眼联合网络的四个轴',paragraphs:['代码只演示转导器联合网络的形状，不实现转导器损失。声学时间有 4 步，输出历史有 3 种长度状态；词表中第 0 类约定为 blank。所有权重随机初始化。'],code:`import torch
from torch import nn
torch.manual_seed(2)
batch, audio_steps, history_steps = 2, 4, 3
hidden_size, vocabulary_size = 8, 6
audio = torch.randn(batch, audio_steps, hidden_size)
history = torch.randn(batch, history_steps, hidden_size)
projection = nn.Linear(hidden_size, vocabulary_size)
joint = torch.tanh(audio[:, :, None, :] + history[:, None, :, :])
probabilities = projection(joint).softmax(dim=-1)
assert probabilities.shape == (2, 4, 3, 6)
assert torch.allclose(probabilities.sum(-1), torch.ones(2, 4, 3))
print(probabilities[0, 0, 0])`},
        {id:'rnnt-check',title:'先检查对齐约定，再检查损失',paragraphs:['实际损失接口对 blank 编号、是否已取对数、输入与标签长度、是否包含额外历史状态的约定各不相同。用只有一两个词元的例子手动枚举，再与库的动态规划结果比较。','不要把这段联合网络代码当成完整识别系统：它没有学习声音、构造历史网络、求对齐损失或实现搜索。']}
      ]},
    misconceptions:['RNN-T 名字中有 RNN，不意味着声学编码器只能使用循环网络。','转导器的 blank 与 CTC 的 blank 都表示不产生词元，但整体路径规则不同。'],
    references:[{title:'Sequence Transduction with Recurrent Neural Networks',author:'Alex Graves',url:'https://arxiv.org/abs/1211.3711',reason:'从原始定义理解声学时间、输出历史与路径求和。'},{title:'Listen, Attend and Spell',author:'William Chan et al.',url:'https://arxiv.org/abs/1508.01211',reason:'理解注意力编码器—解码器如何直接预测转写。'}],
  },
  {
    id:'speech-ssl',title:'没有转写的声音，怎样产生训练题目',english:'wav2vec 2.0 and HuBERT',module:6,minutes:8,
    topicIds:['speech-ssl'],prerequisites:['声学编码器','交叉熵','自监督学习'],summary:'遮住一部分声音表示，再从上下文找回目标；比较对比目标和聚类标签预测。',
    sections:{
      quick:[
        {id:'masked-speech',title:'训练标签来自声音自身',paragraphs:['自监督语音学习先从大量未转写音频构造预测任务，再把学到的编码器适配到识别或其他任务。未使用人工转写，不等于没有训练目标。','wav2vec 2.0 遮住部分潜在声学表示，在上下文表示上区分对应的量化目标与干扰目标；还需要促进码本利用的辅助机制。HuBERT 则先离线聚类生成伪标签，再预测被遮住位置的聚类编号。'],flow:[{label:'未转写声音',detail:'先切成短时声学表示'},{label:'构造目标',detail:'量化目标或离线聚类编号'},{label:'遮蔽输入',detail:'上下文编码器看不到局部原始表示'},{label:'预测并训练',detail:'依据目标更新编码器，再适配下游任务'}]},
        {id:'cluster-example',title:'聚类编号不必等于音位',paragraphs:['想象一段声音的聚类标签依次为 4、4、7、7。遮住中间两帧后，模型需要从左右声音线索预测对应编号。编号 4 本身没有语言学含义：重新聚类后相同声音可能得到编号 19。','聚类的一致性和与下游任务有关的结构，比编号的名称更重要。更深层的表示可能支持更好的再聚类，但这并不保证每一层都只编码语言内容。'],checkpoint:{question:'HuBERT 的聚类标签全部重新编号，会改变任务的本质吗？',answer:'只要训练目标和输出类别始终使用同一套新编号，就不会；编号的语义来自数据划分，不来自数字本身。'}}
      ],
      deep:[
        {id:'masked-loss',title:'只在选中的位置计算分类损失',paragraphs:['下面是掩码聚类预测的简化目标。模型为每个被遮住的位置给出聚类分布；正确聚类的概率越小，惩罚越大。这不是 wav2vec 2.0 的完整对比目标。'],formula:String.raw`L=-\frac{1}{|M|}\sum_{t\in M}\log p_\theta(c_t\mid\widetilde{x})`,formulaReading:'在被遮住的位置上，取正确聚类概率的负对数，然后求平均。',notation:[{symbol:'L',meaning:'这批掩码位置的平均预测损失',shape:'一个数'},{symbol:'M',meaning:'被选中并计入损失的位置集合'},{symbol:'|M|',meaning:'集合 M 中的位置数量；两侧竖线在这里表示集合大小'},{symbol:'t',meaning:'一个声学时间位置'},{symbol:String.raw`t\in M`,meaning:'位置 t 属于集合 M'},{symbol:'c_t',meaning:'第 t 个位置的目标聚类编号'},{symbol:String.raw`\theta`,meaning:'模型中所有可训练参数'},{symbol:String.raw`\widetilde{x}`,meaning:'经过遮蔽的输入；波浪号表示输入被修改'},{symbol:String.raw`p_\theta(c_t\mid\widetilde{x})`,meaning:'参数为 θ 的模型在看到遮蔽输入后，给正确聚类编号分配的概率'},{symbol:String.raw`\log`,meaning:'自然对数；外面的负号使高概率对应较小惩罚'},{symbol:String.raw`\sum`,meaning:'把集合中所有选中位置的项相加'}]},
        {id:'fine-tune',title:'预训练任务与下游任务分开看',paragraphs:['把预训练编码器接到 CTC 分类头后，可使用带转写数据继续训练。冻结编码器时只有新头学习；微调全部参数时编码器也随识别目标变化。两者对数据量、显存和遗忘的要求不同。','评价表示质量时可同时报告冻结特征与全量微调结果。只比较全量微调后的成绩，不能直接证明预训练表示本身线性可分，也不能证明模型对所有方言都同样稳健。']},
        {id:'leakage',title:'自监督数据也有泄漏与偏差',paragraphs:['即使未使用转写，把测试录音或测试说话人大量放入预训练数据，仍可能改变测试的解释。应交代预训练数据是否与评测重叠。','遮蔽长度、负样本来源、聚类数据和码本利用会影响学到的信息。任务可能偏向说话人、背景或音素；不能把“自监督”当作自动消除偏差的保证。']}
      ],
      implementation:[
        {id:'masked-code',title:'只对两个被遮住的位置反传',paragraphs:['logits 是尚未归一化的类别分数。targets 是每帧的目标聚类编号；mask 的 True 表示这一帧计入损失。这里验证损失选择，不构建完整声学模型。'],code:`import torch
from torch.nn import functional as F
torch.manual_seed(0)
logits = torch.randn(1, 4, 3, requires_grad=True)
targets = torch.tensor([[0, 2, 1, 0]])
mask = torch.tensor([[False, True, True, False]])
loss = F.cross_entropy(logits[mask], targets[mask])
loss.backward()
assert logits.grad[0, 0].abs().sum().item() == 0
assert logits.grad[0, 1].abs().sum().item() > 0
print(float(loss.detach()))`},
        {id:'masked-check',title:'学习目标应当无法被直接复制',paragraphs:['真实模型必须在输入端遮蔽对应的特征；只在损失端选择某些位置，却把原始答案完整暴露给网络，得到的是另一种任务。','记录被遮蔽比例和目标来源，再检查下游任务是否需要说话人信息、语音内容或二者兼有。不同层的表示可以分别评估，而不默认最后一层最佳。']}
      ]},misconceptions:['自监督预训练没有使用转写，并不意味着它不使用任何目标或标签。','聚类单元可以与音位有关，但不能未经验证就把一个聚类编号命名为某个音位。'],
    references:[{title:'wav2vec 2.0',author:'Alexei Baevski et al.',url:'https://arxiv.org/abs/2006.11477',reason:'核对遮蔽潜在表示、量化目标与对比学习的关系。'},{title:'HuBERT',author:'Wei-Ning Hsu et al.',url:'https://arxiv.org/abs/2106.07447',reason:'理解离线聚类伪标签及掩码预测任务。'}],
  },
  {
    id:'speaker-embeddings',title:'说话人嵌入：把一段声音汇总成一个向量',english:'Speaker Embeddings and Verification',module:6,minutes:7,
    topicIds:['speaker-embeddings'],prerequisites:['向量','声学特征'],summary:'把逐帧表示汇总为固定长度向量，理解相似度、验证阈值与内容混杂。',
    sections:{quick:[
      {id:'utterance-vector',title:'时长不同，仍要能够比较',paragraphs:['说话人嵌入是用于表征说话人相关特征的固定长度向量。一段两秒录音和一段五秒录音都可输出同样维度，便于比较、聚类或为其他模型提供条件。','常见流程先提取逐帧特征，再沿时间汇总，最后投影成向量。训练可以使用说话人分类目标或对比目标。嵌入可能仍包含语言内容、通道和情绪，不能自动视为纯粹的身份编码。'],flow:[{label:'声音片段',detail:'长度可以不同'},{label:'逐帧编码',detail:'提取时间变化的声学特征'},{label:'时间汇总',detail:'均值、标准差或注意力池化'},{label:'固定向量',detail:'用于相似度比较或条件化'}]},
      {id:'verification-example',title:'分类与验证的问法不同',paragraphs:['说话人分类问“属于训练中的哪一位”；验证问“两段录音是否来自同一人”。验证测试通常必须包括训练未见过的说话人，并构造同人和异人录音对。','如果同一人都在同一台麦克风上录音，而不同人使用不同设备，模型可能学会设备分类。录音条件、说话内容、时长和信噪比都应在测试中单独考察。'],checkpoint:{question:'两段音频的向量余弦相似度很高，能直接证明是同一个人吗？',answer:'不能。必须在目标场景的数据上评估同人/异人分布并选阈值，而且仍会有误接受与误拒绝。'}}
    ],deep:[
      {id:'cosine',title:'余弦相似度比较方向',paragraphs:['下面的式子先算对应坐标乘积的总和，再除以两个向量的长度。它主要比较方向，因此把某个非零向量整体乘二不会改变结果。零向量需要额外处理。'],formula:String.raw`s(a,b)=\frac{\sum_{i=1}^{D}a_i b_i}{\|a\|_2\|b\|_2}`,formulaReading:'相似度等于两个向量的点积，除以它们各自长度的乘积。',notation:[{symbol:'a,b',meaning:'两段声音的说话人向量',shape:'各有 D 个坐标的非零向量'},{symbol:'D',meaning:'嵌入的坐标数量'},{symbol:'i',meaning:'当前坐标编号，从 1 到 D'},{symbol:'a_i,b_i',meaning:'两个向量在第 i 个坐标上的数值'},{symbol:String.raw`\sum_{i=1}^{D}`,meaning:'对所有坐标的乘积求和，得到点积'},{symbol:String.raw`\|a\|_2,\|b\|_2`,meaning:'欧氏长度：坐标平方求和后开平方；下标 2 表示这种长度定义'},{symbol:'s(a,b)',meaning:'两向量的余弦相似度',example:'同方向为 1，互相垂直为 0'}]},
      {id:'pooling',title:'均值与标准差各保留什么',paragraphs:['均值池化保存每个特征维度的时间平均水平。统计池化再加入标准差，反映该维度随时间的变化幅度。注意力池化让模型学会选择更有用的帧。','池化时不能把批次末尾的补零当作真实静音。真实静音本身是否参与汇总也是设计选择；声音活动检测能排除部分非语音，但检测错误也会传入系统。']},
      {id:'threshold',title:'阈值来自验证集，而不是看到结果后挑',paragraphs:['提高接受阈值通常减少把异人认成同人的错误，却可能增加把同人拒绝的错误。等错误率是在某个阈值上两类错误相等时的指标，不是所有部署场景都应该使用的阈值。','若将嵌入送给识别或合成模型作为条件，需要通过消融实验检验它究竟提供了说话人、录音条件还是口音信息。固定长度向量是接口形式，不是可解释性的保证。']}
    ],implementation:[
      {id:'cosine-code',title:'用三维向量手算一次',paragraphs:['这个纯 Python 例子展示相似度的性质。first 和 second 分别代表两段声音的嵌入；实际系统的嵌入应来自训练好的模型。'],code:`import math
def cosine(first, second):
    dot = sum(a * b for a, b in zip(first, second))
    first_length = math.sqrt(sum(a * a for a in first))
    second_length = math.sqrt(sum(b * b for b in second))
    if first_length == 0 or second_length == 0:
        raise ValueError("zero vector has no direction")
    return dot / (first_length * second_length)

assert math.isclose(cosine([1, 2, 0], [2, 4, 0]), 1.0)
assert cosine([1, 0, 0], [0, 1, 0]) == 0.0
print(cosine([1, 2, 0], [1, 1, 1]))`},
      {id:'speaker-check',title:'建立一个不会靠录音环境作弊的测试集',paragraphs:['按说话人划分训练与测试，再在测试中组合跨设备、跨内容、跨日期的同人录音对。验证阈值只在独立验证集上选择。','报告短语音与长语音的结果，并画同人和异人得分分布。若只看整体平均，某一口音或设备上的系统性失败可能被掩盖。']}
    ]},misconceptions:['说话人嵌入不是每个维度都可以命名的生理特征表。','余弦相似度不是校准后的“同一个人的概率”。'],references:[{title:'X-vectors: Robust DNN Embeddings for Speaker Recognition',author:'David Snyder et al.',url:'https://www.danielpovey.com/files/2018_icassp_xvectors.pdf',reason:'从原始架构理解帧级网络、统计池化及说话人嵌入。'},{title:'ECAPA-TDNN',author:'Brecht Desplanques et al.',url:'https://arxiv.org/abs/2005.07143',reason:'了解通道注意力、特征聚合和注意力统计池化。'}],
  },
  {
    id:'tts-alignment',title:'从文字到声音：内容、时长与波形生成',english:'Text-to-Speech and Text–Audio Alignment',module:6,minutes:8,
    topicIds:['tts','text-audio-alignment'],prerequisites:['声学特征','序列到序列'],summary:'把发什么音、持续多久、怎样发声拆开，理解声学模型、声码器与对齐。',
    sections:{quick:[
      {id:'tts-pipeline',title:'一个汉字不会总占固定帧数',paragraphs:['TTS 是 Text-to-Speech，即文字转语音。同一句文字可以有不同语速、停顿、情绪和音色，因此文字与声学帧不是一对一关系。','典型系统把文字或音素编码成表示，决定时长或学习软对齐，生成声学特征，再由声码器生成波形。声码器在这里指把声学表示转换成波形的模型。也有系统直接生成音频词元，再解码为波形。'],flow:[{label:'文字或音素',detail:'需要说出的内容'},{label:'对齐与时长',detail:'每个单位对应哪些声音时间'},{label:'声学表示',detail:'频谱或离散音频词元'},{label:'波形生成',detail:'把内部表示转换为可播放声音'}]},
      {id:'duration-example',title:'两个音素、五帧声音',paragraphs:['假设两个音素分别需要 2 帧和 3 帧。时长展开器把第一个音素表示复制两次、第二个复制三次，得到五个时间位置。后续网络再为每个位置生成变化的声学特征，不是把一段完全相同的波形重复播放。','强制对齐是在声音和正确文字都已知时，估计它们的时间对应关系。它不验证文字是否真的正确；错误转写会使对齐边界失真。'],checkpoint:{question:'已经知道一段录音的正确文字时，寻找每个词的起止时间，属于识别还是强制对齐？',answer:'属于强制对齐。识别首先要推断文字，对齐则以给定文字为条件估计时间。'}}
    ],deep:[
      {id:'duration-sum',title:'用时长约束连接文字长度和声音长度',paragraphs:['下面描述最简单的整数帧时长。真实训练中还需要处理静音、边界、下采样及零时长单位；不同系统约定可能不同。'],formula:String.raw`T=\sum_{u=1}^{U}d_u`,formulaReading:'声音的总帧数，等于每个文字或音素单位占用的帧数相加。',notation:[{symbol:'T',meaning:'生成声学特征的总时间帧数'},{symbol:'U',meaning:'输入文字或音素单位的数量'},{symbol:'u',meaning:'当前输入单位的序号，从 1 到 U'},{symbol:'d_u',meaning:'第 u 个单位对应的帧数；d 表示 duration，即时长',example:'两个单位的时长为 2 和 3'},{symbol:String.raw`\sum_{u=1}^{U}`,meaning:'把全部输入单位的时长相加',example:'2+3=5 帧'}]},
      {id:'architecture-options',title:'自回归、时长模型与扩散可以怎样组合',paragraphs:['Tacotron 类系统通过注意力逐步生成声学帧，容易直观理解软对齐，但可能出现重复或跳读。FastSpeech 类系统显式预测时长、展开表示，再并行生成声学特征。','VITS 将变分建模、流和对抗训练结合到端到端合成中。扩散或流匹配声学模型学习从噪声走向目标声学表示，通常还受文字、说话人或参考音频条件约束。这些名称描述不同组件，不能简单排列成统一的优劣榜。']},
      {id:'alignment-quality',title:'对齐热图漂亮，不等于每个音素边界准确',paragraphs:['单调对齐只要求文字顺序与时间顺序一致，不要求每条边界与人工标注完全相同。协同发音、停顿、弱读和插入音会使边界模糊。','评估合成要分开看可懂度、自然度、说话人相似度、韵律和延迟。用识别器计算合成语音的文字错误率只覆盖其中一部分，而且会带入识别器自身的偏差。']}
    ],implementation:[
      {id:'duration-code',title:'运行一个最小的时长展开器',paragraphs:['phoneme_vectors 是音素表示，durations 是对应的整数帧数。这个例子只展示对齐，不产生可播放声音。'],code:`phoneme_vectors = [[1.0, 0.0], [0.0, 1.0]]
durations = [2, 3]
assert len(phoneme_vectors) == len(durations)
assert all(isinstance(d, int) and d >= 0 for d in durations)
expanded = []
for vector, frame_count in zip(phoneme_vectors, durations):
    expanded.extend([vector.copy() for _ in range(frame_count)])
assert len(expanded) == sum(durations) == 5
assert expanded[0] == expanded[1] == [1.0, 0.0]
print(expanded)`},
      {id:'tts-check',title:'先听错在什么地方，再决定调整哪一层',paragraphs:['读错字先检查文字前端和音素转换；漏读、重复先检查对齐；时长奇怪先检查时长预测；声音发毛先检查声学表示和声码器。保持组件边界清楚，比统一归因于“模型不够大”更有效。','做强制对齐时保留原始音频和转写，输出可回看的时间边界。随机抽查低置信度片段，并检查帧移到秒的单位转换。']}
    ]},misconceptions:['强制对齐使用给定文字，并不意味着录音确实完整说出了所有文字。','时长展开复制的是内部表示，最终波形仍由后续网络生成。'],references:[{title:'Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions',author:'Jonathan Shen et al.',url:'https://arxiv.org/abs/1712.05884',reason:'理解声学特征预测与声码器的分工。'},{title:'FastSpeech 2',author:'Yi Ren et al.',url:'https://arxiv.org/abs/2006.04558',reason:'理解时长、音高与能量条件化的非自回归合成。'},{title:'Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech',author:'Jaehyeon Kim et al.',url:'https://arxiv.org/abs/2106.06103',reason:'理解 VITS 如何结合潜变量、对齐、流与波形生成。'}],
  },
  {
    id:'speech-language-models',title:'让语音与文字在同一个系统里协作',english:'Speech Language Models and Multimodal Representations',module:6,minutes:8,
    topicIds:['speech-language-models','multimodal-representations'],prerequisites:['词元与嵌入','语音自监督','Transformer'],summary:'区分连续音频特征、离散语音词元和跨模态对齐，理解统一序列接口的收益与代价。',
    sections:{quick:[
      {id:'interfaces',title:'语言模型不一定要先看到一份转写',paragraphs:['把语音送进语言模型，一条路线是先识别成文字；另一条路线是用声学编码器提取连续特征，再通过连接层映射到语言模型的输入维度。连接层常被称为 adapter，即适配器。','还可以把声音压缩成离散音频词元，用序列模型预测这些词元。词元是码本中的编号，不一定是音位、音节或一个词。能够预测音频词元，不自动意味着已经理解它们的语言学结构。'],flow:[{label:'原始声音',detail:'保留内容与声学细节'},{label:'连续特征或离散词元',detail:'为语言模型提供输入接口'},{label:'跨模态序列模型',detail:'结合语音、文字及上下文完成任务'},{label:'文字或声音输出',detail:'根据目标使用文本解码或音频解码'}]},
      {id:'token-budget',title:'声音的词元预算可能比文字大得多',paragraphs:['假设音频每秒产生 50 个时间步，每步有 8 个码本编号，串行展开后就是每秒 400 个编号。十秒声音将占 4000 个位置；采用并行码本预测或压缩策略会改变这一成本。','语义词元偏向保留语言内容，声学词元通常还需保留音色、韵律等用于重建声音的信息。这是任务倾向，不是严格的语义—音色完全分离。'],checkpoint:{question:'把声音先转成文字，通常会丢掉哪些信息？',answer:'可能丢掉语调、音色、停顿细节、情绪和非语言声音；是否重要取决于任务。'}}
    ],deep:[
      {id:'budget-equation',title:'先算清楚序列长度',paragraphs:['以下式子适用于把所有码本编号逐一串行展开的情形。模型若让多个码本并行、采用延迟模式或进一步合并时间步，应按实际序列化方式重新计算。'],formula:String.raw`N=RKC`,formulaReading:'总编号数量等于音频秒数，乘以每秒时间步数，再乘以每步的码本数。',notation:[{symbol:'N',meaning:'串行展开后离散编号的数量'},{symbol:'R',meaning:'音频时长，单位是秒',example:'10 秒'},{symbol:'K',meaning:'编码器每秒输出的时间步数',example:'50 步/秒'},{symbol:'C',meaning:'每个时间步的码本数量',example:'8 个码本'},{symbol:'RKC',meaning:'把 R、K、C 三个量相乘；紧挨着表示乘法',example:'10×50×8=4000'}]},
      {id:'alignment-options',title:'跨模态对齐有几种不同含义',paragraphs:['对比学习让配对音频与文字的整体表示靠近，适合检索；交叉注意力让一个模态逐位置读取另一个模态，适合条件生成；时间对齐则寻找文字单位与声音时间的对应。它们解决的问题不相同。','只有整体对比目标时，模型可能抓住主题而不精确定位每个音素。若研究发音差异，需要额外检查局部时间信息，不能用整体检索成绩替代音位分析。']},
      {id:'training-stages',title:'接口训练、联合训练和推理条件要区分',paragraphs:['冻结语言模型只训练连接层，可以减少更新参数，但不保证声学信息充分进入语言模型。联合微调能力更强，也可能改变原有文字能力。需要用任务组合与保留集评估这种取舍。','指令中的文字提示、参考说话人音频和对话历史都会改变输出。测试时应明确哪些信息可见，尤其不能把目标答案或同一录音的转写泄漏进上下文。']}
    ],implementation:[
      {id:'adapter-code',title:'把声学维度映射到语言模型维度',paragraphs:['这个连接层只改变每个位置的特征维度，不减少时间步，也没有自动对齐词元。audio_features 是声学帧，projection 是可训练线性映射。'],code:`import torch
from torch import nn
torch.manual_seed(3)
audio_features = torch.randn(2, 50, 16)  # 2 条录音，50 帧，每帧 16 维
projection = nn.Linear(16, 32)
language_inputs = projection(audio_features)
assert language_inputs.shape == (2, 50, 32)
seconds, steps_per_second, codebooks = 10, 50, 8
serial_token_count = seconds * steps_per_second * codebooks
assert serial_token_count == 4000
print(language_inputs.shape, serial_token_count)`},
      {id:'multimodal-check',title:'用干预检查模型到底听到了什么',paragraphs:['分别替换文字内容、说话人、语速、背景噪声和语调，观察输出是否按预期变化。对同一音频重复提问可检查语言侧不稳定性，但不能直接测出声学编码质量。','明确记录连续或离散接口、时间压缩倍率、哪些参数更新、输入上下文长度以及输出格式。把“多模态能力”拆成可复现的任务与干预。']}
    ]},misconceptions:['音频词元编号不天然对应人类语言中的词或音素。','共享向量维度不代表两个模态已完成语义对齐。'],references:[{title:'AudioLM: a Language Modeling Approach to Audio Generation',author:'Zalán Borsos et al.',url:'https://arxiv.org/abs/2209.03143',reason:'理解语义与声学离散表示的分层序列建模。'},{title:'Speak, Read and Prompt',author:'Eugene Kharitonov et al.',url:'https://arxiv.org/abs/2302.03540',reason:'理解文字、语义词元与声学词元的分工。'},{title:'CLAP: Learning Audio Concepts From Natural Language Supervision',author:'Benjamin Elizalde et al.',url:'https://arxiv.org/abs/2206.04769',reason:'理解音频—文字对比学习与生成任务的区别。'}],
  },
  {
    id:'pytorch-workflow',title:'把数据、自动微分与训练循环接起来',english:'Dataset, Autograd and Training Loops',module:7,minutes:9,
    topicIds:['pytorch-autograd','data-pipeline','training-loop'],prerequisites:['反向传播','张量与形状'],summary:'明确每一步的输入、状态与副作用，写出可以继续训练和检查错误的最小循环。',
    sections:{quick:[
      {id:'loop-roles',title:'一个训练步骤只做这几件事',paragraphs:['Dataset 表示怎样读取单个样本；DataLoader 负责取样、组合批次和可选的多进程加载。模型负责前向计算；损失函数把预测与目标变成一个数；自动微分计算梯度；优化器使用梯度更新参数。','这几个职责分开，问题才容易定位。数据读取成功不代表标签正确，损失下降也不代表评估没有泄漏。'],flow:[{label:'读取批次',detail:'输入、目标、长度和掩码一起进入模型'},{label:'前向与损失',detail:'由预测和正确答案计算误差'},{label:'清梯度与反传',detail:'准备新的梯度并计算导数'},{label:'更新与记录',detail:'修改参数，记录损失、步数和配置'}]},
      {id:'gradient-state',title:'梯度是会累加的状态',paragraphs:['在 PyTorch 中，backward() 通常把新梯度累加到参数的 .grad 属性，而不是自动覆盖。普通单步训练要调用 optimizer.zero_grad()；有意进行梯度累积时则按累积计划清零。','计算图记录张量操作和反向需要的中间值。对损失调用 .item() 后得到普通 Python 数，不能再用它反传；日志记录可以这样做，但参与损失的路径不能被无意断开。'],checkpoint:{question:'连续两个批次都调用 backward()，中间不清梯度，会发生什么？',answer:'参数的梯度会累加。如果这是有意的梯度累积，需要相应处理损失缩放和更新频率；否则就是训练循环错误。'}}
    ],deep:[
      {id:'batch-loss',title:'批次平均决定梯度的尺度',paragraphs:['以下均方误差用于一维回归。把每个样本的预测与答案相减、平方，再对批次求平均。最后一个批次可能更小；汇总整轮损失时应按样本数加权，不能无条件平均各批次的平均值。'],formula:String.raw`L=\frac{1}{B}\sum_{i=1}^{B}(\widehat y_i-y_i)^2`,formulaReading:'将批次中每个样本的预测误差平方，把它们相加，再除以样本数量。',notation:[{symbol:'L',meaning:'这个批次的平均平方误差',shape:'一个数'},{symbol:'B',meaning:'当前批次中的样本数量，不一定等于设定的最大批大小'},{symbol:'i',meaning:'批次中的样本序号'},{symbol:'y_i',meaning:'第 i 个样本的正确目标值'},{symbol:String.raw`\widehat y_i`,meaning:'第 i 个样本的模型预测值；帽子表示估计而非真实值'},{symbol:String.raw`\sum_{i=1}^{B}`,meaning:'从第 1 个样本到第 B 个样本求和'},{symbol:'{}^2',meaning:'平方，使正负误差都成为非负惩罚'}]},
      {id:'checkpoint-state',title:'保存权重和保存可继续训练的状态不同',paragraphs:['仅保存 model.state_dict() 通常足够恢复模型参数和持久缓冲区用于推理。若要继续训练，还应保存优化器、学习率调度器、训练步数、混合精度缩放器及必要随机状态。state_dict 是按名称组织状态的字典。','恢复时核对模型结构、数据切分和配置版本。只恢复权重却丢失 Adam 的动量状态，得到的训练轨迹不会与原运行无缝接续。']},
      {id:'data-contract',title:'补齐、打乱和数据增强要遵守切分边界',paragraphs:['不同长度序列组成批次时，补齐长度必须与掩码同步。分类标签通常是整数编号，回归目标则是连续值；数据类型和损失接口应匹配。','归一化统计量只从训练集估计。语音按说话人、图像按受试对象、时间序列按时间切分，防止同源样本同时进入训练和测试。验证和测试通常不使用随机数据增强。']}
    ],implementation:[
      {id:'training-code',title:'完整训练一个只有一个输入的回归模型',paragraphs:['下面用合成数据学习“输出是输入的两倍再加一”。inputs 是输入列，targets 是正确答案；DataLoader 每次取两个样本。最后在内存中保存并恢复模型状态，不写入磁盘。'],code:`import io
import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader
torch.manual_seed(0)
inputs = torch.tensor([[-1.0], [0.0], [1.0], [2.0]])
targets = 2 * inputs + 1
loader = DataLoader(TensorDataset(inputs, targets), batch_size=2, shuffle=True)
model = nn.Linear(1, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
for epoch in range(150):
    model.train()
    for batch_inputs, batch_targets in loader:
        optimizer.zero_grad(set_to_none=True)
        loss = (model(batch_inputs) - batch_targets).square().mean()
        loss.backward()
        optimizer.step()
model.eval()
with torch.no_grad():
    assert (model(inputs) - targets).square().mean() < 1e-4
buffer = io.BytesIO()
torch.save(model.state_dict(), buffer)
buffer.seek(0)
restored = nn.Linear(1, 1)
restored.load_state_dict(torch.load(buffer, weights_only=True))
assert torch.allclose(restored(inputs), model(inputs))
print(model.weight.detach(), model.bias.detach())`},
      {id:'training-check',title:'真正训练前先做三项小检查',paragraphs:['用单批次检查输入形状、目标范围和损失数值；用极小数据集检查模型能否过拟合；再比较保存前后同一输入的输出。三项检查通过后才扩展到完整训练。','本例只恢复模型以验证保存机制，未声称恢复完整训练轨迹。实际断点续训应把上一节列出的状态一起保存，并记录软件版本。']}
    ]},misconceptions:['model.eval() 不会自动停止梯度记录；它控制部分层的训练/评估行为。','日志中的平均损失没有按样本或有效词元数加权，可能误导不同批次之间的比较。'],references:[{title:'Optimizing Model Parameters',author:'PyTorch',url:'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',reason:'核对 DataLoader、损失、清梯度、反传和参数更新的分工。'},{title:'Autograd mechanics',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/notes/autograd.html',reason:'理解计算图、梯度记录与不同梯度模式。'},{title:'Saving and Loading Models',author:'PyTorch',url:'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html',reason:'核对权重保存与完整训练检查点的差别。'}],
  },
  {
    id:'evaluation-metrics',title:'评估：先定义错误，再计算分数',english:'Evaluation, Error Rates and Data Splits',module:7,minutes:8,
    topicIds:['evaluation-metrics'],prerequisites:['概率与平均数'],summary:'用任务对应的单位与数据切分评价模型，理解总体平均、分组结果与不确定性。',
    sections:{quick:[
      {id:'metric-question',title:'分数必须回答一个明确问题',paragraphs:['分类准确率统计预测正确的样本比例；精确率问“模型报出的正例有多少是真的”，召回率问“真正的正例找到了多少”。少数类很稀少时，只看准确率会掩盖完全漏检。','语音识别常用文字编辑距离：把预测序列变成参考序列所需的最少替换、删除和插入次数。按词、字或音素计算，得到的指标衡量不同单位，不能直接混在一起比较。'],flow:[{label:'明确目标',detail:'需要评估分类、转写、检索还是生成'},{label:'固定处理规则',detail:'分词、大小写、标点和空白如何处理'},{label:'逐样本计算',detail:'保存错误与分母，而不只保存百分比'},{label:'汇总与分组',detail:'总体表现、条件差异和误差范围'}]},
      {id:'edit-example',title:'一句话中的三种编辑',paragraphs:['参考文字是“我 喜欢 这个 模型”，预测是“我 很 喜欢 模型”。可以删除预测中多出的“很”，再补回缺失的“这个”，共有两次编辑，参考有四个词，所以词错误率为二除以四，即 50%。','文本规范化必须先固定。若一个系统去掉标点而另一个保留，得到的错误率并不可比。中文“按字”与“按词”也会改变分母。'],checkpoint:{question:'插入错误很多时，词错误率能超过 100% 吗？',answer:'能。分子包含插入次数，而分母只数参考词数量，二者没有保证分子小于分母。'}}
    ],deep:[
      {id:'wer',title:'词错误率的分子和分母分别是什么',paragraphs:['以下式子是常用的词错误率定义。多条录音的语料级分数应先加总编辑次数和参考词数，再做除法。参考为空的样本需要单独约定，不能直接除零。'],formula:String.raw`\mathrm{WER}=\frac{S+D+I}{N}`,formulaReading:'词错误率等于替换、删除和插入次数相加，再除以参考文本的词数量。',notation:[{symbol:String.raw`\mathrm{WER}`,meaning:'Word Error Rate，词错误率；这是指标名称，不是三个量相乘'},{symbol:'S',meaning:'最优编辑对齐中的替换次数'},{symbol:'D',meaning:'最优编辑对齐中的删除次数'},{symbol:'I',meaning:'最优编辑对齐中的插入次数'},{symbol:'N',meaning:'参考文本中的词数量',example:'参考有四个词，N 就是 4'},{symbol:'/',meaning:'除法；需要 N 大于零'}]},
      {id:'macro-micro',title:'平均每位说话人，还是平均每个词',paragraphs:['语料级错误率让词数更多的说话人贡献更大。先分别计算每位说话人的错误率再平均，则每位说话人权重相同。两者都可有意义，但回答的问题不同。','例如一位说话人有十个词全错，另一位有九十个词全对。语料级错误率是 10%；按说话人平均是 50%。报告时写明统计单位和权重，避免把差异藏在一个数字里。']},
      {id:'uncertainty',title:'保留测试集，报告条件差异',paragraphs:['验证集用于挑选超参数和停止时间；测试集留到方案确定后使用。反复根据测试成绩修改方案，会把测试集变成隐含的验证集。','比较语音模型时，可按说话人或录音做配对重采样，以估计分数差的不确定性；不能把高度相关的相邻帧都当成独立样本。还应报告时长、口音、信噪比等分组表现。']}
    ],implementation:[
      {id:'edit-code',title:'用动态规划计算最少编辑次数',paragraphs:['previous 和 current 保存编辑距离表相邻两行，避免保存整张表。row 与 column 是从 1 开始的序号；代码只计算总编辑次数，不回溯每类编辑。'],code:`def edit_distance(reference, hypothesis):
    previous = list(range(len(hypothesis) + 1))
    for row, expected in enumerate(reference, start=1):
        current = [row]
        for column, predicted in enumerate(hypothesis, start=1):
            replace_cost = previous[column - 1] + (expected != predicted)
            delete_cost = previous[column] + 1
            insert_cost = current[column - 1] + 1
            current.append(min(replace_cost, delete_cost, insert_cost))
        previous = current
    return previous[-1]

reference = "我 喜欢 这个 模型".split()
hypothesis = "我 很 喜欢 模型".split()
errors = edit_distance(reference, hypothesis)
assert errors == 2
print("WER:", errors / len(reference))`},
      {id:'metric-check',title:'保存足够的信息，才能解释分数',paragraphs:['为每条样本保存参考、预测、样本标识、编辑次数、参考长度和分组信息。结果应能回到真实错误例子，而不是只剩一个百分比。','检索任务还要写清候选池大小；生成任务需要说明自动评估器和人工评审规则。评估器的偏差不会因为输出一个小数就消失。']}
    ]},misconceptions:['词错误率不是概率，因此可以超过 1。','总体分数变好，不代表每位说话人或每个条件都变好。'],references:[{title:'Speech and Language Processing',author:'Daniel Jurafsky & James H. Martin',url:'https://web.stanford.edu/~jurafsky/slp3/',reason:'核对编辑距离、语音识别评估和任务定义。'},{title:'Statistical Significance Tests for Comparing Machine Learning Algorithms',author:'Thomas G. Dietterich',url:'https://direct.mit.edu/neco/article/10/7/1895/6224/Approximate-Statistical-Tests-for-Comparing',reason:'理解算法比较中的相关性与统计检验假设。'}],
  },
  {
    id:'experiment-reproducibility',title:'让一次实验变成能够复查的证据',english:'Experiment Tracking, Search and Reproducibility',module:7,minutes:8,
    topicIds:['experiment-tracking','reproducibility-papers'],prerequisites:['训练循环','评估流程'],summary:'把研究问题、配置、数据版本与不确定性连在一起，避免只追逐一条漂亮曲线。',
    sections:{quick:[
      {id:'record-question',title:'先写一句能被否定的假设',paragraphs:['例如“在固定训练预算下，某归一化方式会降低不同随机种子之间的波动”。这里同时限定了比较对象、预算和结果。若只说“新方法更好”，实验很难告诉你究竟什么发生了变化。','每次运行保存完整配置、代码版本、数据清单或版本标识、随机种子、训练步数、验证规则和输出路径。实验名称方便人读，机器可读取的配置负责精确复现。'],flow:[{label:'提出假设',detail:'明确比较什么以及保持什么固定'},{label:'预先定评估',detail:'指标、切分、预算与选择规则'},{label:'运行并记录',detail:'配置、代码、数据和随机种子'},{label:'比较与复查',detail:'多次运行、错误例子和消融实验'}]},
      {id:'search-budget',title:'超参数搜索也是实验预算',paragraphs:['超参数是训练过程外部选择的设置，例如学习率、正则强度或层数。搜索时只能根据验证集选择配置；最终测试应使用事先固定的选择流程。','如果新方法试了五十组配置，而基线只试一组，结果差异可能来自搜索预算。随机搜索、网格搜索和逐步缩小范围各有用途；记录尝试过的失败配置同样重要。'],checkpoint:{question:'复现时权重随机种子一样，就能保证跨设备完全逐位相同吗？',answer:'不能。软件版本、硬件、算子实现、数据顺序和并行行为都可能影响结果。随机种子是必要记录之一，不是全部保证。'}}
    ],deep:[
      {id:'seed-variation',title:'平均成绩与运行波动一起报告',paragraphs:['下面只描述多次独立训练运行的样本均值与样本标准差。它们反映这些运行的离散程度，不等同于测试集统计不确定性，也不是置信区间。'],formula:String.raw`\bar r=\frac{1}{K}\sum_{k=1}^{K}r_k,\qquad s=\sqrt{\frac{1}{K-1}\sum_{k=1}^{K}(r_k-\bar r)^2}`,formulaReading:'先把每次运行的成绩平均；再计算各成绩到均值的平方距离，除以运行次数减一，最后开平方。',notation:[{symbol:'K',meaning:'独立训练运行的次数，标准差公式要求至少两次'},{symbol:'k',meaning:'第几次运行的序号'},{symbol:'r_k',meaning:'第 k 次运行的评估成绩'},{symbol:String.raw`\bar r`,meaning:'所有运行成绩的均值；上横线表示平均值'},{symbol:'s',meaning:'这些运行成绩的样本标准差，与原指标单位相同'},{symbol:String.raw`\sum`,meaning:'将每次运行对应的项相加'},{symbol:'{}^2',meaning:'平方，用来累积不带正负抵消的距离'},{symbol:String.raw`\sqrt{\cdot}`,meaning:'平方根，把平方距离恢复到原指标单位'}]},
      {id:'reading-paper',title:'把论文方法翻译成一个实验表',paragraphs:['阅读顺序可以是任务与数据、核心变化、训练目标、计算预算、评估协议、消融和失败案例。先知道作者要证明哪一项变化有效，再深入公式细节。','把论文中明确给出的设定、根据代码推断的设定和暂时未知的设定分开记录。复现中修改批大小、分词器或预处理后，应说明修改，而不是把结果差异全部归因于实现错误。']},
      {id:'causal-comparison',title:'一次尽量只改变能解释的因素',paragraphs:['消融实验删除或替换一个组件，观察性能变化。为避免额外参数量或训练时间成为混杂因素，可加入等参数量或等预算对照。','当多个组件存在交互时，逐个删除并不能完整说明它们的联合效果。先做最有价值的小对照，再决定是否需要更全面的组合实验。负结果也有用：它缩小了方法有效的条件。']}
    ],implementation:[
      {id:'record-code',title:'生成可比较的运行记录',paragraphs:['这个纯 Python 例子演示配置的固定序列化、唯一摘要和多次运行统计。成绩只是演示数字，不是任何真实模型的测试结果。'],code:`import hashlib
import json
import statistics
config = {"learning_rate": 0.001, "batch_size": 16,
          "data_version": "toy-v1", "max_steps": 1000}
canonical = json.dumps(config, sort_keys=True, separators=(",", ":"))
config_id = hashlib.sha256(canonical.encode()).hexdigest()[:12]
scores = [0.21, 0.20, 0.22]
record = {"config_id": config_id, "config": config,
          "seeds": [1, 2, 3], "scores": scores,
          "mean": statistics.mean(scores),
          "sample_std": statistics.stdev(scores)}
assert abs(record["mean"] - 0.21) < 1e-12
print(json.dumps(record, indent=2))`},
      {id:'reproduce-check',title:'一次能够接力的复现记录',paragraphs:['把运行命令、环境依赖、数据获取与处理步骤、检查点和评估脚本一起保存。另一位读者应能从空目录知道先做哪一步，而不依赖你的终端历史。','配置摘要只能检验配置文本是否一致，不能代表代码、数据和环境也相同。对大数据保存版本或文件清单，避免无意记录个人音频内容等不必要信息。']}
    ]},misconceptions:['一个随机种子的最好结果不能代表方法的稳定表现。','完全复现数值与复现科学结论有关联，但不是同一个要求；结论应在合理扰动下仍能成立。'],references:[{title:'Reproducibility',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/notes/randomness.html',reason:'核对随机性、确定性算子与跨平台复现的边界。'},{title:'Random Search for Hyper-Parameter Optimization',author:'James Bergstra & Yoshua Bengio',url:'https://jmlr.org/papers/v13/bergstra12a.html',reason:'理解搜索空间、预算与随机搜索的作用。'}],
  },
  {
    id:'debugging-training',title:'训练出问题时，从最小可验证部分开始',english:'Debugging Training',module:7,minutes:7,
    topicIds:['debugging-training'],prerequisites:['训练循环','反向传播'],summary:'把数据、损失、梯度和参数更新逐项确认，避免同时更换一切而失去判断依据。',
    sections:{quick:[
      {id:'debug-order',title:'损失不下降，先不要扩大模型',paragraphs:['先检查一条真实样本的输入和标签；再检查一个批次的形状、损失与梯度；然后让模型在极小数据集上过拟合。只有这一条链路通了，完整数据上的结果才有可解释性。','观察损失是常数、突然变成非数值、缓慢下降，还是训练下降但验证上升。不同症状指向不同问题，不能用同一个学习率改动解释全部。'],flow:[{label:'看数据',detail:'输入和目标是否真的是期望内容'},{label:'算一批',detail:'形状、损失范围和掩码是否一致'},{label:'查梯度',detail:'有无断图、异常值或错误累积'},{label:'试小样本',detail:'确认有能力记住最小训练集合'}]},
      {id:'symptoms',title:'把症状写成具体检查',paragraphs:['若损失为非数值，检查对零取对数、除零、溢出、空的有效样本集合，以及输入本身是否含非法数。非数值常在代码中显示为 NaN，即 Not a Number。','若所有梯度为零，检查参数是否被冻结、损失是否真的依赖参数、激活是否进入零梯度区域。若只有验证变差，检查过拟合、分布差异、预处理和模型评估模式。'],checkpoint:{question:'训练损失下降，能排除标签错位吗？',answer:'不能。模型可能在拟合错误对应关系甚至泄漏信息。必须检查实际样本和标签，并通过独立验证判断。'}}
    ],deep:[
      {id:'gradient-check',title:'用一次小扰动验证导数',paragraphs:['对于只有一个标量参数的光滑小函数，可用左右各扰动一次的损失变化近似导数。将它与自动微分对比，可以定位局部数学或实现错误。不要在有随机变化的前向过程中直接比较。'],formula:String.raw`g_{\mathrm{num}}=\frac{L(w+\varepsilon)-L(w-\varepsilon)}{2\varepsilon}`,formulaReading:'分别把参数增加和减少一个很小的量，计算两次损失之差，再除以两次参数位置之间的距离。',notation:[{symbol:'w',meaning:'要检查的一个标量参数'},{symbol:'L(w)',meaning:'参数设为 w 时的标量损失'},{symbol:String.raw`\varepsilon`,meaning:'很小的正扰动量；读作 epsilon',example:'在双精度小函数上可先试 0.000001'},{symbol:String.raw`g_{\mathrm{num}}`,meaning:'数值估计的导数；num 下标表示 numerical，即数值法'},{symbol:String.raw`2\varepsilon`,meaning:'左侧和右侧两个扰动位置之间的总距离'}]},
      {id:'isolation',title:'每次只引入一个复杂因素',paragraphs:['从单设备、较高数值精度、固定小数据开始，再逐步开启数据增强、混合精度、梯度累积和分布式训练。若开启某一步后结果发生异常，就有了清晰的定位范围。','记录每层的激活范围、梯度范数和参数更新量，可区分“梯度存在但更新没有执行”“更新太小”和“局部数值爆炸”。统计应抽样收集，避免日志本身耗尽内存。']},
      {id:'loss-contract',title:'损失接口错误往往不会报语法错',paragraphs:['交叉熵接口通常直接接收未归一化的类别分数；先 softmax 再传入可能重复处理。均方误差的广播可能把预测列和目标行扩成更大的矩阵，仍能算出一个损失，却不是想要的逐样本比较。','序列任务还要核对 padding 是否被忽略、有效长度是否正确、标签是否整体错开一位。对语言模型，输入和下一词元目标的移位关系要用实际字符串检查。']}
    ],implementation:[
      {id:'gradient-code',title:'把导数错误缩小到一个数',paragraphs:['这里检查平方误差对权重的导数。loss 是损失函数，numeric 是数值导数，analytic 是手算导数。整个例子仅依赖 Python 标准库。'],code:`import math
input_value, target, weight = 2.0, 1.0, 0.3
def loss(candidate_weight):
    error = candidate_weight * input_value - target
    return 0.5 * error * error

epsilon = 1e-6
numeric = (loss(weight + epsilon) - loss(weight - epsilon)) / (2 * epsilon)
analytic = (weight * input_value - target) * input_value
assert math.isclose(numeric, analytic, rel_tol=1e-7, abs_tol=1e-7)
print(numeric, analytic)`},
      {id:'debug-stop',title:'检查通过后，再回到真实问题',paragraphs:['有限差分只能验证局部导数，不能验证训练数据、评估协议或模型假设。极小数据可过拟合也不保证泛化，只说明训练链路至少有能力工作。','修复后保留能捕捉该问题的最小例子。若改动多个因素才恢复正常，逐一回退或对照，避免把偶然结果当作原因。']}
    ]},misconceptions:['训练不稳定并不总是学习率太大；标签、掩码和损失缩放同样常见。','梯度检查通过，只说明所检查的局部计算一致，不代表整个研究结论正确。'],references:[{title:'Autograd mechanics',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/notes/autograd.html',reason:'核对计算图和梯度模式，识别断图与错误梯度累积。'},{title:'CS231n: Neural Networks Part 3',author:'Stanford',url:'https://cs231n.github.io/neural-networks-3/',reason:'学习梯度检查、小数据过拟合和训练诊断的具体方法。'}],
  },
  {
    id:'training-inference',title:'训练与推理：同一组权重，不同的执行规则',english:'Training Mode, Evaluation Mode and Inference',module:7,minutes:7,
    topicIds:['training-inference'],prerequisites:['训练循环','Dropout与归一化'],summary:'分清层的行为模式、梯度记录和生成采样三个开关，避免评估时误把它们当成同一件事。',
    sections:{quick:[
      {id:'three-switches',title:'三个开关各自控制什么',paragraphs:['model.train() 与 model.eval() 改变部分层的行为，例如 Dropout 是否随机丢弃、BatchNorm 使用当前批次统计还是已保存统计。它们不直接决定是否记录梯度。','torch.no_grad() 或 torch.inference_mode() 控制自动微分相关开销。生成时采用贪心、温度采样还是束搜索，则是解码策略；即使在 eval 模式，采样仍可使输出随机。'],flow:[{label:'恢复模型状态',detail:'权重和必要缓冲区都加载完整'},{label:'设置层行为',detail:'评估时通常调用 model.eval()'},{label:'设置梯度模式',detail:'普通推理通常不记录反向图'},{label:'设置解码规则',detail:'明确是否采样以及温度等配置'}]},
      {id:'dropout-example',title:'Dropout 为什么训练时放大保留下来的值',paragraphs:['假设一个激活值是 2，每次保留的概率是 0.5。若被保留，就放大到 4；否则变为 0。反复随机平均后仍是 2，这叫反向缩放式 Dropout 的期望保持。','评估时通常不再随机丢弃，也不再放大，直接使用原激活。单次随机输出与评估输出不同是正常现象，只有多次平均才近似相等。'],checkpoint:{question:'调用 model.eval() 后，还能计算输入梯度吗？',answer:'可以，只要梯度记录仍开启且输入需要梯度。eval 控制层行为，不是自动微分的总开关。'}}
    ],deep:[
      {id:'dropout-equation',title:'把保留概率写清楚',paragraphs:['这里用保留概率写公式。注意 PyTorch 的 Dropout 参数 p 表示丢弃概率，等于这里保留概率的一减，因此使用接口时不要混淆。'],formula:String.raw`\widetilde h=\frac{mh}{q},\qquad m\sim\operatorname{Bernoulli}(q)`,formulaReading:'随机生成一个只取零或一的保留开关，将原激活乘以开关，再除以保留概率。',notation:[{symbol:'h',meaning:'原来的一个激活值',example:'2'},{symbol:String.raw`\widetilde h`,meaning:'训练时经过随机 Dropout 后的激活；波浪号表示修改后的值'},{symbol:'q',meaning:'保留该激活的概率，必须大于零且不超过一',example:'0.5'},{symbol:'m',meaning:'随机开关，保留时为 1，丢弃时为 0'},{symbol:String.raw`\sim`,meaning:'从右侧所写的概率分布抽样'},{symbol:String.raw`\operatorname{Bernoulli}(q)`,meaning:'以概率 q 取 1、以概率一减 q 取 0 的二值分布'},{symbol:'mh/q',meaning:'m、h 相乘，再除以 q；不是函数名称'}]},
      {id:'batchnorm',title:'BatchNorm 的评估还依赖训练留下的统计',paragraphs:['常规 BatchNorm 在训练时根据批次统计归一化，并更新运行统计；评估时通常使用保存的运行均值和方差。若只保存部分参数、忘记缓冲区，恢复后的行为可能改变。','如果明确关闭跟踪运行统计，评估行为又不同，因此应以具体配置为准。LayerNorm 和 RMSNorm 不沿批次维护同样的运行统计，但它们所在模型仍可能包含其他训练模式相关层。']},
      {id:'latency',title:'推理速度也要写清测量条件',paragraphs:['热身前后、不同批大小、输入长度和生成长度都会改变速度。GPU 操作通常异步执行，直接用普通计时包围一次调用可能只测到提交任务的时间，需要正确同步或使用设备计时机制。','语言模型的提示词处理和逐词元生成具有不同计算特点。语音系统还应区分首字延迟、流式稳定输出延迟以及整段处理速度，不能用一个吞吐量替代全部体验。']}
    ],implementation:[
      {id:'mode-code',title:'亲自分开检查 eval 与 no_grad',paragraphs:['这段代码让 Dropout 在评估时保持输入不变，并证明 eval 模式仍可反传。随后用 no_grad 单独关闭梯度记录。'],code:`import torch
from torch import nn
torch.manual_seed(0)
layer = nn.Dropout(p=0.5)  # p 是丢弃概率
inputs = torch.ones(8, requires_grad=True)
layer.eval()
output = layer(inputs)
assert torch.equal(output, inputs)
output.sum().backward()
assert torch.equal(inputs.grad, torch.ones(8))
with torch.no_grad():
    prediction = inputs * 3
assert not prediction.requires_grad
layer.train()
training_output = layer(torch.ones(100))
assert set(training_output.tolist()).issubset({0.0, 2.0})
print("eval mode and gradient mode are separate")`},
      {id:'inference-check',title:'一份能解释预测差异的配置',paragraphs:['同时记录模型版本、前处理、层模式、数值精度、梯度模式、解码参数和随机种子。排查训练与推理结果不一致时，按这些开关逐项比较。','需要做归因、对抗扰动或输入优化时，可能有意在 eval 模式保留梯度。这与普通无需梯度的部署推理是不同用途。']}
    ]},misconceptions:['eval 不是“冻结全部参数”命令，也不是“禁止梯度”命令。','推理时输出变化可能来自采样或输入处理，并不必然来自 Dropout 忘记关闭。'],references:[{title:'Module.train and Module.eval',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html',reason:'核对模型模式切换对各子模块行为的影响。'},{title:'Autograd mechanics: locally disabling gradient computation',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/notes/autograd.html',reason:'区分评估模式、no-grad 与 inference mode。'}],
  },
  {
    id:'compute-memory',title:'显存装了什么：参数、状态、激活与缓存',english:'Parameters, FLOPs and GPU Memory',module:7,minutes:8,
    topicIds:['compute-memory'],prerequisites:['矩阵乘法','训练循环'],summary:'分别估算参数存储、训练状态、激活和推理缓存，避免只看参数量判断能否运行。',
    sections:{quick:[
      {id:'memory-components',title:'模型文件大小不是训练显存',paragraphs:['训练显存通常包括参数、梯度、优化器状态、反向需要的中间激活以及临时工作区。混合精度还可能保存高精度主权重，具体取决于实现。','推理通常不需要梯度与优化器状态，但自回归生成可能保存键值缓存。上下文越长、批次越大，缓存和激活也会增大。'],flow:[{label:'参数',detail:'模型学到的权重与偏置'},{label:'训练状态',detail:'梯度、动量及其他优化器状态'},{label:'中间激活',detail:'为反向计算保留或重新计算'},{label:'运行缓存',detail:'工作区、键值缓存和内存分配器余量'}]},
      {id:'parameter-example',title:'一个小线性层有多少参数',paragraphs:['输入 16 维、输出 32 维的线性层有 16 乘 32 个权重，再加 32 个偏置，共 544 个参数。每个数用 4 字节存储时，参数本身占 2176 字节。','若使用常规 32 位 Adam 并保存参数、梯度及两个动量状态，四类数组约占每参数 16 字节。这个简化估算尚未包含激活和工作区，也不适用于所有混合精度或状态分片实现。'],checkpoint:{question:'参数量相同的两个模型，训练峰值显存一定相同吗？',answer:'不一定。输入长度、批大小、激活保存方式、算子实现、优化器和数值精度都会改变峰值显存。'}}
    ],deep:[
      {id:'dense-count',title:'参数量与矩阵乘法计算量分开数',paragraphs:['以下表达式描述一个带偏置的线性层。计算量只估算主要乘加，按一次乘法和一次加法各算一次浮点操作，忽略偏置加法、激活和边界上的细小差异。'],formula:String.raw`P=D_{\mathrm{in}}D_{\mathrm{out}}+D_{\mathrm{out}},\qquad F\approx2BD_{\mathrm{in}}D_{\mathrm{out}}`,formulaReading:'参数量是输入维数乘输出维数，再加输出维数个偏置；主要前向计算量约为两倍批大小乘输入维数乘输出维数。',notation:[{symbol:'P',meaning:'该线性层可训练标量参数的数量'},{symbol:String.raw`D_{\mathrm{in}}`,meaning:'输入特征维数；in 下标表示输入'},{symbol:String.raw`D_{\mathrm{out}}`,meaning:'输出特征维数；out 下标表示输出'},{symbol:'B',meaning:'参与这次矩阵乘法的输入向量数量；序列数据可能已合并批次和位置'},{symbol:'F',meaning:'主要前向浮点操作次数，采用乘法与加法各计一次的约定'},{symbol:String.raw`\approx`,meaning:'近似等于；省略偏置、激活等较小项'},{symbol:String.raw`2BD_{\mathrm{in}}D_{\mathrm{out}}`,meaning:'四个因子相乘；每个权重—输入配对大致贡献一次乘法和一次加法'}]},
      {id:'activations',title:'减少激活与减少参数是不同优化',paragraphs:['降低微批大小通常减少激活，但不会按同样比例减少模型参数。激活检查点技术在前向少存一些中间结果，反向时重算，交换计算时间与显存。梯度累积可以模拟更大有效批次，但不一定完全复现含批次统计层的训练行为。','高效注意力通过分块与在线归一化避免完整存下两两位置分数；它并不因此把精确全注意力的所有成对计算都变成线性规模。实际峰值还依赖其他层。']},
      {id:'measure',title:'估算之后，测真实峰值与吞吐',paragraphs:['记录输入长度分布，而不只记录平均长度。语音批次按时长分桶可减少补齐浪费；语言模型的长上下文样本可能主导峰值显存。','FLOPs 是浮点操作次数，不是运行秒数。硬件利用率、访存、通信、内核启动和算子融合决定同样计算量实际需要多久。显存已预留与当前张量占用也不是同一个数字。']}
    ],implementation:[
      {id:'budget-code',title:'写一个明确假设的预算计算器',paragraphs:['代码使用纯 Python。它只计算线性层参数和主要前向乘加，并给出 32 位参数、梯度和两份动量状态的简化字节数。'],code:`input_width, output_width, batch_vectors = 16, 32, 8
parameter_count = input_width * output_width + output_width
forward_flops = 2 * batch_vectors * input_width * output_width
bytes_per_float = 4
parameter_bytes = parameter_count * bytes_per_float
adam_state_and_grad_bytes = parameter_count * bytes_per_float * 4
assert parameter_count == 544
assert parameter_bytes == 2176
print({"parameters": parameter_count,
       "main_forward_flops": forward_flops,
       "parameter_bytes": parameter_bytes,
       "fp32_adam_total_excluding_activations": adam_state_and_grad_bytes})`},
      {id:'budget-check',title:'遇到显存不足，先定位是哪一部分增长',paragraphs:['减小批次后峰值显著下降，通常提示激活或临时工作区占比较大；只增加生成长度就持续增长，要检查缓存；每一步都增长且不释放，则可能在列表里保存了仍连接计算图的张量。','日志可以存分离后的标量或必要的小张量，避免长期保留整张计算图。任何优化都应同时检查数值结果与速度，不能只看“能跑了”。']}
    ]},misconceptions:['参数量少，不保证峰值显存少或延迟低。','开启低精度后，训练显存通常不会严格减半，因为状态和部分运算可能仍使用高精度。'],references:[{title:'Understanding CUDA Memory Usage',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/torch_cuda_memory.html',reason:'区分真实张量内存、分配器与峰值诊断。'},{title:'Self-attention Does Not Need O(n²) Memory',author:'Markus N. Rabe & Charles Staats',url:'https://arxiv.org/abs/2112.05682',reason:'理解注意力计算量与中间分数存储量的区别。'}],
  },
  {
    id:'probing-mechanisms',title:'探测内部表示：可读出信息与因果作用',english:'Representation Probing and Mechanistic Interpretability',module:7,minutes:9,
    topicIds:['probing-activations','mechanistic-interpretability'],prerequisites:['线性分类','隐藏状态','评估流程'],summary:'先用简单探针判断信息是否容易读出，再用受控干预检查模型是否依赖它，避免把漂亮热图当作机制证明。',
    sections:{quick:[
      {id:'three-questions',title:'三个问题需要三种证据',paragraphs:['第一，两个输入的内部激活是否不同，可以用统计和可视化描述。第二，激活是否含有某类可读出的信息，可以训练探针。第三，这些信息是否对输出有因果作用，需要干预和对照。','探针是读取冻结表示的小模型，例如线性分类器。若探针能预测说话人或音位，说明这些信息在所选读取方式下可获取；不证明原模型的解码器正在使用同一种规则。'],flow:[{label:'控制输入',detail:'尽量匹配内容、时长和录音条件'},{label:'记录表示',detail:'明确层、位置、池化与预处理'},{label:'训练探针',detail:'独立划分数据并限制探针容量'},{label:'进行干预',detail:'替换、消融或修补激活并测输出变化'}]},
      {id:'speech-pairs',title:'同样转写，内部仍可能走不同计算路径',paragraphs:['两位说话人说出相同内容，即使都被正确识别，隐藏表示仍可能保留音色、口音、时长和录音环境差异。比较激活时，先把可比较的时间片段对齐；不能直接把两段长度不同录音的第十帧当成同一语音事件。','对稠密网络而言，激活幅度较大不意味着“更多参数被启动”。大多数层仍执行固定计算。只有具有显式稀疏路由的结构，才有直接的路由或专家选择概念。'],checkpoint:{question:'一个探针准确读出了口音标签，是否已经证明模型用口音信息决定转写？',answer:'没有。它只说明信息可被探针读出；还需要控制混杂并干预相关表示，观察原任务输出是否发生预期变化。'}}
    ],deep:[
      {id:'linear-probe',title:'线性探针刻意限制自己的能力',paragraphs:['下面用线性映射把冻结表示转成类别分数。限制探针容量有助于减少它重新学习复杂任务的能力，但仍需随机标签、随机表示和词型或说话人隔离等对照。'],formula:String.raw`z=Wh+b`,formulaReading:'把冻结的隐藏向量乘上探针权重，再加偏置，得到每个类别的分数。',notation:[{symbol:'h',meaning:'从原模型取出并冻结的隐藏表示',shape:'D 维列向量'},{symbol:'D',meaning:'隐藏表示的维数'},{symbol:'W',meaning:'探针自己的可训练权重，不是原模型权重',shape:'C 行 D 列'},{symbol:'b',meaning:'探针的可训练偏置',shape:'C 维向量'},{symbol:'z',meaning:'探针对每个类别输出的未归一化分数',shape:'C 维向量'},{symbol:'C',meaning:'探测任务的类别数量'},{symbol:'Wh',meaning:'矩阵 W 与列向量 h 相乘；得到 C 维输出'}]},
      {id:'interventions',title:'消融与激活修补各自回答什么',paragraphs:['消融把某个激活设零或替换为参考值，观察输出变化。激活修补则把一条输入某层、某位置的表示替换为另一条输入的对应表示，检查输出是否向预期方向恢复。二者都需要明确替换位置和参考分布。','设零可能制造训练中从未出现的状态；输出变化也可能只是普遍损伤。加入随机方向、匹配幅度、相邻层或无关位置对照，才能区分特异性作用和一般破坏。']},
      {id:'interpretation-limits',title:'从热图走向结论需要哪些约束',paragraphs:['二维降维图会改变距离与邻域关系；颜色分群可能受说话内容、说话人、时长或录音条件驱动。训练探针时按目标结论选择切分单位，例如测试未见说话人，避免记住个人声音。','机制解释通常是局部假设：某些输入、层和任务上，一组计算对行为有作用。它不自动推广到整模型，也不能把单个神经元命名后就认为功能完全唯一。保存原始任务性能，防止解释方法只是破坏了系统。']}
    ],implementation:[
      {id:'hook-code',title:'用 hook 捕获并干预一个隐藏层',paragraphs:['hook 是在模块执行时调用的回调。这个固定小网络用来展示干预的技术路径，不是语音机制研究结果。hidden 是隐藏层，saved 保存干预前表示；patch 只把第一个隐藏坐标设零。'],code:`import torch
from torch import nn
hidden = nn.Linear(2, 2, bias=False)
output = nn.Linear(2, 1, bias=False)
with torch.no_grad():
    hidden.weight.copy_(torch.eye(2))
    output.weight.copy_(torch.tensor([[1.0, 2.0]]))
model = nn.Sequential(hidden, nn.ReLU(), output).eval()
inputs = torch.tensor([[3.0, 4.0]])
saved = {}
def capture(module, args, activation):
    saved["hidden"] = activation.detach().clone()
handle = hidden.register_forward_hook(capture)
with torch.no_grad():
    baseline = model(inputs)
handle.remove()
def patch(module, args, activation):
    changed = activation.clone()
    changed[:, 0] = 0
    return changed
handle = hidden.register_forward_hook(patch)
with torch.no_grad():
    intervened = model(inputs)
handle.remove()
assert baseline.item() == 11.0 and intervened.item() == 8.0
print(saved["hidden"], baseline, intervened)`},
      {id:'probe-protocol',title:'为真实研究写一个可以证伪的小方案',paragraphs:['固定相同转写内容，匹配或显式建模说话人、时长与录音条件；选少量层提取对齐表示；在独立说话人上训练低容量探针，并保留随机标签与随机表示对照。','若发现稳定差异，再做局部修补或消融，记录正确词元概率、错误率及对无关样本的影响。先验证单个明确假设，再扩大到更多层和数据；统计相关、可读出性与因果作用分别报告。']}
    ]},misconceptions:['激活强度较高不等于稠密网络启用了更多参数。','注意力权重或降维热图本身不能证明因果机制。','探针表现可以来自探针自身的学习能力，因此必须限制容量并设置对照。'],references:[{title:'Designing and Interpreting Probes with Control Tasks',author:'John Hewitt & Percy Liang',url:'https://arxiv.org/abs/1909.03368',reason:'理解探针容量、随机控制任务与可读出性结论的边界。'},{title:'Locating and Editing Factual Associations in GPT',author:'Kevin Meng et al.',url:'https://arxiv.org/abs/2202.05262',reason:'了解通过激活干预寻找对特定行为有作用的计算。'},{title:'Module.register_forward_hook',author:'PyTorch',url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html',reason:'核对捕获输出、替换激活和移除 hook 的接口。'}],
  },
];
