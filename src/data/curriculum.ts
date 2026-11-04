export type CurriculumTopic = {
  id: string;
  title: string;
  english: string;
  status: 'ready' | 'planned';
  chapterId?: string;
};

export type CurriculumModule = {
  id: number;
  title: string;
  description: string;
  topics: CurriculumTopic[];
};

const planned = (id: string, title: string, english: string): CurriculumTopic => ({
  id, title, english, status: 'planned',
});

const ready = (
  id: string,
  title: string,
  english: string,
  chapterId: string,
): CurriculumTopic => ({ id, title, english, status: 'ready', chapterId });

/**
 * The complete editorial roadmap. `ready` means a substantial chapter exists;
 * all other topics remain explicitly planned, even when a related chapter
 * mentions the concept. Multiple entries may point to one shared chapter.
 */
export const curriculum: CurriculumModule[] = [
  {
    id: 0,
    title: '数学与机器学习基础',
    description: '从张量、概率和导数出发，建立阅读公式与计算图的共同语言。',
    topics: [
      planned('tensors', '张量、形状与广播', 'Tensor · Shape · Broadcasting'),
      planned('linear-algebra', '矩阵乘法与线性变换', 'Matrix Multiplication · Linear Transformation'),
      planned('matrix-calculus', '矩阵微分与链式法则', 'Matrix Calculus · Jacobian · Chain Rule'),
      planned('probability', '概率分布与最大似然', 'Probability Distributions · Maximum Likelihood'),
      planned('information-theory', '熵、交叉熵与 KL 散度', 'Entropy · Cross-Entropy · KL Divergence'),
      planned('learning-paradigms', '监督、自监督与无监督学习', 'Supervised · Self-supervised · Unsupervised Learning'),
      planned('bias-variance', '偏差与方差', 'Bias–Variance Tradeoff'),
      planned('computational-graph', '计算图与自动微分', 'Computational Graph · Automatic Differentiation'),
    ],
  },
  {
    id: 1,
    title: '神经网络与优化',
    description: '理解网络怎样表达函数、怎样接收梯度，以及训练为什么成功或失败。',
    topics: [
      planned('linear-models', '感知机、线性与逻辑回归', 'Perceptron · Linear Regression · Logistic Regression'),
      planned('mlp-foundations', '多层感知机与通用近似', 'MLP · Universal Approximation'),
      planned('activations', '激活函数及其导数', 'Sigmoid · Tanh · ReLU · GELU · SiLU'),
      ready('backprop', '前向传播与反向传播', 'Forward Propagation · Backpropagation', 'backprop'),
      planned('optimizers', '优化器与更新轨迹', 'SGD · Momentum · Adam · AdamW'),
      planned('learning-rate', '学习率与调度', 'Learning Rate Scheduling'),
      planned('initialization', '权重初始化', 'Weight Initialization'),
      planned('normalization', '归一化', 'BatchNorm · LayerNorm · RMSNorm'),
      planned('regularization', '过拟合、正则化与 Dropout', 'Overfitting · Regularization · Dropout'),
      planned('residual-connections', '残差连接', 'Residual Connections'),
      planned('gradient-dynamics', '损失地形与梯度消失、爆炸', 'Loss Landscape · Vanishing / Exploding Gradients'),
      planned('training-numerics', '混合精度、梯度裁剪与累积', 'Mixed Precision · Gradient Clipping · Gradient Accumulation'),
    ],
  },
  {
    id: 2,
    title: 'CNN 与视觉模型',
    description: '由滑动窗口理解局部性、权重共享、空间结构和视觉任务。',
    topics: [
      ready('convolution', '卷积、互相关与滑动窗口', 'Convolution · Cross-Correlation', 'convolution'),
      planned('convolution-geometry', '步长、填充与空洞', 'Stride · Padding · Dilation'),
      planned('pooling-receptive-field', '池化与感受野', 'Pooling · Receptive Field'),
      planned('cnn-hierarchy', '特征层级与平移等变性', 'Feature Hierarchy · Translation Equivariance'),
      planned('classic-cnn', '经典卷积网络', 'LeNet · AlexNet · VGG'),
      planned('inception-densenet', '多分支与密集连接', 'Inception / GoogLeNet · DenseNet'),
      planned('resnet-vision', '深层残差网络', 'ResNet'),
      planned('efficient-cnn', '深度可分离卷积与高效网络', 'Depthwise Separable Convolution · MobileNet · EfficientNet'),
      planned('unet-vision', 'U 形编码器与解码器', 'U-Net'),
      planned('vit-vision', '视觉 Transformer 的归纳偏置', 'Vision Transformer · ViT'),
      planned('detection-segmentation', '目标检测与分割概览', 'Object Detection · Segmentation'),
    ],
  },
  {
    id: 3,
    title: '序列模型与 Attention',
    description: '把递归状态、内容寻址与并行注意力放在同一个序列建模框架中。',
    topics: [
      planned('autoregression', '自回归建模', 'Autoregressive Modeling'),
      planned('rnn-bptt', '循环网络与时间反向传播', 'Vanilla RNN · BPTT'),
      planned('gated-rnn', '门控循环网络', 'LSTM · GRU'),
      planned('bidirectional-rnn', '双向循环网络', 'Bidirectional RNN'),
      planned('seq2seq', '编码器、解码器与序列到序列', 'Encoder–Decoder · Seq2Seq'),
      planned('attention-families', '加性与点积注意力', 'Additive Attention · Dot-product Attention'),
      ready('attention', 'Attention 与 Transformer', 'Scaled Dot-Product · Self / Cross Attention · Multi-Head', 'attention'),
      planned('causal-masking', '因果掩码与训练目标', 'Causal Masking'),
      planned('position-encoding', '位置编码与相对位置', 'Positional Encoding · RoPE · ALiBi'),
      planned('transformer-families', '三种 Transformer 组织方式', 'Encoder-only · Decoder-only · Encoder–Decoder'),
      planned('kv-cache', '键值缓存与多查询注意力', 'KV Cache · MQA · GQA'),
      planned('flashattention', '注意力的内存访问优化', 'FlashAttention'),
    ],
  },
  {
    id: 4,
    title: '主流网络架构图谱',
    description: '比较模型的输入输出、关键组件与适用问题；关联不等于历史继承或性能排名。',
    topics: [
      planned('model-mlp', '多层感知机', 'MLP'),
      ready('model-cnn', '卷积神经网络：核心运算', 'CNN', 'convolution'),
      planned('model-rnn', '循环神经网络', 'RNN'),
      planned('model-lstm', '长短期记忆网络', 'LSTM'),
      planned('model-gru', '门控循环单元', 'GRU'),
      ready('model-transformer', 'Transformer：组件探索', 'Transformer', 'attention'),
      planned('model-resnet', '残差网络', 'ResNet'),
      planned('model-unet', 'U-Net', 'U-Net'),
      planned('model-bert', '双向编码器', 'BERT'),
      planned('model-gpt', '自回归解码器', 'GPT'),
      planned('model-t5', '统一文本到文本模型', 'T5'),
      planned('model-vit', '视觉 Transformer', 'ViT'),
      planned('model-clip', '图文对比表示', 'CLIP'),
      planned('model-autoencoder', '自编码器与变分自编码器', 'Autoencoder · VAE'),
      planned('model-gan', '生成对抗网络', 'GAN'),
      planned('model-normalizing-flow', '可逆变换与归一化流', 'Normalizing Flow'),
      planned('model-diffusion', '扩散模型及潜空间扩散', 'Diffusion Models · Latent Diffusion'),
      planned('model-dit', '扩散 Transformer', 'Diffusion Transformer · DiT'),
      planned('model-flow-matching', '流匹配', 'Flow Matching'),
      planned('model-moe', '混合专家', 'Mixture of Experts · MoE'),
      planned('model-ssm', '状态空间模型', 'SSM · S4 · Mamba'),
      planned('system-rag', '检索增强生成：系统方法', 'Retrieval-Augmented Generation · RAG'),
      planned('model-multimodal', '多模态 Transformer', 'Multimodal Transformers'),
    ],
  },
  {
    id: 5,
    title: '生成式 AI 与大语言模型',
    description: '从词元和训练目标一路连接到对齐、参数高效适配与推理。',
    topics: [
      planned('tokenization', '分词与字节对编码', 'Tokenization · BPE'),
      planned('embeddings', '嵌入表示', 'Embeddings'),
      planned('pretraining', '自回归预训练与下一词元预测', 'Autoregressive Pretraining · Next-token Prediction'),
      planned('continued-pretraining', '预训练与持续预训练', 'Pretraining · Continued Pretraining'),
      planned('sft', '有监督微调', 'Supervised Fine-Tuning · SFT'),
      planned('preference-optimization', '偏好优化与强化学习对齐', 'DPO · RLHF · PPO · GRPO'),
      planned('parameter-efficient-finetuning', '参数高效微调', 'LoRA · QLoRA · PEFT'),
      planned('quantization-distillation', '量化与知识蒸馏', 'Quantization · Knowledge Distillation'),
      planned('scaling-laws', '规模定律', 'Scaling Laws'),
      planned('decoding-sampling', '解码与采样策略', 'Beam Search · Temperature · Top-k · Top-p'),
      planned('llm-evaluation', '模型评估', 'Model Evaluation'),
      planned('efficient-inference-training', '推理效率与分布式训练基础', 'Inference Efficiency · Distributed Training'),
    ],
  },
  {
    id: 6,
    title: '语音与多模态深度学习',
    description: '从声学特征到序列对齐，理解语音模型如何表示、识别与生成。',
    topics: [
      planned('acoustic-features', '波形、频谱与梅尔特征', 'Waveform · Spectrogram · Mel Spectrogram · Acoustic Features'),
      planned('speech-backbones', '语音建模骨干', 'CNN / RNN / Transformer for Speech'),
      ready('ctc', '连接时序分类与路径折叠', 'Connectionist Temporal Classification · CTC', 'ctc'),
      planned('transducer', '转导器与联合网络', 'RNN-T · Transducer'),
      planned('attention-asr', '基于注意力的语音识别', 'Attention-based ASR'),
      planned('speech-ssl', '自监督语音表示', 'wav2vec 2.0 · HuBERT · Self-supervised Speech Representation'),
      planned('whisper-conformer', '代表性语音架构', 'Whisper · Conformer'),
      planned('speaker-embeddings', '说话人嵌入', 'Speaker Embeddings'),
      planned('tts', '语音合成的典型架构', 'Text-to-Speech · TTS'),
      planned('text-audio-alignment', '文本与音频对齐', 'Text–Audio Alignment'),
      planned('speech-language-models', '语音语言模型', 'Speech Language Models'),
      planned('multimodal-representations', '多模态表示学习', 'Multimodal Representation Learning'),
    ],
  },
  {
    id: 7,
    title: '研究与工程实践',
    description: '把公式变成可检查的实验：从数据管线到复现，再到内部表示与机制探测。',
    topics: [
      planned('pytorch-autograd', 'PyTorch 自动微分', 'PyTorch Autograd'),
      planned('data-pipeline', '数据集与数据加载', 'Dataset · DataLoader'),
      planned('training-loop', '训练循环与检查点', 'Training Loop · Checkpointing'),
      planned('evaluation-metrics', '评估流程与指标', 'Evaluation · Metrics'),
      planned('experiment-tracking', '实验记录与超参数搜索', 'Experiment Tracking · Hyperparameter Search'),
      planned('debugging-training', '调试训练', 'Debugging Training'),
      planned('compute-memory', '显存、计算量与参数量', 'GPU Memory · FLOPs · Parameters'),
      planned('training-inference', '训练与推理的区别', 'Training vs Inference'),
      planned('probing-activations', '表示探测与激活可视化', 'Representation Probing · Activation Visualization'),
      planned('mechanistic-interpretability', '机制可解释性入门', 'Mechanistic Interpretability'),
      planned('reproducibility-papers', '复现与论文阅读', 'Reproducibility · Reading Papers'),
    ],
  },
];
