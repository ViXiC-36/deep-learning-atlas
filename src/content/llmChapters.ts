import type { Chapter } from './types.ts';

export const llmChapters: Chapter[] = [
  {
    "id": "tokens-embeddings",
    "title": "词元与嵌入：文字怎样变成数字",
    "english": "Tokenization & Embeddings",
    "module": 5,
    "minutes": 8,
    "topicIds": [
      "tokenization",
      "embeddings"
    ],
    "summary": "先切成可查表的编号，再变成可学习的向量；切分规则与向量含义是两件事。",
    "prerequisites": [
      "向量是一串有顺序的数",
      "矩阵的行与列"
    ],
    "sections": {
      "quick": [
        {
          "id": "why-tokens",
          "title": "模型不能直接乘“我”这个字",
          "paragraphs": [
            "词元（token）是分词器使用的离散单位，可以是整词、词的一部分、字符或字节序列。词元编号只是词表里的地址：编号 8 不表示比编号 4 的含义大两倍。",
            "人为规定的小词表可以把“我 喜欢 语音”编码成 [1, 2, 3]。这只演示编号，不声称真实分词器会这样切。中文一个字可能对应多个词元；英文一个词也可能被拆开。"
          ],
          "flow": [
            {
              "label": "原始文字",
              "detail": "保留文字、空格和换行"
            },
            {
              "label": "分词器",
              "detail": "按固定规则切分并查编号"
            },
            {
              "label": "嵌入表",
              "detail": "每个编号选出一行数"
            },
            {
              "label": "网络",
              "detail": "让向量与上下文交互"
            }
          ]
        },
        {
          "id": "bpe-example",
          "title": "字节对编码：合并经常相邻的片段",
          "paragraphs": [
            "字节对编码（Byte Pair Encoding，BPE）训练时反复统计相邻单位对，选出高频对并合并。名字里的字节不保证每个具体实现都从字节开始；自然语言的子词版本也可以从字符开始。",
            "假设语料只有两个“低低”和一个“低音”，先拆成字符。“低、低”出现两次，“低、音”出现一次；第一步可以把“低低”加入词表。实际系统还要明确词边界、空白处理和并列频次规则。",
            "训练好规则后，编码新文本是应用已有合并规则，而不是对每条输入重新训练。能否精确解码还取决于规范化和未知字符处理。"
          ]
        },
        {
          "id": "lookup",
          "title": "嵌入：按编号取出一整行",
          "paragraphs": [
            "嵌入（embedding）把离散编号映射到连续向量。先把词表大小定义为 V，向量长度为 d，词元编号为 i，嵌入表为 E，查出的一行向量为 e。",
            "例如词表有 5 项、每项 3 个数，整张表共有 15 个参数。编号 2 选出一行，结果长度仍是 3；编号大小不会改变向量长度。"
          ],
          "formula": "e=E[i,:],\\qquad E\\in\\mathbb R^{V\\times d}",
          "formulaReading": "从表 E 取编号 i 对应的整行，得到 e；表有 V 行、d 列，每个格子存一个实数。",
          "notation": [
            {
              "symbol": "E",
              "meaning": "可学习的嵌入表",
              "shape": "V 行 × d 列"
            },
            {
              "symbol": "e",
              "meaning": "查出的向量",
              "shape": "长度 d"
            },
            {
              "symbol": "i",
              "meaning": "词元编号，也就是选中行号",
              "shape": "整数",
              "example": "代码中从 0 到 V−1"
            },
            {
              "symbol": "V",
              "meaning": "词表总大小",
              "shape": "正整数",
              "example": "5"
            },
            {
              "symbol": "d",
              "meaning": "每个向量的数值个数",
              "shape": "正整数",
              "example": "3"
            },
            {
              "symbol": "[i,:]",
              "meaning": "第 i 行的所有列；冒号表示全部列"
            },
            {
              "symbol": "\\in\\mathbb R",
              "meaning": "属于实数集合"
            },
            {
              "symbol": "\\times",
              "meaning": "形状中连接行数与列数"
            }
          ],
          "checkpoint": {
            "question": "同一个词元出现在不同句子里，查表得到的向量是否相同？",
            "answer": "使用同一嵌入表时相同。经过后续网络后，上下文表示才会随句子变化。"
          }
        }
      ],
      "deep": [
        {
          "id": "context",
          "title": "静态查表与上下文表示",
          "paragraphs": [
            "“苹果手机”和“吃苹果”中的同一个词元，进入网络前可以查同一行；经过注意力等层后，它的表示会受上下文影响。不要把最初的嵌入和最后一层的表示混为一谈。",
            "向量相近可表达某种统计相似性，但任一坐标通常没有预先指定的人类含义。不能仅凭某个维度增大，就把它命名为“语义更强”。"
          ]
        },
        {
          "id": "vocabulary-cost",
          "title": "词表越大，不一定整体更省",
          "paragraphs": [
            "更大的词表可能缩短某些文本的切分长度，同时增大嵌入表和词表输出层。比较时要同时统计实际词元数和词表参数量，而不只看字符数。",
            "输入嵌入和输出分类权重可以共享，称为权重绑定，但不是所有模型都采用。角色、句尾和填充等特殊词元也属于具体模型的输入约定，必须保持训练推理一致。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "embedding-code",
          "title": "用小表验证形状",
          "paragraphs": [
            "下面不下载模型。ids 是一条句子中的三个词元编号；torch.nn.Embedding 是 PyTorch 的查表层。输出三个维度分别是句子条数、位置数、每个位置的向量长度。"
          ],
          "code": "import torch\nfrom torch import nn\n\nembedding = nn.Embedding(5, 3)\nwith torch.no_grad():\n    embedding.weight.copy_(torch.arange(15).reshape(5, 3).float())\nids = torch.tensor([[1, 2, 1]], dtype=torch.long)\nvectors = embedding(ids)\nassert vectors.shape == (1, 3, 3)\nassert torch.equal(vectors[0, 0], vectors[0, 2])\nprint(vectors)\n"
        },
        {
          "id": "token-audit",
          "title": "先做编码与解码的往返检查",
          "paragraphs": [
            "依次检查普通文本、多语言混合文本和含连续空格与换行的代码。编码后再解码，比较原文；如果分词器有意规范化文字，记录差异。",
            "保存分词器版本、词表和聊天模板。仅保存模型权重却换了模板，会让同一段提示变成不同输入。不同分词器下的每词元损失不能直接当作同一计量单位。"
          ],
          "bullets": [
            "核对填充位置不会被错误计入预测目标。",
            "检查结束词元、角色分隔符与训练约定一致。",
            "记录实际词元数，不用固定的字数比例估算。"
          ]
        }
      ]
    },
    "misconceptions": [
      "词元不等于一个汉字或一个英文单词。",
      "词元编号没有可直接参与线性计算的语义顺序。"
    ],
    "references": [
      {
        "title": "Neural Machine Translation of Rare Words with Subword Units",
        "author": "Sennrich et al. · 2016",
        "url": "https://aclanthology.org/P16-1162/",
        "reason": "BPE 子词分割的原始研究。"
      },
      {
        "title": "torch.nn.Embedding",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.Embedding.html",
        "reason": "核对查表输入、输出和填充语义。"
      }
    ]
  },
  {
    "id": "language-pretraining",
    "title": "预训练：从下一词元预测开始",
    "english": "Pretraining & Continued Pretraining",
    "module": 5,
    "minutes": 8,
    "topicIds": [
      "pretraining",
      "continued-pretraining"
    ],
    "summary": "用左边的上下文预测右边的词元；持续预训练沿用预测任务，但改变数据和训练起点。",
    "prerequisites": [
      "条件概率",
      "词元与嵌入",
      "因果注意力"
    ],
    "sections": {
      "quick": [
        {
          "id": "shift",
          "title": "训练标签藏在原文的右边",
          "paragraphs": [
            "编号序列 [2, 4, 7, 1] 可以构成输入 [2, 4, 7] 和目标 [4, 7, 1]。第一个位置利用 2 预测 4；第二个位置利用 2、4 预测 7。因果掩码防止偷看未来。",
            "自回归的意思是生成结果会成为后续输入的一部分。训练时真实前缀已知，可并行计算多个位置；生成时通常先确定新词元，再形成下一个前缀。"
          ],
          "flow": [
            {
              "label": "原文",
              "detail": "整理、去重并划分数据"
            },
            {
              "label": "右移一位",
              "detail": "形成输入与目标"
            },
            {
              "label": "因果网络",
              "detail": "每个位置只使用允许的前缀"
            },
            {
              "label": "预测误差",
              "detail": "正确目标概率决定损失"
            }
          ]
        },
        {
          "id": "nll",
          "title": "正确答案得到多少概率",
          "paragraphs": [
            "把词元记为 x，下标 t 表示预测位置，T 是参与预测的位置总数。θ 表示模型可训练参数，p 是模型给出的条件概率，L 是平均损失。",
            "正确词元概率为 0.5 时，自然对数损失约为 0.693；概率为 0.1 时约为 2.303。错误地非常自信，会付出更大代价。"
          ],
          "formula": "L=-\\frac1T\\sum_{t=1}^{T}\\log p_\\theta(x_t\\mid x_{<t})",
          "formulaReading": "逐个位置取正确词元的条件概率，求自然对数后取负，再对所有有效位置平均。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "平均负对数似然损失",
              "shape": "一个数"
            },
            {
              "symbol": "T",
              "meaning": "有效预测位置的数量",
              "shape": "正整数"
            },
            {
              "symbol": "t",
              "meaning": "当前预测位置编号",
              "shape": "1 到 T"
            },
            {
              "symbol": "x_t",
              "meaning": "第 t 个正确目标词元",
              "shape": "离散编号"
            },
            {
              "symbol": "x_{<t}",
              "meaning": "位置 t 之前的所有词元；< 指位置小于 t"
            },
            {
              "symbol": "\\theta",
              "meaning": "模型可训练参数整体"
            },
            {
              "symbol": "p_\\theta(\\,\\cdot\\mid\\cdot\\,)",
              "meaning": "模型条件概率；竖线表示给定右侧条件"
            },
            {
              "symbol": "\\log",
              "meaning": "自然对数"
            },
            {
              "symbol": "\\sum",
              "meaning": "从 t=1 到 t=T 相加"
            },
            {
              "symbol": "-1/T",
              "meaning": "取负号并除以有效位置数"
            }
          ]
        },
        {
          "id": "continued",
          "title": "持续预训练改变“阅读材料”",
          "paragraphs": [
            "持续预训练从已有模型继续做类似预测任务，例如加入专业论文或新语言。它与从零训练的区别，是起点已包含过去数据形成的能力。",
            "只用狭窄领域数据继续训练，可能让领域损失下降，同时损害通用能力。保留通用验证集，必要时混合数据；混合比例应通过实验确定。"
          ],
          "checkpoint": {
            "question": "读过很多专业论文，是否等于学会按要求回答专业问题？",
            "answer": "不等于。领域分布、指令遵循和事实可靠性需要分别检验。"
          }
        }
      ],
      "deep": [
        {
          "id": "data-boundaries",
          "title": "文档边界与数据污染",
          "paragraphs": [
            "文本打包能减少填充，但要决定跨文档位置能否互相注意。允许前一篇文章预测后一篇开头，与每篇文档重置上下文，是不同训练设定。",
            "训练测试间的近重复会夸大泛化表现。应尽量先按原始文档组划分数据，再切片生成样本，避免同一文档的相邻片段散落到不同集合。"
          ]
        },
        {
          "id": "loss-comparison",
          "title": "平均损失下降不等于所有任务都改善",
          "paragraphs": [
            "常见标点和高频词的改善可能盖过稀有事实的退化。除了总体损失，还要看领域切片、任务指标与固定提示下的输出。",
            "困惑度是平均负对数损失取指数的结果。它依赖分词器、数据和上下文长度；更低的困惑度并不保证每个问答任务都更好。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "shift-code",
          "title": "检查右移标签和交叉熵",
          "paragraphs": [
            "这里的 logits 是尚未变成概率的词表分数，形状依次为批大小、位置数、词表大小。每个位置故意把正确答案分数设为 3，以核对索引；真实分数应由网络算出。cross_entropy 接收原始分数，不需提前 softmax。"
          ],
          "code": "import torch\nimport torch.nn.functional as F\n\nsequence = torch.tensor([[2, 4, 7, 1]])\ninputs, targets = sequence[:, :-1], sequence[:, 1:]\nlogits = torch.zeros(1, 3, 8)\nlogits.scatter_(2, targets.unsqueeze(-1), 3.0)\nloss = F.cross_entropy(logits.reshape(-1, 8), targets.reshape(-1))\nexpected = torch.log(torch.exp(torch.tensor(3.0)) + 7) - 3\nassert torch.allclose(loss, expected)\nassert inputs.tolist() == [[2, 4, 7]]\nprint(float(loss))\n"
        },
        {
          "id": "experiment",
          "title": "持续预训练的最小对照",
          "paragraphs": [
            "比较原模型、只用领域数据继续训练、混入通用数据三种条件，固定训练预算和评估模板。报告实际见过的词元数，而不只报告轮数。",
            "记录数据版本、分词器、随机种子和检查点。先检查标签右移和填充屏蔽，再看训练与验证曲线；不要反复用测试集挑混合比例。"
          ]
        }
      ]
    },
    "misconceptions": [
      "预测目标能鼓励利用长程结构，但不直接保证事实正确。",
      "持续预训练与监督微调可能都用交叉熵；数据组织和受监督位置并不相同。"
    ],
    "references": [
      {
        "title": "Language Models are Few-Shot Learners",
        "author": "Brown et al. · 2020",
        "url": "https://arxiv.org/abs/2005.14165",
        "reason": "自回归预训练和上下文学习。"
      },
      {
        "title": "Don’t Stop Pretraining",
        "author": "Gururangan et al. · 2020",
        "url": "https://aclanthology.org/2020.acl-main.740/",
        "reason": "领域与任务适配预训练研究。"
      },
      {
        "title": "CrossEntropyLoss",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
        "reason": "核对原始分数与标签接口。"
      }
    ]
  },
  {
    "id": "instruction-tuning",
    "title": "监督微调：学习按要求回答",
    "english": "Supervised Fine-Tuning",
    "module": 5,
    "minutes": 6,
    "topicIds": [
      "sft"
    ],
    "summary": "把提示与示范回答组成训练序列，并明确哪些位置应该贡献损失。",
    "prerequisites": [
      "下一词元预测",
      "交叉熵"
    ],
    "sections": {
      "quick": [
        {
          "id": "demonstration",
          "title": "示范定义希望学习的行为",
          "paragraphs": [
            "有监督微调（Supervised Fine-Tuning，SFT）使用输入与示范输出训练模型。例如给出翻译要求和译文，更新参数以提高示范译文的条件概率。",
            "角色标记和回合边界也会进入序列。聊天模板必须与推理时一致；不能只保存正文而忘记格式约定。"
          ],
          "flow": [
            {
              "label": "任务提示",
              "detail": "问题与必要上下文"
            },
            {
              "label": "示范回答",
              "detail": "希望学习的输出行为"
            },
            {
              "label": "标签设置",
              "detail": "决定哪些位置计分"
            },
            {
              "label": "监督更新",
              "detail": "提高示范回答概率"
            }
          ]
        },
        {
          "id": "response-only",
          "title": "读进去，不一定都计算损失",
          "paragraphs": [
            "一种常见设置是只计算助手回答的损失。提示仍然进入网络，影响回答；屏蔽提示标签不等于把提示从上下文删掉。",
            "这里用 m 表示位置开关，t 表示位置。开关为 1 就计分，为 0 就跳过；p 是该位置正确目标的条件概率。"
          ],
          "formula": "L=-\\frac{\\sum_{t=1}^{T}m_t\\log p_t}{\\sum_{t=1}^{T}m_t}",
          "formulaReading": "把有效位置的负对数概率加起来，除以有效位置数；有效位置数必须大于零。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "有效目标的平均损失",
              "shape": "标量"
            },
            {
              "symbol": "T",
              "meaning": "序列位置总数",
              "shape": "正整数"
            },
            {
              "symbol": "t",
              "meaning": "位置编号",
              "shape": "1 到 T"
            },
            {
              "symbol": "m_t",
              "meaning": "位置 t 的监督开关",
              "shape": "0 或 1"
            },
            {
              "symbol": "p_t",
              "meaning": "位置 t 正确词元的条件概率",
              "shape": "0 到 1"
            },
            {
              "symbol": "\\log",
              "meaning": "自然对数"
            },
            {
              "symbol": "\\sum",
              "meaning": "对位置求和；分母为开关值的总和"
            },
            {
              "symbol": "-",
              "meaning": "取负号形成要最小化的损失"
            }
          ]
        },
        {
          "id": "quality",
          "title": "示范质量比模板数量更值得先查",
          "paragraphs": [
            "错误答案、互相矛盾的要求、缺上下文的样本都会成为训练信号。多轮对话需要明确：历史助手回合只作上下文，还是也计算损失。",
            "例如研究助手可分别学习解释实验设置、根据表格比较结果、指出论证局限；这些行为要分别评估，不能只看文风更像示范。"
          ],
          "checkpoint": {
            "question": "提示标签被忽略，提示相关参数就一定没有梯度吗？",
            "answer": "不一定。提示通过影响回答的计算路径，仍可能收到由回答损失传回的梯度。"
          }
        }
      ],
      "deep": [
        {
          "id": "token-weights",
          "title": "长回答可能占更大权重",
          "paragraphs": [
            "把整批有效词元放一起平均，长回答贡献更多位置。先对每条回答平均再对样本平均，则样本的总权重更接近相同。这是不同的优化目标，必须记录。",
            "填充位置不应冒充真实回答；需要学习的结束词元通常应保留在目标中。否则模型可能没有得到合适的结束监督。"
          ]
        },
        {
          "id": "overfit",
          "title": "拟合示范与独立完成任务",
          "paragraphs": [
            "微调可能改善格式遵循，也可能过拟合常见模板或损害原有能力。来自同一问题的改写不能同时散落到训练与测试两边。",
            "用未见主题、长度变化、提示格式扰动和可核对正确性的任务检验泛化。答案更长或更礼貌不等于更正确。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "mask-code",
          "title": "用四个位置核对掩码",
          "paragraphs": [
            "target_probability 保存各位置正确目标的概率，supervise 保存是否计分的开关。短代码只检查平均的分母；真实训练应使用数值稳定的交叉熵。"
          ],
          "code": "import math\n\ntarget_probability = [0.01, 0.02, 0.8, 0.5]\nsupervise = [0, 0, 1, 1]\ncount = sum(supervise)\nassert count > 0\nloss = -sum(flag * math.log(prob)\n            for flag, prob in zip(supervise, target_probability)) / count\nexpected = -(math.log(0.8) + math.log(0.5)) / 2\nassert abs(loss - expected) < 1e-12\nprint(round(loss, 6))\n"
        },
        {
          "id": "labels-check",
          "title": "先打印一次有效标签",
          "paragraphs": [
            "把词元解码成片段，标出受监督与被屏蔽的位置。确认回答开头、结束标记、多轮分隔符都符合约定，并检查框架是否已经自动右移标签。",
            "PyTorch 常用 ignore_index=-100 表示忽略位置；-100 是接口约定，不是词表编号。样本截断后若答案全丢失，要过滤或重新构造，避免空监督。"
          ]
        }
      ]
    },
    "misconceptions": [
      "监督微调通常直接学习示范，不等于训练奖励模型。",
      "格式更整齐与事实更可靠是两个需要分别测量的目标。"
    ],
    "references": [
      {
        "title": "Training language models to follow instructions with human feedback",
        "author": "Ouyang et al. · 2022",
        "url": "https://arxiv.org/abs/2203.02155",
        "reason": "区分示范微调、奖励建模和强化学习。"
      },
      {
        "title": "CrossEntropyLoss",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
        "reason": "核对忽略标签和平均约定。"
      }
    ]
  },
  {
    "id": "preference-learning",
    "title": "偏好优化：比较答案与奖励",
    "english": "DPO · RLHF · PPO · GRPO",
    "module": 5,
    "minutes": 10,
    "topicIds": [
      "preference-optimization"
    ],
    "summary": "分清示范、偏好与采样奖励，再理解四个常见缩写分别负责什么。",
    "prerequisites": [
      "条件概率",
      "监督微调",
      "梯度更新"
    ],
    "sections": {
      "quick": [
        {
          "id": "routes",
          "title": "先问训练信号从哪里来",
          "paragraphs": [
            "来自人类反馈的强化学习（Reinforcement Learning from Human Feedback，RLHF）是一类流程：收集人类偏好，训练奖励模型，再让语言模型生成回答、获得奖励并更新。奖励分数不是事实正确性的保证。",
            "直接偏好优化（Direct Preference Optimization，DPO）直接用同一提示下的好坏回答对更新语言模型，通常不需另训奖励模型，也不需在每次更新时在线生成新回答。",
            "近端策略优化（Proximal Policy Optimization，PPO）与组相对策略优化（Group Relative Policy Optimization，GRPO）是策略更新方法。策略就是分配输出词元概率的规则；GRPO 使用同一问题多个回答的相对奖励，省去常见 PPO 流程中的价值网络。"
          ],
          "flow": [
            {
              "label": "明确评价",
              "detail": "人类比较或可验证奖励"
            },
            {
              "label": "收集信号",
              "detail": "离线回答对或在线采样"
            },
            {
              "label": "控制更新",
              "detail": "参考约束与适合的目标"
            },
            {
              "label": "独立检验",
              "detail": "检查真实任务表现"
            }
          ]
        },
        {
          "id": "dpo",
          "title": "DPO 比较相对参考模型的变化",
          "paragraphs": [
            "同一提示记为 x，好回答记为 y⁺，差回答记为 y⁻。当前策略 πθ 与固定参考策略 πref 都给出整条回答的条件概率。先求每条回答“当前概率与参考概率之比”的对数，再比较好坏两条的结果。",
            "整条回答的对数概率来自词元对数概率相加。不要在没有改变目标定义的说明下，随意换成对词元平均。"
          ],
          "formula": "\\Delta=\\log\\frac{\\pi_\\theta(y^+\\mid x)}{\\pi_{\\rm ref}(y^+\\mid x)}-\\log\\frac{\\pi_\\theta(y^-\\mid x)}{\\pi_{\\rm ref}(y^-\\mid x)},\\qquad L=-\\log\\sigma(\\beta\\Delta)",
          "formulaReading": "先计算好坏回答各自相对参考模型的对数变化，再用好减坏；乘 β、经 sigmoid 压到 0 与 1 之间，最后取负对数。",
          "notation": [
            {
              "symbol": "x",
              "meaning": "输入提示"
            },
            {
              "symbol": "y^+,\\ y^-",
              "meaning": "较好与较差回答；上标正负只是偏好标签"
            },
            {
              "symbol": "\\pi_\\theta",
              "meaning": "当前策略，θ 是正在更新的参数"
            },
            {
              "symbol": "\\pi_{\\mathrm{ref}}",
              "meaning": "冻结参考策略；ref 是 reference 的缩写"
            },
            {
              "symbol": "\\pi(y\\mid x)",
              "meaning": "给定提示 x 后整条回答 y 的概率；竖线表示给定"
            },
            {
              "symbol": "\\log",
              "meaning": "自然对数"
            },
            {
              "symbol": "\\Delta",
              "meaning": "好坏回答相对参考模型的对数变化之差",
              "shape": "标量"
            },
            {
              "symbol": "\\beta",
              "meaning": "正缩放系数，关联原推导的参考策略约束强度"
            },
            {
              "symbol": "\\sigma(u)",
              "meaning": "sigmoid 函数，值为 1/(1+exp(−u))；u 是输入，exp 是指数函数"
            },
            {
              "symbol": "L",
              "meaning": "这一对回答的 DPO 损失",
              "shape": "标量"
            }
          ]
        },
        {
          "id": "numbers",
          "title": "用一组数字检查偏好方向",
          "paragraphs": [
            "假设参考模型对好坏回答都给 0.2，当前模型给好回答 0.4、差回答 0.1。前者提高两倍，后者降为一半，两项对数变化之差是自然对数 4。",
            "β 暂取 1，sigmoid 得到 0.8，损失约 0.223。当前和参考完全相同时，差值是 0，损失约 0.693。这是手算例子，不代表长回答概率的常见大小。"
          ],
          "checkpoint": {
            "question": "训练奖励持续提高，能否直接宣布模型更可靠？",
            "answer": "不能。模型可能利用评分漏洞，需要独立任务和人工核验检查真正的目标。"
          }
        }
      ],
      "deep": [
        {
          "id": "ppo",
          "title": "PPO：控制一次更新的幅度",
          "paragraphs": [
            "PPO 用旧策略采样，比较当前策略与旧策略给同一动作的概率比。语言模型中的动作通常是一个词元；优势值衡量这次选择比预期好多少，正值鼓励提高其概率。",
            "裁剪目标使某些过大的改进不再继续获得奖励，但不是硬性保证所有概率比都留在区间内。实际训练仍需监控偏离程度。",
            "常见 RLHF 流程使用价值网络估计回报，还加入相对固定参考模型的 KL 惩罚。旧策略比较本轮前后，参考模型限制整体漂移；二者不能混淆。"
          ]
        },
        {
          "id": "grpo",
          "title": "GRPO：同一道题的一组回答互相比较",
          "paragraphs": [
            "GRPO 对同一提示采样多条回答，用组内平均奖励作基线，常用组内标准差缩放，得到相对优势。奖励 1、0、0 表示第一条优于同组其他回答，不代表它相对其他题有多难。",
            "省去价值网络并不省去采样、奖励计算和稳定性控制。若同组奖励相同，就缺少相对优劣信号；实现必须处理零标准差，不能直接除以零。",
            "原始 GRPO 与后续实现会在长度归一化、KL、裁剪和标准差处理上有所不同。研究报告应写出实际版本，而不只写算法缩写。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "dpo-code",
          "title": "核对单个偏好对的损失",
          "paragraphs": [
            "current_logp 与 reference_logp 保存当前和参考模型对完整好、坏回答的对数概率。代码用稳定的 softplus 等价式计算负对数 sigmoid，避免极端分数指数溢出。"
          ],
          "code": "import math\n\ndef dpo_loss(current_logp, reference_logp, beta=1.0):\n    good = current_logp[0] - reference_logp[0]\n    bad = current_logp[1] - reference_logp[1]\n    score = beta * (good - bad)\n    return max(-score, 0.0) + math.log1p(math.exp(-abs(score)))\n\ncurrent = [math.log(0.4), math.log(0.1)]\nreference = [math.log(0.2), math.log(0.2)]\nassert abs(dpo_loss(current, reference) + math.log(0.8)) < 1e-12\nassert dpo_loss(reference, reference) > dpo_loss(current, reference)\nprint(dpo_loss(current, reference))\n"
        },
        {
          "id": "audit",
          "title": "实现时检查三个“相同”",
          "paragraphs": [
            "好坏回答对应同一个提示；当前和参考模型使用相同分词与模板；概率累计遵循相同回答掩码。否则差值可能反映格式和长度处理错误，而非偏好。",
            "例子只实现 DPO 标量目标，不是完整 PPO 或 GRPO 训练。真实实验还要记录奖励来源、参考模型、采样设置、生成长度与独立评估，检查是否靠冗长、套话或格式漏洞提高奖励。"
          ]
        }
      ]
    },
    "misconceptions": [
      "DPO 使用偏好数据，但通常不是在线策略梯度训练循环。",
      "GRPO 不需要价值网络，不等于无需奖励或参考约束。"
    ],
    "references": [
      {
        "title": "Direct Preference Optimization",
        "author": "Rafailov et al. · 2023",
        "url": "https://arxiv.org/abs/2305.18290",
        "reason": "参考概率比与成对损失。"
      },
      {
        "title": "Proximal Policy Optimization Algorithms",
        "author": "Schulman et al. · 2017",
        "url": "https://arxiv.org/abs/1707.06347",
        "reason": "裁剪目标与优势估计。"
      },
      {
        "title": "DeepSeekMath",
        "author": "Shao et al. · 2024",
        "url": "https://arxiv.org/abs/2402.03300",
        "reason": "GRPO 的组相对优势和原始设定。"
      }
    ]
  },
  {
    "id": "efficient-adaptation",
    "title": "LoRA 与 QLoRA：训练一条小支路",
    "english": "Parameter-Efficient Fine-Tuning",
    "module": 5,
    "minutes": 8,
    "topicIds": [
      "parameter-efficient-finetuning"
    ],
    "summary": "冻结主干，用两个小矩阵表达更新；分清低秩训练和低比特存储各省了什么。",
    "prerequisites": [
      "矩阵乘法",
      "梯度",
      "监督微调"
    ],
    "sections": {
      "quick": [
        {
          "id": "branch",
          "title": "保留原变换，再加可训练修正",
          "paragraphs": [
            "参数高效微调（Parameter-Efficient Fine-Tuning，PEFT）只更新部分选定或新增参数。低秩适配（Low-Rank Adaptation，LoRA）在线性层旁加入低秩支路，冻结原权重。",
            "低秩限制的是本次权重修正的空间，不是宣称原始大权重本身低秩。"
          ],
          "flow": [
            {
              "label": "同一输入",
              "detail": "送入两条支路"
            },
            {
              "label": "冻结主干",
              "detail": "保留原来的大矩阵变换"
            },
            {
              "label": "低秩支路",
              "detail": "先降维再升维"
            },
            {
              "label": "相加",
              "detail": "得到修正后的输出"
            }
          ]
        },
        {
          "id": "formula",
          "title": "把形状放在公式旁边",
          "paragraphs": [
            "输入列向量为 x，输出为 y。原权重 W 有 d_out 行、d_in 列；A 先把输入压到 r 维，B 再升到输出维度。s 是支路缩放值。",
            "输入输出均为 4 维、r 为 1 时，原矩阵有 16 个参数，两张小矩阵合计 8 个。较宽的层能达到更小的参数占比。"
          ],
          "formula": "y=Wx+sBAx,\\qquad s=\\alpha/r",
          "formulaReading": "先算原始输出 W 乘 x；支路依次算 A 乘 x、B 乘结果，再乘 s。相加得到 y。这里使用常见的 α 除以 r 缩放。",
          "notation": [
            {
              "symbol": "x",
              "meaning": "输入列向量",
              "shape": "长度 d_in"
            },
            {
              "symbol": "y",
              "meaning": "输出列向量",
              "shape": "长度 d_out"
            },
            {
              "symbol": "W",
              "meaning": "冻结的原始矩阵",
              "shape": "d_out × d_in"
            },
            {
              "symbol": "A",
              "meaning": "可训练降维矩阵",
              "shape": "r × d_in"
            },
            {
              "symbol": "B",
              "meaning": "可训练升维矩阵",
              "shape": "d_out × r"
            },
            {
              "symbol": "d_{\\mathrm{in}},\\ d_{\\mathrm{out}}",
              "meaning": "输入与输出的特征数；文字下标 in/out 指输入/输出"
            },
            {
              "symbol": "r",
              "meaning": "低秩支路中间宽度",
              "shape": "正整数"
            },
            {
              "symbol": "\\alpha",
              "meaning": "缩放超参数",
              "shape": "实数"
            },
            {
              "symbol": "s",
              "meaning": "实际使用的支路缩放值",
              "shape": "实数"
            },
            {
              "symbol": "BAx",
              "meaning": "矩阵乘法，先算 Ax，再算 B(Ax)"
            }
          ]
        },
        {
          "id": "qlora",
          "title": "QLoRA 额外压缩冻结权重的存储",
          "paragraphs": [
            "量化低秩适配（QLoRA）以低比特格式保存冻结主干，训练 LoRA 参数。计算时通常反量化到计算类型，不是所有运算都用 4 位整数，更不是直接更新低比特主干权重。",
            "原论文使用适合近似正态权重的 NF4 表示、量化常数的再量化和分页优化器。实际显存还包含激活、梯度、优化器状态及临时缓冲，不能仅用参数数乘半字节估计训练峰值。"
          ],
          "checkpoint": {
            "question": "冻结 W 会切断通过 W 传向输入的梯度吗？",
            "answer": "不会自动切断。冻结参数更新和停止对输入传播梯度，是两种不同操作。"
          }
        }
      ],
      "deep": [
        {
          "id": "initialization",
          "title": "为什么常把一张矩阵初始化为零",
          "paragraphs": [
            "常见初始化是 A 随机、B 为零，使初始修正为零，模型最初与主干一致。第一步 B 可以得到梯度，A 此时可能为零；随着 B 更新，A 再开始学习。",
            "若两张矩阵都为零，乘法结构可能让双方都收不到有效梯度。判断是否训练要实际检查梯度和参数变化。"
          ]
        },
        {
          "id": "scope",
          "title": "秩、目标层与合并是独立选择",
          "paragraphs": [
            "增大秩扩大更新空间，也增大可训练参数，未必单调提高验证性能。只改部分注意力投影与同时修改前馈层是不同实验，需要报告。",
            "浮点 LoRA 可把修正加回原矩阵；这时应关闭训练时 dropout。量化主干的合并还涉及反量化与重新量化误差，不要假定和纯浮点完全相同。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "lora-code",
          "title": "验证支路与合并矩阵等价",
          "paragraphs": [
            "low_rank_down 与 low_rank_up 对应 A、B。例子用列向量约定，检查前向等价性和第一步梯度；不下载预训练模型。"
          ],
          "code": "import torch\n\ntorch.manual_seed(7)\nbase_weight = torch.randn(4, 4)\nlow_rank_down = torch.randn(1, 4, requires_grad=True)\nlow_rank_up = torch.zeros(4, 1, requires_grad=True)\ninput_vector = torch.randn(4)\nscale = 2.0\noutput = base_weight @ input_vector + scale * low_rank_up @ low_rank_down @ input_vector\nmerged = base_weight + scale * low_rank_up @ low_rank_down\nassert torch.allclose(output, merged @ input_vector)\noutput.square().sum().backward()\nassert base_weight.grad is None\nassert torch.all(low_rank_down.grad == 0)\nassert low_rank_up.grad is not None\nprint(low_rank_down.numel() + low_rank_up.numel())\n"
        },
        {
          "id": "measure",
          "title": "用实际峰值判断是否适合设备",
          "paragraphs": [
            "固定序列长度、批大小和目标层，测一个训练步的显存峰值，再调整秩与量化设置。长序列可能主要被激活占用限制，减少可训练参数未必解决问题。",
            "保存适配器时还要记录主干版本、分词器和目标层配置。统计真正可训练的参数，确认优化器只持有它们，并在固定验证集比较适配前后。"
          ]
        }
      ]
    },
    "misconceptions": [
      "低秩约束针对更新，不说明主干可无损压到同样低的秩。",
      "QLoRA 是适配训练方案，低比特推理本身不等于 QLoRA。"
    ],
    "references": [
      {
        "title": "LoRA: Low-Rank Adaptation of Large Language Models",
        "author": "Hu et al. · 2021",
        "url": "https://arxiv.org/abs/2106.09685",
        "reason": "低秩参数化、初始化与合并。"
      },
      {
        "title": "QLoRA: Efficient Finetuning of Quantized LLMs",
        "author": "Dettmers et al. · 2023",
        "url": "https://arxiv.org/abs/2305.14314",
        "reason": "冻结量化主干与计算精度的区别。"
      }
    ]
  },
  {
    "id": "compression-distillation",
    "title": "量化与蒸馏：两种不同的压缩",
    "english": "Quantization & Knowledge Distillation",
    "module": 5,
    "minutes": 8,
    "topicIds": [
      "quantization-distillation"
    ],
    "summary": "量化改变数值的表示精度；蒸馏训练一个模型模仿另一个模型的输出或中间表示。",
    "prerequisites": [
      "概率分布",
      "线性层",
      "交叉熵"
    ],
    "sections": {
      "quick": [
        {
          "id": "two-tools",
          "title": "先区分“存得省”和“学一个小模型”",
          "paragraphs": [
            "量化把大量浮点数映射到较少的可表示值，例如用 8 位或 4 位编码保存权重。网络的层数与结构可以不变，但引入了数值近似误差。",
            "知识蒸馏让学生模型学习教师模型的预测或表示。学生可以更小，也可以结构不同；它不是直接把教师权重四舍五入。两种方法可以一起使用。"
          ],
          "flow": [
            {
              "label": "选择目标",
              "detail": "减少存储、延迟或服务成本"
            },
            {
              "label": "量化路径",
              "detail": "校准数值范围并编码权重"
            },
            {
              "label": "蒸馏路径",
              "detail": "用教师输出训练学生"
            },
            {
              "label": "部署核验",
              "detail": "测准确率、实际内存和延迟"
            }
          ]
        },
        {
          "id": "quantizer",
          "title": "一个数怎样量化再还原",
          "paragraphs": [
            "用 w 表示一个浮点权重，s 表示正的量化步长，q 表示量化整数。这里采用零点为零的对称量化：先除以步长、取最近整数，再裁到可用整数范围。",
            "若 w=0.31、s=0.1，则 q=3，还原后是 0.3；误差为 0.01。若数值超出可表示范围，裁剪误差可能比普通舍入大得多。"
          ],
          "formula": "q=\\operatorname{clip}(\\operatorname{round}(w/s),q_{\\min},q_{\\max}),\\qquad \\hat w=sq",
          "formulaReading": "权重除以步长，舍入到最近整数并限制在整数上下界内，得到 q；再乘步长得到近似权重。",
          "notation": [
            {
              "symbol": "w",
              "meaning": "原始浮点权重",
              "shape": "标量"
            },
            {
              "symbol": "s",
              "meaning": "量化步长，必须大于零",
              "shape": "标量",
              "example": "0.1"
            },
            {
              "symbol": "q",
              "meaning": "保存的量化整数",
              "shape": "整数"
            },
            {
              "symbol": "q_{\\min},\\ q_{\\max}",
              "meaning": "允许的最小与最大整数，文字下标表示下界与上界"
            },
            {
              "symbol": "\\operatorname{round}",
              "meaning": "舍入到最近整数；并列规则由实现定义"
            },
            {
              "symbol": "\\operatorname{clip}",
              "meaning": "超出范围时截到最近边界"
            },
            {
              "symbol": "\\hat w",
              "meaning": "反量化后的近似权重；帽号表示近似"
            },
            {
              "symbol": "sq",
              "meaning": "步长乘以量化整数"
            }
          ]
        },
        {
          "id": "soft-labels",
          "title": "教师的犹豫也能提供信息",
          "paragraphs": [
            "硬标签只告诉学生哪个类别正确。教师的软分布还能表示其他类别之间的相似性：例如给猫 0.7、狗 0.25、汽车 0.05，比只给“猫”包含更多比较信息。",
            "温度是把模型原始分数除以一个正数后再转概率的操作。较高温度通常让分布更平滑，便于看见非最高分候选；教师与学生应按同样约定处理。"
          ],
          "checkpoint": {
            "question": "模型文件小了一半，推理时间也一定减半吗？",
            "answer": "不一定。实际速度还取决于硬件内核、反量化成本、内存读写、序列长度和批大小。"
          }
        }
      ],
      "deep": [
        {
          "id": "granularity",
          "title": "校准范围和粒度决定误差",
          "paragraphs": [
            "逐张量量化用整张矩阵共用尺度；逐通道或分组量化为不同部分使用不同尺度，能适应不同数值范围，但增加尺度存储与计算复杂度。",
            "极少数异常大数会拉大量化步长，使大多数普通数失去分辨率。校准数据要覆盖实际输入分布。训练后量化与量化感知训练的区别，是是否在训练期间模拟量化误差。"
          ]
        },
        {
          "id": "distill-objective",
          "title": "蒸馏损失：让学生接近教师分布",
          "paragraphs": [
            "记教师第 i 类概率为 p_i，学生概率为 q_i，类别数为 C。下面用教师到学生的 KL 散度，它只比较同一输出空间；教师固定时，最小化该值等价于最小化以教师为目标的交叉熵。",
            "有温度的经典蒸馏常乘温度的平方以补偿梯度尺度，再与真实标签损失混合。温度、混合权重、教师错误和数据覆盖都需要验证；学生不会必然继承所有教师能力。"
          ],
          "formula": "L_{\\rm KD}=\\sum_{i=1}^{C}p_i\\log\\frac{p_i}{q_i}",
          "formulaReading": "每类计算教师概率与学生概率比值的自然对数，再按教师概率加权求和。两种分布相同就得到零。",
          "notation": [
            {
              "symbol": "L_{\\mathrm{KD}}",
              "meaning": "知识蒸馏的分布匹配损失；KD 表示 knowledge distillation"
            },
            {
              "symbol": "C",
              "meaning": "类别数量",
              "shape": "正整数"
            },
            {
              "symbol": "i",
              "meaning": "类别索引",
              "shape": "1 到 C"
            },
            {
              "symbol": "p_i",
              "meaning": "教师对第 i 类的概率"
            },
            {
              "symbol": "q_i",
              "meaning": "学生对第 i 类的概率"
            },
            {
              "symbol": "\\log",
              "meaning": "自然对数"
            },
            {
              "symbol": "\\sum",
              "meaning": "遍历类别求和"
            },
            {
              "symbol": "p_i/q_i",
              "meaning": "同一类别的教师概率与学生概率之比"
            }
          ]
        }
      ],
      "implementation": [
        {
          "id": "quantization-code",
          "title": "用标准库观察舍入与裁剪",
          "paragraphs": [
            "下面选择整数范围 −7 到 7，便于手算对称量化。weights 是原始权重列表，scale 为步长，reconstructed 为还原数值。",
            "Python 的 round 使用“中点取偶数”（ties-to-even）：恰好处在两个整数中间时，选择其中的偶数。此例 0.05 / 0.1 = 0.5 恰在 0 与 1 的中间，因此取整数 0，反量化结果也是 0；这与通常所说的逢五进一不同。"
          ],
          "code": "weights = [-0.82, -0.31, 0.05, 0.31, 0.94]\nscale = 0.1\nquantized = [max(-7, min(7, round(value / scale))) for value in weights]\nreconstructed = [scale * value for value in quantized]\nerrors = [abs(a - b) for a, b in zip(weights, reconstructed)]\nassert quantized == [-7, -3, 0, 3, 7]\nassert abs(errors[-1] - 0.24) < 1e-12\nprint(list(zip(weights, quantized, reconstructed, errors)))\n"
        },
        {
          "id": "deployment-check",
          "title": "压缩后检查任务，也检查系统",
          "paragraphs": [
            "在同一设备、序列长度、批大小和预热设置下比较未压缩与压缩模型。记录首词元延迟、后续词元速度和实际峰值内存，不能只比较文件大小。",
            "蒸馏时检查教师与学生词表是否一致。若词表不同，逐词元概率不能直接逐项对齐；可以考虑让教师生成示范序列，再用学生自己的分词器训练，但这属于另一种蒸馏约定。"
          ]
        }
      ]
    },
    "misconceptions": [
      "量化并非总是均匀整数舍入；NF4 等格式使用不同可表示值。",
      "蒸馏需要学习过程，教师错误也可能被传给学生。"
    ],
    "references": [
      {
        "title": "Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference",
        "author": "Jacob et al. · 2018",
        "url": "https://arxiv.org/abs/1712.05877",
        "reason": "理解量化尺度、零点和整数推理。"
      },
      {
        "title": "Distilling the Knowledge in a Neural Network",
        "author": "Hinton, Vinyals & Dean · 2015",
        "url": "https://arxiv.org/abs/1503.02531",
        "reason": "软目标、温度与学生训练。"
      }
    ]
  },
  {
    "id": "scaling-laws",
    "title": "规模定律：预算应该花在哪",
    "english": "Scaling Laws",
    "module": 5,
    "minutes": 7,
    "topicIds": [
      "scaling-laws"
    ],
    "summary": "把参数量、数据量与计算预算一起考虑；经验拟合能帮助规划，却不是保证能力的物理定律。",
    "prerequisites": [
      "幂函数",
      "训练与验证损失"
    ],
    "sections": {
      "quick": [
        {
          "id": "budget",
          "title": "大模型也可能因为数据不够而浪费",
          "paragraphs": [
            "参数更多通常能表达更复杂的函数，但也要有足够数据和计算让参数学到东西。给定预算时，可以训练更大的模型更短时间，也可以训练较小模型更久，这两条路线不一定等价。",
            "规模定律是在一定模型家族、数据分布和训练设置下观察到的经验规律。它帮助预测损失随规模的变化，不直接回答某个新任务是否会突然学会。"
          ],
          "flow": [
            {
              "label": "固定预算",
              "detail": "明确允许的训练计算或成本"
            },
            {
              "label": "小规模试验",
              "detail": "改变参数量与数据量"
            },
            {
              "label": "拟合趋势",
              "detail": "估计边际收益和误差"
            },
            {
              "label": "选择配置",
              "detail": "用未参与拟合的配置复核"
            }
          ]
        },
        {
          "id": "fit",
          "title": "一个常见拟合形式",
          "paragraphs": [
            "把模型参数量记为 N，训练数据词元数记为 D，验证损失记为 L。E 表示拟合中的不可约项；A、B、α、β 都是根据实验估计的正系数，而不是通用常量。",
            "下面的式子表达两种不足：模型太小与数据太少分别增加损失。它只是经验模型；重复、噪声、分布变化会改变规律。"
          ],
          "formula": "L(N,D)\\approx E+\\frac{A}{N^\\alpha}+\\frac{B}{D^\\beta}",
          "formulaReading": "预测损失约等于一个基底，再加模型规模不足项与数据不足项；在其他条件相同的拟合范围内，增大参数或数据会减小对应项。",
          "notation": [
            {
              "symbol": "L(N,D)",
              "meaning": "给定参数量和数据量下的预测验证损失",
              "shape": "标量"
            },
            {
              "symbol": "N",
              "meaning": "模型参数数量",
              "shape": "正数"
            },
            {
              "symbol": "D",
              "meaning": "训练词元数量",
              "shape": "正数"
            },
            {
              "symbol": "E",
              "meaning": "拟合中的不可约损失项"
            },
            {
              "symbol": "A,\\ B",
              "meaning": "分别控制参数不足项与数据不足项大小的拟合系数"
            },
            {
              "symbol": "\\alpha,\\ \\beta",
              "meaning": "两项幂律下降速度的拟合指数"
            },
            {
              "symbol": "N^\\alpha,\\ D^\\beta",
              "meaning": "参数量或数据量取对应幂"
            },
            {
              "symbol": "\\approx",
              "meaning": "经验近似，不是数学恒等式"
            }
          ]
        },
        {
          "id": "numbers",
          "title": "用假设系数看边际收益",
          "paragraphs": [
            "假设仅为教学使用的基底是 1，两个系数都是 4，指数都为 0.5；参数量和数据量用任意归一化单位表示。两者都取 16 时，损失是 3；只把参数量增到 64 时，损失是 2.5。",
            "继续加参数无法消除数据不足项。这里的数字是自设例子，不是某个真实模型的预测；它帮助你看出为什么两笔预算需要一起讨论。"
          ],
          "checkpoint": {
            "question": "拟合在小模型上很准，能否直接保证百倍规模后的表现？",
            "answer": "不能。外推可能跨越数据、架构、优化和硬件条件变化，需要新规模的验证点。"
          }
        }
      ],
      "deep": [
        {
          "id": "compute-optimal",
          "title": "计算最优取决于你优化哪种成本",
          "paragraphs": [
            "Chinchilla 研究强调固定预训练计算预算下，模型规模和训练数据量需要共同增长。结论来自特定实验和拟合，不是要求所有模型永远使用固定词元与参数比例。",
            "如果模型将服务大量请求，训练较小模型更久可能增加训练成本，却降低后续推理成本。只优化一次预训练计算，与优化整个服务生命周期成本，是不同问题。"
          ]
        },
        {
          "id": "data-quality",
          "title": "数据量不是质量的替代物",
          "paragraphs": [
            "同一段文字重复很多次不一定等于同样数量的新信息。数据去重、质量筛选、领域混合和测试污染会改变损失曲线。应记录总词元数及唯一数据量等不同统计。",
            "损失曲线较平滑，不代表每项离散任务准确率也平滑。任务阈值、评分方式和样本量可能放大表面上的突变；描述结论时区分观测指标与理论解释。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "grid-code",
          "title": "在假设模型里枚举预算分配",
          "paragraphs": [
            "这里把预算定义为参数量乘数据量的简化指标，固定为 4096。它不是完整浮点操作统计，只用于观察同一预算下不同分配的结果。"
          ],
          "code": "def predicted_loss(parameters, tokens):\n    return 1.0 + 4.0 / parameters**0.5 + 4.0 / tokens**0.5\n\nbudget = 4096\ncandidates = [16, 32, 64, 128, 256]\nresults = [(size, budget / size, predicted_loss(size, budget / size))\n           for size in candidates]\nbest = min(results, key=lambda row: row[2])\nassert best[0] == 64\nfor row in results:\n    print(row)\n"
        },
        {
          "id": "fit-design",
          "title": "真实实验先固定可比较的条件",
          "paragraphs": [
            "先固定分词器、数据分布、验证集与训练配方，再系统改变参数量、数据量和训练预算。保留若干配置不用来拟合，检查预测是否真的能解释未见配置。",
            "报告拟合误差和外推区间，并说明是否计入嵌入、注意力、重计算和通信开销。理论计算量相同，不代表墙钟时间相同。"
          ]
        }
      ]
    },
    "misconceptions": [
      "规模定律是经验规律，不是扩大任意模型必然获得指定能力的保证。",
      "计算最优的训练配置不一定是总服务成本最优配置。"
    ],
    "references": [
      {
        "title": "Scaling Laws for Neural Language Models",
        "author": "Kaplan et al. · 2020",
        "url": "https://arxiv.org/abs/2001.08361",
        "reason": "理解参数、数据与计算的经验关系。"
      },
      {
        "title": "Training Compute-Optimal Large Language Models",
        "author": "Hoffmann et al. · 2022",
        "url": "https://arxiv.org/abs/2203.15556",
        "reason": "固定训练计算预算下的联合分配。"
      }
    ]
  },
  {
    "id": "decoding-sampling",
    "title": "解码与采样：从概率里选一个词元",
    "english": "Beam Search · Temperature · Top-k · Top-p",
    "module": 5,
    "minutes": 8,
    "topicIds": [
      "decoding-sampling"
    ],
    "summary": "模型产生候选分数，解码策略决定选什么；同一模型可以因策略不同而输出不同文本。",
    "prerequisites": [
      "条件概率",
      "softmax"
    ],
    "sections": {
      "quick": [
        {
          "id": "choice",
          "title": "概率分布还不是一句回答",
          "paragraphs": [
            "模型先为每个候选词元产生原始分数，也叫 logit。解码把分数变成概率并选择词元，再把选中的词元加入上下文，重复直到结束。",
            "贪心每步选最高概率；随机采样按分布抽取。贪心不保证整句概率最高，整句概率最高也不等于最有帮助或最真实。"
          ],
          "flow": [
            {
              "label": "原始分数",
              "detail": "网络给每个词元打分"
            },
            {
              "label": "温度变换",
              "detail": "调整分布集中程度"
            },
            {
              "label": "候选筛选",
              "detail": "按数量或累计概率保留候选"
            },
            {
              "label": "抽样与追加",
              "detail": "选一个词元，再生成下一步"
            }
          ]
        },
        {
          "id": "temperature",
          "title": "温度改变概率比例",
          "paragraphs": [
            "记第 i 个词元的分数为 z_i，温度为 τ，候选总数为 V，最后概率为 p_i。正温度越小，分数差距通常被放大；温度越大，分布更平。",
            "温度不是“创造力”参数，也不会自动修复事实错误。数学公式要求温度大于零；接口里的温度 0 通常另行表示贪心规则，而不是直接除以零。"
          ],
          "formula": "p_i=\\frac{\\exp(z_i/\\tau)}{\\sum_{j=1}^{V}\\exp(z_j/\\tau)},\\qquad \\tau>0",
          "formulaReading": "每个候选分数除以温度、取指数；再除以所有候选指数的和，使概率总和为一。",
          "notation": [
            {
              "symbol": "p_i",
              "meaning": "第 i 个词元的输出概率"
            },
            {
              "symbol": "z_i,\\ z_j",
              "meaning": "候选 i 或 j 的原始分数"
            },
            {
              "symbol": "i,\\ j",
              "meaning": "词表里的候选编号"
            },
            {
              "symbol": "V",
              "meaning": "词表候选总数",
              "shape": "正整数"
            },
            {
              "symbol": "\\tau",
              "meaning": "温度，必须为正"
            },
            {
              "symbol": "\\exp",
              "meaning": "指数函数"
            },
            {
              "symbol": "\\sum",
              "meaning": "将 j 从 1 到 V 的结果相加"
            },
            {
              "symbol": ">",
              "meaning": "大于"
            }
          ]
        },
        {
          "id": "filters",
          "title": "Top-k 与 Top-p 控制保留谁",
          "paragraphs": [
            "Top-k 保留分数最高的 k 个候选；k 是人为设置的候选数量。Top-p 从高到低累计概率，保留达到阈值 p 的最短前缀；这里的 p 是累计概率阈值，不是上一公式某个词元的概率。",
            "例如排序概率为 0.5、0.3、0.15、0.05，Top-p 阈值取 0.75，需要保留前两个，因为累计从 0.5 增到 0.8 才达到阈值。保留后必须重新归一化。"
          ],
          "checkpoint": {
            "question": "Top-p=0.75 是否会保留所有概率大于 0.75 的单词？",
            "answer": "不是。它关注排序后的累计概率，通常会保留若干候选使累计质量达到阈值。"
          }
        }
      ],
      "deep": [
        {
          "id": "beam",
          "title": "束搜索保留多条暂时领先的路径",
          "paragraphs": [
            "束搜索（beam search）每步扩展若干前缀，再保留总得分最高的有限条。束宽是同时保留的前缀数量；它扩大搜索范围，但仍不是穷举所有句子。",
            "完整序列通常用词元对数概率相加打分。由于每个对数概率不大于零，长度会影响分数；长度惩罚、结束处理和是否归一化必须一起说明。束搜索适合一些有较明确目标的任务，但开放式文本中可能产生重复或平淡输出。"
          ]
        },
        {
          "id": "order",
          "title": "筛选顺序也是算法的一部分",
          "paragraphs": [
            "先调温度再做 Top-p，与先按原概率筛选再调温度，可能保留不同候选。若同时使用多种过滤器，要记录它们的顺序。",
            "重复惩罚、禁止词元、长度约束会进一步改变分布。固定随机种子可提高同一环境下复现程度，但不同设备、内核、并行方式仍可能带来差异。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "nucleus-code",
          "title": "实现四个候选的核采样",
          "paragraphs": [
            "核采样是 Top-p 的另一名称。代码先排序并保留达到阈值的最短前缀，再归一化后抽样。局部随机数生成器固定种子，不影响其他实验的随机状态。"
          ],
          "code": "import random\n\nprobabilities = {'甲': 0.50, '乙': 0.30, '丙': 0.15, '丁': 0.05}\nthreshold = 0.75\nassert 0 < threshold <= 1\nkept, total = [], 0.0\nfor token, probability in sorted(probabilities.items(), key=lambda item: -item[1]):\n    kept.append((token, probability))\n    total += probability\n    if total >= threshold:\n        break\nnormalized = [(token, probability / total) for token, probability in kept]\nassert [token for token, _ in normalized] == ['甲', '乙']\nassert abs(sum(probability for _, probability in normalized) - 1) < 1e-12\nrng = random.Random(7)\nprint(rng.choices([token for token, _ in normalized],\n                  weights=[probability for _, probability in normalized], k=5))\n"
        },
        {
          "id": "compare",
          "title": "比较解码时固定模型与提示",
          "paragraphs": [
            "对同一模型、同一提示分别测试贪心、束搜索和若干采样设置。记录长度、重复、正确性和多样性，而不只挑一条看起来不错的输出。",
            "随机采样要重复多次；否则一次幸运答案会误导判断。报告词元预算、结束规则和抽样次数，才能公平比较。"
          ]
        }
      ]
    },
    "misconceptions": [
      "更高温度不自动让答案更聪明；它改变的是选择分布。",
      "更宽的束不是所有任务上都更好，搜索目标与人类偏好可能不一致。"
    ],
    "references": [
      {
        "title": "The Curious Case of Neural Text Degeneration",
        "author": "Holtzman et al. · 2020",
        "url": "https://arxiv.org/abs/1904.09751",
        "reason": "核采样、似然最大化与开放式生成的区别。"
      },
      {
        "title": "Sequence to Sequence Learning with Neural Networks",
        "author": "Sutskever, Vinyals & Le · 2014",
        "url": "https://arxiv.org/abs/1409.3215",
        "reason": "序列建模与束搜索的早期实践。"
      }
    ]
  },
  {
    "id": "llm-evaluation",
    "title": "语言模型评估：分数究竟代表什么",
    "english": "Model Evaluation",
    "module": 5,
    "minutes": 7,
    "topicIds": [
      "llm-evaluation"
    ],
    "summary": "先定义使用场景和评分规则，再比较模型；同一个总分可能掩盖非常不同的错误。",
    "prerequisites": [
      "概率",
      "训练集与测试集"
    ],
    "sections": {
      "quick": [
        {
          "id": "question",
          "title": "先把“模型更好”改成可测问题",
          "paragraphs": [
            "例如把目标写成：“面对未见过的实验表格，模型能否正确说出哪项指标改善，并给出对应数字？”这比笼统比较“科研能力”更容易核验。",
            "分类正确率、生成答案的人工评分、事实核对、拒答率、校准和运行成本是不同维度。选择指标应来自使用需求，而不是因为某个排行榜恰好提供它。"
          ],
          "flow": [
            {
              "label": "使用场景",
              "detail": "明确用户实际需要完成什么"
            },
            {
              "label": "独立样本",
              "detail": "与训练和调参数据分离"
            },
            {
              "label": "固定协议",
              "detail": "提示、预算与评分规则一致"
            },
            {
              "label": "错误分析",
              "detail": "总体结果加任务切片"
            }
          ]
        },
        {
          "id": "accuracy",
          "title": "从最简单的准确率开始",
          "paragraphs": [
            "测试题数记为 N，第 i 题是否正确记为 c_i，正确时为 1，错误时为 0。准确率 a 就是这些值的平均。",
            "例如 20 题对 16 题，准确率为 0.8。这个数不说明错题是否都来自同一种语言，也不说明不确定性有多大。"
          ],
          "formula": "a=\\frac1N\\sum_{i=1}^{N}c_i,\\qquad c_i\\in\\{0,1\\}",
          "formulaReading": "把每题正确标记加起来，除以测试题数，得到正确比例。",
          "notation": [
            {
              "symbol": "a",
              "meaning": "准确率",
              "shape": "0 到 1"
            },
            {
              "symbol": "N",
              "meaning": "测试题总数，必须大于零",
              "shape": "整数"
            },
            {
              "symbol": "i",
              "meaning": "题目编号",
              "shape": "1 到 N"
            },
            {
              "symbol": "c_i",
              "meaning": "第 i 题正确标记",
              "shape": "0 或 1"
            },
            {
              "symbol": "\\sum",
              "meaning": "对所有题目求和"
            },
            {
              "symbol": "\\in\\{0,1\\}",
              "meaning": "只能在集合 0 和 1 中取值"
            }
          ]
        },
        {
          "id": "protocol",
          "title": "相同模型名也可能对应不同实验",
          "paragraphs": [
            "提示模板、示例数量、是否允许工具、生成长度、采样次数和答案提取规则都会改变结果。比较时固定这些条件，或明确把它们当作实验变量。",
            "选择题中直接比较候选概率，与让模型生成字母后解析，是不同评价方式。自动提取失败可能是格式错误，也可能是答案错误，最好分别统计。"
          ],
          "checkpoint": {
            "question": "两个模型准确率只差一个题目，可以直接宣布前者稳定更好吗？",
            "answer": "通常不行。需要看样本量、题目依赖、配对差异和重复实验，报告不确定性。"
          }
        }
      ],
      "deep": [
        {
          "id": "uncertainty",
          "title": "同一批题上的比较应保留配对关系",
          "paragraphs": [
            "如果两个模型回答同一组题，应该比较每题谁对谁错，而不是只保留两个总分。配对重采样会把同一题的两份结果一起抽取，避免丢失题目难度这一共同因素。",
            "若同一文档派生多题，题目并不独立；应考虑按文档组或说话人组重采样。简单逐题抽样可能低估波动。"
          ]
        },
        {
          "id": "judge",
          "title": "用模型打分也需要检查评分者",
          "paragraphs": [
            "语言模型评审可以降低人工成本，但会受答案顺序、长度、风格和自我偏好影响。交换答案位置、隐藏模型名称、抽取人工复核集可以检查这些偏差。",
            "评分者与被测模型共享知识漏洞或训练污染时，分数可能一起失真。事实任务尽量结合可核对证据与程序化检查；主观任务需要明确评分准则与标注者一致性。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "bootstrap-code",
          "title": "给出配对差异，而不只给总分",
          "paragraphs": [
            "下面用八道题演示配对自助重采样（bootstrap）：每次抽取题号，两个模型同时使用这些题号。这里只演示不确定性计算流程，八题不足以支持强结论。"
          ],
          "code": "import random\n\ncorrect_a = [1, 1, 0, 1, 0, 1, 1, 0]\ncorrect_b = [1, 0, 0, 1, 1, 0, 1, 0]\nassert len(correct_a) == len(correct_b) and correct_a\nrng = random.Random(7)\ncount = len(correct_a)\ndifferences = []\nfor _ in range(2000):\n    indices = [rng.randrange(count) for _ in range(count)]\n    differences.append(sum(correct_a[i] - correct_b[i] for i in indices) / count)\ndifferences.sort()\nobserved = sum(a - b for a, b in zip(correct_a, correct_b)) / count\nprint('observed difference:', observed)\nprint('illustrative percentile interval:', differences[49], differences[1949])\n"
        },
        {
          "id": "report",
          "title": "一张结果表应该附带什么",
          "paragraphs": [
            "至少记录模型版本、测试集版本、提示模板、解码参数、工具权限、评分规则和测试日期。展示总体结果以及语言、难度或任务类型的切片。",
            "开发集用于选择方案，测试集用于最终报告。看过测试错误后继续修改提示，测试集就参与了开发；应承认这一点，并保留新的独立样本。"
          ],
          "bullets": [
            "报告失败案例，避免只展示成功样本。",
            "区分模型内容错误、格式解析失败和工具失败。",
            "在准确率之外记录成本与延迟。"
          ]
        }
      ]
    },
    "misconceptions": [
      "单一榜单不能覆盖所有使用场景。",
      "更多采样机会通常能提高找到正确答案的机会，比较时必须对齐计算预算。"
    ],
    "references": [
      {
        "title": "Holistic Evaluation of Language Models",
        "author": "Liang et al. · 2022",
        "url": "https://arxiv.org/abs/2211.09110",
        "reason": "多场景、多指标和标准化评价协议。"
      },
      {
        "title": "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena",
        "author": "Zheng et al. · 2023",
        "url": "https://arxiv.org/abs/2306.05685",
        "reason": "模型评审与顺序、冗长等偏差。"
      }
    ]
  },
  {
    "id": "llm-systems",
    "title": "高效训练与推理：先找真正的瓶颈",
    "english": "Efficient Inference & Distributed Training",
    "module": 5,
    "minutes": 9,
    "topicIds": [
      "efficient-inference-training"
    ],
    "summary": "区分预填充与逐词元解码，再看数据并行、参数分片、张量并行和流水线各解决什么。",
    "prerequisites": [
      "Transformer",
      "训练与推理",
      "矩阵形状"
    ],
    "sections": {
      "quick": [
        {
          "id": "two-phases",
          "title": "生成有两个不同阶段",
          "paragraphs": [
            "预填充（prefill）一次处理已有提示，建立各层的键和值缓存。解码（decode）反复处理新词元，复用过去的缓存。长提示的预填充与许多短解码步可能遇到不同瓶颈。",
            "首词元延迟包含排队和预填充等成本；后续每词元延迟衡量持续生成速度。吞吐量是单位时间服务的总词元或请求数，与单个用户等待时间不同。"
          ],
          "flow": [
            {
              "label": "请求进入",
              "detail": "排队并按策略组成批次"
            },
            {
              "label": "预填充",
              "detail": "处理提示并建立缓存"
            },
            {
              "label": "逐词元解码",
              "detail": "读取权重和历史缓存"
            },
            {
              "label": "完成与释放",
              "detail": "回收缓存并记录延迟"
            }
          ]
        },
        {
          "id": "cache-memory",
          "title": "缓存为什么随上下文增长",
          "paragraphs": [
            "设 B 为同时处理的序列数，L 为层数，T 为缓存词元数，H_kv 为键值头数，d_h 为每个头的维度，b 为每个缓存数占的字节数。下面估算每层都缓存键和值的普通情况，不包含分配碎片和额外元数据。",
            "例如一条序列、两层、四个词元、两个键值头、每头三维、每个数两字节，缓存约占 192 字节。例子很小，只用来核对每个乘数。"
          ],
          "formula": "M_{\\rm KV}=2BLTH_{\\rm kv}d_hb",
          "formulaReading": "两个缓存分别保存键和值；再乘批大小、层数、词元数、键值头数、每头维度和每个数的字节数。",
          "notation": [
            {
              "symbol": "M_{\\mathrm{KV}}",
              "meaning": "键值缓存占用字节数；KV 指 key/value"
            },
            {
              "symbol": "2",
              "meaning": "键和值各保存一份"
            },
            {
              "symbol": "B",
              "meaning": "同时缓存的序列条数",
              "shape": "整数"
            },
            {
              "symbol": "L",
              "meaning": "模型层数",
              "shape": "整数"
            },
            {
              "symbol": "T",
              "meaning": "每条序列缓存的词元数",
              "shape": "整数"
            },
            {
              "symbol": "H_{\\mathrm{kv}}",
              "meaning": "键值头数量；kv 文字下标指键和值"
            },
            {
              "symbol": "d_h",
              "meaning": "每个头的维度；h 下标表示 head"
            },
            {
              "symbol": "b",
              "meaning": "每个缓存数值占的字节数",
              "shape": "字节"
            },
            {
              "symbol": "B\\,L\\,T",
              "meaning": "本式中各因子相乘，不是组成一个变量名"
            }
          ]
        },
        {
          "id": "parallelisms",
          "title": "并行方法把什么分给不同设备",
          "paragraphs": [
            "数据并行让每张设备持有模型副本、处理不同样本，再汇总梯度。张量并行把一次矩阵或层的运算拆到多张设备，代价是层内通信。流水线并行把不同层分到不同设备，用小批次串接，但会产生等待空档。",
            "参数与优化器分片减少每张卡重复保存的状态。它与数据并行可结合；不能把所有多卡训练都叫模型并行。"
          ],
          "checkpoint": {
            "question": "增加一倍 GPU，训练速度一定增加一倍吗？",
            "answer": "不一定。通信、数据加载、层间等待和每卡工作量不足都可能限制扩展效率。"
          }
        }
      ],
      "deep": [
        {
          "id": "zero",
          "title": "ZeRO 分阶段减少重复状态",
          "paragraphs": [
            "零冗余优化器（Zero Redundancy Optimizer，ZeRO）在数据并行设备之间划分状态。第一阶段分片优化器状态，第二阶段再分片梯度，第三阶段进一步分片参数。",
            "参数分片让单卡不用常驻所有参数，但计算需要时必须收集相应部分；这用通信换内存。完全分片数据并行（Fully Sharded Data Parallel，FSDP）也采用参数、梯度和优化器状态分片思想，具体调度与实现不能只凭缩写视为完全相同。"
          ]
        },
        {
          "id": "tradeoffs",
          "title": "重计算、批处理与缓存各有交换条件",
          "paragraphs": [
            "激活检查点只保存部分前向中间结果，反向时重新计算其余结果，用额外计算换较低激活内存。它不直接减少模型参数量。",
            "连续批处理在某个请求结束后尽早加入新请求，减少等待。缓存分页或共享前缀可以改善内存管理；真正收益取决于请求长度、共同前缀、硬件和实现。",
            "精度压缩、缓存压缩和注意力优化可能组合使用，但每项都需要核对数值误差、任务质量和实际速度。纸面计算量少，不保证运行更快。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "budget-code",
          "title": "先做一份透明的内存估算",
          "paragraphs": [
            "下面只计算普通键值缓存，使用 Python 整数，不访问显卡。先用小例子检查单位，再估算一个教学配置；真实服务还要加权重、临时缓冲与分配开销。"
          ],
          "code": "def kv_bytes(batch, layers, tokens, kv_heads, head_dim, bytes_per_value):\n    return 2 * batch * layers * tokens * kv_heads * head_dim * bytes_per_value\n\nassert kv_bytes(1, 2, 4, 2, 3, 2) == 192\nordinary = kv_bytes(1, 32, 4096, 32, 128, 2)\ngrouped = kv_bytes(1, 32, 4096, 8, 128, 2)\nassert ordinary == 4 * grouped\nprint('ordinary GiB:', ordinary / 1024**3)\nprint('grouped GiB:', grouped / 1024**3)\n"
        },
        {
          "id": "profile",
          "title": "从测量结果决定优化顺序",
          "paragraphs": [
            "先测数据加载、前向、反向、优化器更新与通信分别耗时多少。推理则固定输入长度、输出长度和并发数，分别报告首词元延迟、后续速度及峰值内存。",
            "异步 GPU 操作会让直接计时低估真正耗时，测量时使用合适事件或同步，并做预热。同步只用于测量，不应不加分析地塞进每个生产步骤。"
          ],
          "bullets": [
            "优化实际占比最大的阶段，避免只优化容易观察的部分。",
            "比较精度变化前后任务指标，防止只追速度。",
            "记录设备型号、软件版本、批大小与长度分布。"
          ]
        }
      ]
    },
    "misconceptions": [
      "键值缓存减少重复计算，但会占用随长度增长的内存。",
      "参数分片能减少内存重复，不会消除计算与通信成本。"
    ],
    "references": [
      {
        "title": "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models",
        "author": "Rajbhandari et al. · 2020",
        "url": "https://arxiv.org/abs/1910.02054",
        "reason": "理解分片优化器状态、梯度和参数的区别。"
      },
      {
        "title": "Efficient Memory Management for Large Language Model Serving with PagedAttention",
        "author": "Kwon et al. · 2023",
        "url": "https://arxiv.org/abs/2309.06180",
        "reason": "键值缓存管理与服务吞吐。"
      },
      {
        "title": "PyTorch Profiler",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/profiler.html",
        "reason": "测量算子时间与内存以定位瓶颈。"
      }
    ]
  }
];
