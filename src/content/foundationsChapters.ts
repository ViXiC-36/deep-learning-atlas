import type { Chapter } from './types.ts';

/** Foundations: each equation is paired with local definitions and a Chinese reading. */
export const foundationsChapters: Chapter[] = [
  {
    "id": "tensors-linear-algebra",
    "title": "张量与线性变换：先读懂形状，再做计算",
    "english": "Tensors, Broadcasting & Linear Algebra",
    "module": 0,
    "minutes": 5,
    "topicIds": [
      "tensors",
      "linear-algebra"
    ],
    "summary": "把每条轴的含义写清楚，再区分逐元素操作、矩阵乘法和广播；形状是检查模型的第一道工具。",
    "prerequisites": [
      "基础代数"
    ],
    "sections": {
      "quick": [
        {
          "id": "why-shapes",
          "title": "目的：知道一串数字在表示什么",
          "paragraphs": [
          "一批三段语音，每段保留两项特征，可以排成三行两列：第一行是 [1,2]，第二行是 [3,4]，第三行是 [5,6]。这里“3×2”叫形状（shape），第一条轴表示样本，第二条轴表示特征。张量（tensor）在本网站的计算语境中就是带有轴、形状和数据类型的多维数组。",
            "只有一个数的标量没有轴；一串数的向量有一条轴；矩阵有两条轴。两条长度均为 3 的轴也可能分别表示时间与通道，尺寸相同不代表语义相同。写代码前先记录每一轴的含义，能避免把时间与特征误作相同维度。"
          ],
          "flow": [
            {
              "label": "解释数据",
              "detail": "三条样本，每条两项特征"
            },
            {
              "label": "标记形状",
              "detail": "样本轴长 3，特征轴长 2"
            },
            {
              "label": "选择运算",
              "detail": "决定哪些轴保留、哪些轴求和"
            },
            {
              "label": "检查输出",
              "detail": "确认形状与任务含义同时正确"
            }
          ]
        },
        {
          "id": "numeric-transform",
          "title": "把两项特征变成一个预测",
          "paragraphs": [
            "设第一项特征的权重是 2，第二项权重是 −1，偏置是 0.5。对 [1,2]，先算 1×2+2×(−1)=0，再加偏置得到 0.5；三行输入的结果依次是 0.5、2.5、4.5。权重告诉模型如何组合特征，偏置允许整体平移。",
            "这里只对每条样本做同一套运算，样本之间没有互相混合。把三条样本一起计算称为批量计算；它通常使用矩阵乘法提高效率，但数学结果应当与逐行计算一致。"
          ],
          "checkpoint": {
            "question": "把三条样本排成 3×2 后，使用一个 2×1 的权重矩阵，输出的两条轴分别表示什么？",
            "answer": "输出是 3×1：三条样本各保留一个预测值。被相乘后求和的是长度为 2 的特征轴。"
          }
        }
      ],
      "deep": [
        {
          "id": "matmul",
          "title": "矩阵乘法：沿共同特征轴配对并求和",
          "paragraphs": [
            "现在把输入矩阵命名为 X，权重矩阵命名为 W，输出命名为 Y。样本数用 B 表示，输入特征数用 D 表示，输出特征数用 H 表示。因此 X 有 B 行 D 列，W 有 D 行 H 列，结果 Y 有 B 行 H 列。",
            "下式计算输出的第 i 行、第 j 列。先固定输出位置，再让索引 k 依次遍历所有输入特征；每次取 X 第 i 行第 k 列与 W 第 k 行第 j 列相乘，最后求和。前面例子的 B=3、D=2、H=1。"
          ],
          "formula": "Y=XW,\\qquad Y_{ij}=\\sum_{k=1}^{D}X_{ik}W_{kj}",
          "formulaReading": "“Y 等于 X 乘 W”。其中“Y 下标 i j”等于：让 k 从 1 走到 D，把“X 下标 i k”与“W 下标 k j”相乘，再把这些乘积相加。",
          "notation": [
            {
              "symbol": "X",
              "meaning": "输入矩阵；每行是一条样本",
              "shape": "B × D",
              "example": "[[1,2],[3,4],[5,6]]"
            },
            {
              "symbol": "W",
              "meaning": "把输入特征映射为输出特征的权重矩阵",
              "shape": "D × H",
              "example": "[[2],[-1]]"
            },
            {
              "symbol": "Y",
              "meaning": "矩阵乘法结果",
              "shape": "B × H",
              "example": "[[0],[2],[4]]"
            },
            {
              "symbol": "B,D,H",
              "meaning": "分别是样本数、输入特征数、输出特征数",
              "example": "3、2、1"
            },
            {
              "symbol": "i,j,k",
              "meaning": "分别索引样本、输出特征、输入特征；下标表示取对应位置的元素"
            },
            {
              "symbol": "\\sum_{k=1}^{D}",
              "meaning": "求和符号；下界 k=1、上界 D 表示遍历所有输入特征"
            },
            {
              "symbol": "XW,\\ X_{ik}W_{kj}",
              "meaning": "前者是矩阵乘法，后者是两个标量的普通乘法；相邻书写表示相乘"
            }
          ]
        },
        {
          "id": "broadcast",
          "title": "广播不是“尺寸凑得上就随便相加”",
          "paragraphs": [
            "广播（broadcasting）把较小数组按规定的轴复用。判断时从最右端对齐维度：对应尺寸必须相等，或其中一个为 1；缺失的左侧维度视为 1。于是形状 3×2 与形状 2 可以相加，等价于每行都加同一个两元素向量。",
            "例如 [[1,2],[3,4]] 加 [10,20] 得到 [[11,22],[13,24]]。但形状 3×1 与形状 3 相加会得到 3×3，而非你可能期待的三个逐样本误差。回归预测若是 B×1、标签是 B，减法会静默产生 B×B 的两两差值矩阵。",
            "广播通常不需要真的复制整份数据；但输出仍可能很大。反向传播时，被重复使用的输入必须收集所有使用位置的梯度，因此广播出去的轴会在梯度回传时被求和。"
          ],
          "checkpoint": {
            "question": "形状 [2,3,4] 与 [3,1] 相加得到什么？与 [2,3] 相加呢？",
            "answer": "前者从右对齐为 [2,3,4] 与 [1,3,1]，输出 [2,3,4]。后者最后一维 4 与 3 不相容，不能广播。"
          }
        },
        {
          "id": "transpose-norm",
          "title": "转置与长度：两个经常见到的操作",
          "paragraphs": [
            "转置把矩阵的行和列互换：[[1,2],[3,4],[5,6]] 的转置是 [[1,3,5],[2,4,6]]，形状从 3×2 变成 2×3。转置不是求逆，也不自动恢复一个线性层的输入；不可逆或降维映射可能已经丢失信息。",
            "向量的欧氏范数衡量它的长度。把一个向量命名为 v，并令它有 D 个分量；长度的计算方法是先平方每个分量，再相加，最后开平方。例如 [3,4] 的长度是 5。这一长度会在梯度裁剪、距离与正则化中反复出现。"
          ],
          "formula": "\\|v\\|_2=\\sqrt{\\sum_{k=1}^{D}v_k^2},\\qquad (X^\\top)_{ij}=X_{ji}",
          "formulaReading": "“v 的二范数”等于：把每个分量 v 下标 k 平方，求和，再开平方。第二式说：X 转置后第 i 行第 j 列，就是原 X 第 j 行第 i 列。",
          "notation": [
            {
              "symbol": "v",
              "meaning": "含 D 个实数分量的向量",
              "shape": "D",
              "example": "[3,4]"
            },
            {
              "symbol": "D,k",
              "meaning": "D 是向量维度，k 是从 1 到 D 的分量索引"
            },
            {
              "symbol": "\\|v\\|_2",
              "meaning": "欧氏范数，也叫二范数，是非负标量",
              "example": "‖[3,4]‖₂=5"
            },
            {
              "symbol": "\\sqrt{\\cdot},\\ (\\cdot)^2",
              "meaning": "分别表示平方根、平方；这里先平方再求和"
            },
            {
              "symbol": "\\sum_{k=1}^{D}",
              "meaning": "将所有指定索引的项相加"
            },
            {
              "symbol": "X,\\ X^\\top",
              "meaning": "X 是矩阵；右上角 ⊤ 表示交换行列的转置"
            },
            {
              "symbol": "i,j",
              "meaning": "i 与 j 是行列位置；转置公式交换这两个位置"
            }
          ]
        },
        {
          "id": "geometry",
          "title": "线性层在几何上做了什么？",
          "paragraphs": [
            "矩阵乘法可以组合旋转、缩放、剪切与投影。对二维向量把第一坐标乘 2、第二坐标乘 0.5，会把单位圆拉成椭圆；把两个坐标相加变成一个数，则是从平面投影到一条轴。",
            "纯矩阵乘法保持向量加法与标量缩放，所以是线性变换。再加偏置后严格说是仿射变换，深度学习中仍常称“线性层”。多个仿射层之间如果没有非线性，仍能合并成一个仿射层；这就是多层网络需要激活函数的重要原因。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "matrix-code",
          "title": "用标准 Python 验证数值与形状",
          "paragraphs": [
            "这段代码可以直接用 Python 3 运行。X、W 和偏置 bias 对应上文的输入、权重与平移；列表外层是行，内层是列。函数会先检查共同轴长度，避免错误形状得到看似正常的数字。"
          ],
          "code": "import math\n\ndef matmul(left, right):\n    assert left and right\n    inner = len(left[0])\n    assert inner == len(right)\n    cols = len(right[0])\n    assert all(len(row) == inner for row in left)\n    assert all(len(row) == cols for row in right)\n    return [[sum(row[k] * right[k][j] for k in range(inner))\n             for j in range(cols)] for row in left]\n\nX = [[1, 2], [3, 4], [5, 6]]\nW = [[2], [-1]]\nbias = 0.5\nY = [[value + bias for value in row] for row in matmul(X, W)]\nassert Y == [[0.5], [2.5], [4.5]]\ntransposed = list(map(list, zip(*X)))\nassert transposed == [[1, 3, 5], [2, 4, 6]]\nassert math.sqrt(sum(value * value for value in [3, 4])) == 5\nprint(Y)"
        },
        {
          "id": "tensor-checks",
          "title": "转成 PyTorch 时先检查哪几件事？",
          "paragraphs": [
            "在 PyTorch 中，@ 表示矩阵乘法，而 * 是逐元素乘法。nn.Linear 的权重存储为“输出特征数×输入特征数”，因此数学中写 XW，调用该模块内部使用的是输入乘存储权重的转置。两种写法都可以，不能混用形状约定。",
          "reshape 只改变元素的排列解释，不等于交换轴；要把“时间×通道”变成“通道×时间”需要 transpose 或 permute。整数索引、浮点输入和布尔掩码还具有不同的数据类型（dtype），形状一致并不能保证运算语义一致。"
          ],
          "bullets": [
            "每次打印 shape 时同时标注轴名，而不只记录数字。",
            "回归损失前检查预测与标签形状完全相同。",
            "广播导致的意外大矩阵会同时影响正确性、显存和速度。"
          ]
        }
      ]
    },
    "misconceptions": [
      "矩阵的阶数指轴数；矩阵的秩是线性独立方向的数量，两者不同。",
      "形状兼容只是可计算的条件，不能证明轴的语义正确。",
      "转置不是逆矩阵；reshape 也不自动交换轴。"
    ],
    "references": [
      {
        "title": "Broadcasting semantics",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/notes/broadcasting.html",
        "reason": "核对从尾部对齐尺寸的广播规则及常见边界。"
      },
      {
        "title": "CS229 Lecture Notes",
        "author": "Andrew Ng / Tengyu Ma · Stanford",
        "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
        "reason": "阅读线性回归与矩阵运算如何连接到机器学习。"
      }
    ]
  },
  {
    "id": "matrix-calculus-autodiff",
    "title": "矩阵微分与计算图：把“影响多少”写成可计算的量",
    "english": "Jacobian, Chain Rule & Automatic Differentiation",
    "module": 0,
    "minutes": 5,
    "topicIds": [
      "matrix-calculus",
      "computational-graph"
    ],
    "summary": "导数描述微小变化；Jacobian 收集所有输入输出对的导数；自动微分在真实计算图上复用链式法则。",
    "prerequisites": [
      "tensors-linear-algebra",
      "单变量导数"
    ],
    "sections": {
      "quick": [
        {
          "id": "local-effect",
          "title": "目的：预测输入小改动造成的输出变化",
          "paragraphs": [
            "设一个输入数是 2，输出规则是“先平方，再加输入的三倍”。输出为 10；若输入增加 0.001，输出变为 10.007001，变化约为输入变化的 7 倍。这个局部变化率就是导数，在这个位置等于 7。",
            "导数是当前位置的局部近似，不是对任意大步长都精确成立的比例。例如把输入从 2 改成 3，真正输出变化是 8，而用旧导数乘步长只得到 7。优化器选择多大的更新步长，正是在利用局部信息与控制近似误差之间权衡。"
          ],
          "checkpoint": {
            "question": "同一个函数在输入 0 与输入 2 处，导数必须相同吗？",
            "answer": "不必。平方加三倍输入的导数分别是 3 和 7；导数通常依赖当前输入。"
          }
        },
        {
          "id": "graph-example",
          "title": "一份输入走两条路径，梯度会汇合",
          "paragraphs": [
            "把上例拆成“平方”“乘以三”“相加”三个节点。输入同时流向前两个节点，所以返回输入的梯度需要相加。在输入为 2 时，平方分支贡献 4，线性分支贡献 3，总计 7。",
            "自动微分不是先猜出一个导数公式，也不是靠多次试验扰动参数。它记录本次运行实际执行了哪些运算，并把每个运算已知的局部导数组合起来。条件分支走了哪条路，计算图就记录哪条路。"
          ],
          "flow": [
            {
              "label": "保存输入",
              "detail": "输入值为 2"
            },
            {
              "label": "分支前向",
              "detail": "平方得到 4；乘三得到 6"
            },
            {
              "label": "得到标量",
              "detail": "相加得到 10"
            },
            {
              "label": "反向汇合",
              "detail": "平方分支返回 4，乘三分支返回 3，合计 7"
            }
          ]
        }
      ],
      "deep": [
        {
          "id": "jacobian",
          "title": "向量输出需要一张导数表",
          "paragraphs": [
            "令输入向量 x 有两个分量，分别叫 x₁ 与 x₂。定义输出向量 f 的第一分量为 x₁ 的平方加 x₂，第二分量为两个输入的乘积。把 x 设为 [2,3]，输出是 [7,6]。",
            "Jacobian（雅可比矩阵）把每个输出分量对每个输入分量的偏导放入一张表：行对应输出，列对应输入。在这个例子中，表为 [[4,1],[3,2]]。例如左下的 3 表示第二个输出对第一个输入的变化率为 3。"
          ],
          "formula": "J_{ij}=\\frac{\\partial f_i}{\\partial x_j},\\qquad J=\\begin{bmatrix}2x_1&1\\\\x_2&x_1\\end{bmatrix},\\qquad J\\big|_{x=(2,3)}=\\begin{bmatrix}4&1\\\\3&2\\end{bmatrix}",
          "formulaReading": "“J 下标 i j”是输出 f 的第 i 个分量对输入 x 的第 j 个分量的偏导数。先对每个输入分别求导形成矩阵，再把 x₁=2、x₂=3 代入，得到右边的数字表。",
          "notation": [
            {
              "symbol": "x,\\ x_1,x_2",
              "meaning": "输入向量及其两个分量",
              "shape": "2",
              "example": "[2,3]"
            },
            {
              "symbol": "f,\\ f_i",
              "meaning": "向量值函数及其第 i 个输出；本例输出 [x₁²+x₂,x₁x₂]",
              "shape": "2"
            },
            {
              "symbol": "J,\\ J_{ij}",
              "meaning": "Jacobian 矩阵及其第 i 行第 j 列",
              "shape": "2 × 2"
            },
            {
              "symbol": "\\frac{\\partial f_i}{\\partial x_j}",
              "meaning": "固定其他输入时，fᵢ 对 xⱼ 的偏导数"
            },
            {
              "symbol": "i,j",
              "meaning": "分别选择输出行和输入列；不是乘法"
            },
            {
              "symbol": "\\left.J\\right|_{x=(2,3)}",
              "meaning": "在输入取 [2,3] 的位置评价该矩阵"
            },
            {
              "symbol": "x_1^2,\\ 2x_1,\\ x_1x_2",
              "meaning": "² 表示平方；2x₁ 和 x₁x₂ 表示普通标量乘法"
            }
          ]
        },
        {
          "id": "chain-rule",
          "title": "反向传播只需要 Jacobian 与向量的乘积",
          "paragraphs": [
            "现在把两个输出再合成一个损失：第一项输出乘 1，第二项输出乘 2，然后相加。把损失对两个输出的导数组成向量 g，得到 [1,2]。输出的每一项都会影响输入，所以输入梯度是上面 Jacobian 的转置乘 g，结果 [10,5]。",
            "这里使用列向量记法。若输入有 n 个分量、输出有 m 个分量，Jacobian 是 m×n，转置后乘一个 m 维向量，得到 n 维输入梯度。神经网络训练经常只有一个最终损失，却有很多参数，因此这种反向模式十分合适。"
          ],
          "formula": "\\nabla_x L=J^\\top g,\\qquad g=\\nabla_f L,\\qquad \\begin{bmatrix}4&3\\\\1&2\\end{bmatrix}\\begin{bmatrix}1\\\\2\\end{bmatrix}=\\begin{bmatrix}10\\\\5\\end{bmatrix}",
          "formulaReading": "“损失 L 对输入 x 的梯度”等于“J 的转置”乘“上游梯度 g”。g 本身是损失对输出向量 f 的梯度。数字例子中，第一分量为 4×1+3×2=10，第二分量为 1×1+2×2=5。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "标量损失；本例定义为第一输出加第二输出的两倍",
              "shape": "标量"
            },
            {
              "symbol": "x,f",
              "meaning": "分别是输入与中间输出向量",
              "shape": "n；m"
            },
            {
              "symbol": "g",
              "meaning": "损失对输出 f 的上游梯度",
              "shape": "m",
              "example": "[1,2]"
            },
            {
              "symbol": "\\nabla_x L,\\ \\nabla_f L",
              "meaning": "梯度符号 ∇ 表示把所有偏导按对应向量的分量排列"
            },
            {
              "symbol": "J,\\ J^\\top",
              "meaning": "J 为 m×n 的局部 Jacobian；⊤ 将它转为 n×m"
            },
            {
              "symbol": "n,m",
              "meaning": "分别为输入维度与输出维度，本例均为 2"
            },
            {
              "symbol": "J^\\top g",
              "meaning": "表示矩阵与列向量的乘法；沿共同维度乘积求和"
            }
          ]
        },
        {
          "id": "autodiff-choices",
          "title": "自动微分、符号微分和有限差分不是一回事",
          "paragraphs": [
            "符号微分操作的是代数表达式，可能得到一个新的导数表达式；自动微分对已执行的基本运算应用求导规则，并使用本次前向数值；有限差分则用两次或更多次函数评价近似斜率。它们可以服务同一目标，但误差来源和计算成本不同。",
            "前向模式传播一个输入方向对所有输出的影响；反向模式从一个输出加权组合出发，计算所有输入的影响。哪个更合适，取决于输入输出维度与所需的导数，不是“反向永远更先进”。自动微分也仍然受浮点误差、不可导点约定和代码语义影响。"
          ]
        },
        {
          "id": "saved-state",
          "title": "需要保存什么，为什么会占显存？",
          "paragraphs": [
            "乘法节点的反向需要前向时的另一个乘数，双曲正切激活函数 tanh 节点的反向可以复用其输出值。计算图通常会保留所需中间张量；批次或序列变长时，激活显存也随之增长。检查点重算可以少存一些中间量，但反向时必须补做相应前向。",
            "PyTorch 的叶子参数梯度会累加到 .grad；新的训练步应按意图清零。detach() 切断梯度连接，item() 把张量转换为普通 Python 数值，也不能继续沿原计算链求导。只复制数值再重新创建一个 requires_grad 张量，无法恢复已经丢掉的历史路径。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "tiny-reverse-code",
          "title": "一个可以直接运行的微型反向引擎",
          "paragraphs": [
            "下面只实现标量加法和乘法，足以复现“平方加三倍”的计算图。每个 Value 对象保存前向值 value、累积梯度 grad 和父节点 parents。反向时先按拓扑顺序收集节点，再逆序执行局部规则。",
            "同一变量可能被使用两次，例如输入乘自己，所以每个分支都用 += 累加梯度；如果写成赋值，就会覆盖另一条路径。这个微型实现不提供张量、广播、设备管理或高阶导数。"
          ],
          "code": "class Value:\n    def __init__(self, value, parents=()):\n        self.value = float(value)\n        self.grad = 0.0\n        self.parents = parents\n        self.local_backward = lambda: None\n\n    def __add__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.value + other.value, (self, other))\n        def backward():\n            self.grad += out.grad\n            other.grad += out.grad\n        out.local_backward = backward\n        return out\n\n    def __mul__(self, other):\n        other = other if isinstance(other, Value) else Value(other)\n        out = Value(self.value * other.value, (self, other))\n        def backward():\n            self.grad += other.value * out.grad\n            other.grad += self.value * out.grad\n        out.local_backward = backward\n        return out\n\n    def backward(self):\n        ordered, seen = [], set()\n        def visit(node):\n            if node not in seen:\n                seen.add(node)\n                for parent in node.parents:\n                    visit(parent)\n                ordered.append(node)\n        visit(self)\n        for node in ordered:\n            node.grad = 0.0\n        self.grad = 1.0\n        for node in reversed(ordered):\n            node.local_backward()\n\nx = Value(2)\nloss = x * x + x * 3\nloss.backward()\nassert loss.value == 10\nassert x.grad == 7\nepsilon = 1e-5\nf = lambda v: v * v + 3 * v\nfinite_difference = (f(2 + epsilon) - f(2 - epsilon)) / (2 * epsilon)\nassert abs(finite_difference - x.grad) < 1e-8\nprint(loss.value, x.grad, finite_difference)"
        },
        {
          "id": "vector-api",
          "title": "在真实框架中读取什么梯度？",
          "paragraphs": [
            "如果输出不是标量，PyTorch 的 autograd.grad 需要 grad_outputs 指定输出的加权方向；返回的是该方向与 Jacobian 的乘积，而不是默认把完整 Jacobian 交给你。要获得完整 Jacobian，可使用 torch.func.jacrev 等专门接口，但成本可能很高。",
            "调试时先在很小的输入上用双精度数值做检查，并避开激活函数不可导的位置。计算过程中的随机掩码也必须固定，否则两次前向的差别混入了随机性，有限差分就不再只测量参数变化。"
          ],
          "checkpoint": {
            "question": "输入 x 同时进入两个分支，一条回传梯度 4，另一条回传 3，应取平均、最大值还是相加？",
            "answer": "相加，得到 7。损失对同一变量的所有路径贡献由链式法则相加；取平均必须来自损失定义本身，不能随意加入。"
          }
        }
      ]
    },
    "misconceptions": [
      "自动微分不负责判断损失或数据标签是否正确；它只对执行的计算求导。",
      "gradient 与完整 Jacobian 形状不同，非标量输出不能含糊地说“求一个梯度”。",
      "在训练图之外重建相同数值，不代表保留了同一梯度连接。"
    ],
    "references": [
      {
        "title": "torch.autograd.grad",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.autograd.grad.html",
        "reason": "核对 grad_outputs、向量–Jacobian 乘积和梯度返回语义。"
      },
      {
        "title": "A Gentle Introduction to torch.autograd",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html",
        "reason": "把计算图、梯度累积与 no_grad 连接到可运行框架。"
      },
      {
        "title": "CS229 Lecture Notes — Matrix derivatives",
        "author": "Stanford",
        "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
        "reason": "进一步阅读多变量链式法则与神经网络的批量求导。"
      }
    ]
  },
  {
    "id": "probability-likelihood",
    "title": "概率与最大似然：模型怎样给观测数据打分？",
    "english": "Probability, Distributions & Maximum Likelihood",
    "module": 0,
    "minutes": 5,
    "topicIds": [
      "probability"
    ],
    "summary": "先区分随机变量、已发生的观测和未知参数，再用概率分布描述不确定性，用似然选择参数。",
    "prerequisites": [
      "基础代数",
      "对数运算"
    ],
    "sections": {
      "quick": [
        {
          "id": "coin-example",
          "title": "目的：从四次观测推测一枚硬币",
          "paragraphs": [
            "一枚硬币连续出现正、正、反、正。把正面记为 1、反面记为 0，记录是 [1,1,0,1]。我们不知道这枚硬币出现正面的真实概率，先比较两个候选模型：每次正面概率为 0.5，或为 0.75。假设各次结果独立，前者给这段具体记录的概率是 0.0625，后者是 0.10546875。",
            "最大似然估计（Maximum likelihood estimation）选择让已经看到的这段数据最可能出现的参数。这个例子中最佳正面概率是 3/4。它不是说真实概率已经被证明等于 0.75；四次观测很少，换一组数据就可能估计出另一个结果。"
          ],
          "flow": [
            {
              "label": "明确观测",
              "detail": "四个有顺序的结果：[1,1,0,1]"
            },
            {
              "label": "选择分布",
              "detail": "每次结果只有正面与反面"
            },
            {
              "label": "给定参数评分",
              "detail": "比较不同正面概率下这段记录的概率"
            },
            {
              "label": "估计与验证",
              "detail": "选择最高分参数，并在新数据上检查预测"
            }
          ]
        },
        {
          "id": "three-objects",
          "title": "随机变量、观测值与参数",
          "paragraphs": [
            "随机变量表示结果尚未揭晓前的量，例如下一次硬币结果；观测值是结果揭晓后的具体数字，例如 1；参数决定我们采用哪一个分布，例如“正面概率 0.75”。为了不混淆，本章用大写 Y 表示随机变量，小写 y 表示某次观测，θ 表示模型参数。",
            "频率是有限数据中的统计量，概率是分布里的量。用三次正面除以四次试验得到的频率，可以估计概率，但不与真实概率画等号。另一个常见区别是独立同分布：独立说明试验结果之间如何联系，同分布说明它们是否采用同一个分布。"
          ],
          "checkpoint": {
            "question": "四次全是正面，最大似然给出正面概率 1，是否证明下一次必是正面？",
            "answer": "没有。估计值依赖有限数据；最大似然本身不提供这种必然保证。可以用先验或平滑表达额外的不确定性，但那已经增加了建模假设。"
          }
        }
      ],
      "deep": [
        {
          "id": "bernoulli",
          "title": "伯努利分布：用一个式子覆盖两种结果",
          "paragraphs": [
            "设参数 θ 是正面概率，观测 y 只能取 0 或 1。y=1 时，应返回 θ；y=0 时，应返回 1−θ。利用任何正数的零次幂为 1，可以把两种情况合并为下面的式子。边界参数 0 或 1 可按对应离散分布直接定义。",
            "若有多个互斥类别，例如三个音素候选，用一个非负且总和为 1 的概率向量就是类别分布。概率和为 1 表示列出的类别覆盖全部可能；把任意三个分数直接叫概率，会缺少这个约束。"
          ],
          "formula": "P(Y=y\\mid\\theta)=\\theta^y(1-\\theta)^{1-y},\\qquad y\\in\\{0,1\\}",
          "formulaReading": "“给定参数 theta，随机变量 Y 等于观测 y 的概率”，等于 theta 的 y 次幂，乘以一减 theta 的一减 y 次幂。y 只能属于集合 {0,1}。代入 y=1 得 theta；代入 y=0 得一减 theta。",
          "notation": [
            {
              "symbol": "Y",
              "meaning": "尚未观测的二值随机变量",
              "example": "下一次硬币结果"
            },
            {
              "symbol": "y",
              "meaning": "已经观察到的一个具体结果",
              "shape": "标量",
              "example": "正面为 1，反面为 0"
            },
            {
              "symbol": "\\theta",
              "meaning": "正面概率这一未知参数；取值在 0 与 1 之间",
              "example": "0.75"
            },
            {
              "symbol": "P(\\cdot)",
              "meaning": "事件的概率；点号是待放入的事件位置"
            },
            {
              "symbol": "\\mid",
              "meaning": "条件符号，读作“给定”或“在……条件下”"
            },
            {
              "symbol": "\\theta^y,\\ (1-\\theta)^{1-y}",
              "meaning": "幂运算；这里不是样本索引"
            },
            {
              "symbol": "\\in,\\ \\{0,1\\}",
              "meaning": "∈ 表示属于；花括号列出允许的观测值"
            },
            {
              "symbol": "\\theta^y(1-\\theta)^{1-y}",
              "meaning": "两个概率因子作普通乘法"
            }
          ]
        },
        {
          "id": "likelihood-objective",
          "title": "为什么把概率连乘改成对数相加？",
          "paragraphs": [
            "把观测总数命名为 N，第 i 个观测命名为 yᵢ。在独立且共享参数的假设下，整组有顺序的记录的概率是逐次概率的乘积。把数据固定、把参数当作可变候选，这个函数就叫似然，记为 ℒ。",
            "当记录很长时，许多小于 1 的概率相乘容易变得极小。自然对数 ln 把乘积变成和，并且严格递增，所以最大化似然与最大化对数似然选择相同参数。训练框架惯用最小化，因此再取负号得到负对数似然。"
          ],
          "formula": "\\mathcal L(\\theta)=\\prod_{i=1}^{N}P(Y=y_i\\mid\\theta),\\qquad L(\\theta)=-\\sum_{i=1}^{N}\\ln P(Y=y_i\\mid\\theta)",
          "formulaReading": "似然花体 L 是所有观测概率的连乘；普通 L 表示训练损失，它是每个观测概率的自然对数相加后取负。让损失更小，就等价于让整段观测的似然更大。",
          "notation": [
            {
              "symbol": "\\mathcal L(\\theta)",
              "meaning": "似然函数：数据已固定，比较参数 θ 的好坏"
            },
            {
              "symbol": "L(\\theta)",
              "meaning": "负对数似然损失；与花体 ℒ 区分",
              "shape": "标量"
            },
            {
              "symbol": "\\theta",
              "meaning": "待估计的分布参数"
            },
            {
              "symbol": "N,i,y_i",
              "meaning": "N 是观测总数，i 从 1 数到 N，yᵢ 是第 i 个观测；下标表示样本编号"
            },
            {
              "symbol": "Y,\\ P(Y=y_i\\mid\\theta)",
              "meaning": "Y 是随机变量，P 是给定参数后对应观测的概率"
            },
            {
              "symbol": "\\prod_{i=1}^{N}",
              "meaning": "连乘，把索引范围内的各项相乘"
            },
            {
              "symbol": "\\sum_{i=1}^{N}",
              "meaning": "求和，把索引范围内的各项相加"
            },
            {
              "symbol": "\\ln,\\ -",
              "meaning": "ln 是以自然常数 e 为底的对数；前面的负号把最大化变成最小化"
            },
            {
              "symbol": "\\mid",
              "meaning": "条件符号，给定模型参数"
            }
          ]
        },
        {
          "id": "conditional",
          "title": "条件概率：听到一个线索，判断怎样改变？",
          "paragraphs": [
            "考虑一个纯教学天气例子：30% 的日子下雨，下雨时 80% 天空阴暗，不下雨时 20% 阴暗。100 天中，预计有 24 天既下雨又阴暗，14 天不下雨但阴暗。因此看到阴暗天空后，下雨概率是 24/(24+14)，约 63.16%。",
            "把“下雨”事件叫 A，把“阴暗”事件叫 B。贝叶斯公式说明，判断 A 在 B 已发生时的概率，需要结合反向条件概率、A 的原先概率，以及 B 的总发生概率。不能把“下雨时常阴暗”直接当成“阴暗时一定下雨”。"
          ],
          "formula": "P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)},\\qquad P(B)>0",
          "formulaReading": "“B 已发生时 A 的概率”，等于“A 已发生时 B 的概率”乘“A 原先的概率”，再除以“B 的总概率”。分母必须大于零，才能按这一比值定义条件概率。",
          "notation": [
            {
              "symbol": "A,B",
              "meaning": "两个事件；本例分别是下雨与天空阴暗"
            },
            {
              "symbol": "P(A),P(B)",
              "meaning": "两个事件不附加其他条件时的概率",
              "example": "0.3 与 0.38"
            },
            {
              "symbol": "P(A\\mid B),P(B\\mid A)",
              "meaning": "方向相反的条件概率，通常不相等",
              "example": "约 0.6316 与 0.8"
            },
            {
              "symbol": "\\mid",
              "meaning": "给定右边事件已经发生"
            },
            {
              "symbol": "\\frac{P(B\\mid A)P(A)}{P(B)}",
              "meaning": "分数线表示除法；分子内相邻概率相乘，结果再除以分母概率"
            },
            {
              "symbol": ">",
              "meaning": "严格大于；这里要求分母不是零"
            }
          ]
        },
        {
          "id": "continuous",
          "title": "连续量要区分概率密度与区间概率",
          "paragraphs": [
            "在连续分布里，某一个精确数值的概率通常是零；模型给出的曲线高度是概率密度，要对一个区间积分才得到概率。例如在区间 [0,0.5] 上均匀分布，密度高度是 2，但落在 [0,0.25] 的概率是面积 2×0.25=0.5。密度大于 1 并不矛盾。",
            "高斯分布通常用均值描述中心、用方差描述平方偏差的平均量。回归里若假设目标等于模型预测加一个固定方差的高斯噪声，最大似然等价于最小化平方误差；改变噪声模型，适合的损失也会改变。不能先随意选损失，再把所有误差都解释成同一种概率假设。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "mle-code",
          "title": "用网格比较与解析结果相互检查",
          "paragraphs": [
            "下面用 Python 标准库在 0.01 到 0.99 之间搜索正面概率，并计算负对数似然。代码中的 observations 是观测列表，theta 是候选正面概率，nll 是上文损失。log1p(-theta) 用于稳定计算 ln(1−theta)。"
          ],
          "code": "import math\n\nobservations = [1, 1, 0, 1]\n\ndef nll(theta):\n    return -sum(math.log(theta) if value == 1\n                else math.log1p(-theta) for value in observations)\n\ncandidates = [i / 100 for i in range(1, 100)]\nestimate = min(candidates, key=nll)\nfrequency = sum(observations) / len(observations)\nassert estimate == frequency == 0.75\nassert nll(0.75) < nll(0.5)\nassert abs(math.exp(-nll(0.75)) - 0.10546875) < 1e-12\n\nrain = 0.3\ndark_given_rain = 0.8\ndark_given_dry = 0.2\ndark = dark_given_rain * rain + dark_given_dry * (1 - rain)\nrain_given_dark = dark_given_rain * rain / dark\nassert abs(rain_given_dark - 24 / 38) < 1e-12\nprint(estimate, rain_given_dark)"
        },
        {
          "id": "model-assumptions",
          "title": "从硬币走到分类模型",
          "paragraphs": [
            "神经分类器的参数往往是大量权重，但目标依然可以是提高正确观测标签的概率。输入不同，模型预测的类别分布也不同；这种情形使用的是“给定输入的标签概率”，并不要求所有输入共享相同类别比例。",
            "训练前检查概率模型是否匹配问题：一个样本可同时有多个标签时，独立二元输出与互斥类别 Softmax 的语义不同；数据重复或相邻片段强相关时，简单独立样本假设也需要谨慎。最大似然是参数估计原则，不能代替对采样过程的检查。"
          ]
        }
      ]
    },
    "misconceptions": [
      "似然是固定数据后关于参数的函数，不自动是参数的概率分布。",
      "连续密度可以大于 1，但任何事件的概率都必须在 0 与 1 之间。",
      "P(A|B) 与 P(B|A) 一般不同，忽略事件的基础比例会误判。"
    ],
    "references": [
      {
        "title": "CS229 Lecture Notes — Probabilistic interpretation",
        "author": "Stanford",
        "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
        "reason": "查看最大似然如何连接回归和分类目标。"
      },
      {
        "title": "Probability distributions",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/distributions.html",
        "reason": "查看离散与连续分布的参数、log_prob 与采样接口。"
      }
    ]
  },
  {
    "id": "information-theory",
    "title": "熵、交叉熵与 KL：不要把三种不确定性混成一个数",
    "english": "Entropy, Cross-Entropy & KL Divergence",
    "module": 0,
    "minutes": 5,
    "topicIds": [
      "information-theory"
    ],
    "summary": "熵描述真实分布本身的不确定性，交叉熵评价用预测分布编码真实结果的代价，KL 衡量其中多付出的部分。",
    "prerequisites": [
      "probability-likelihood"
    ],
    "sections": {
      "quick": [
        {
          "id": "numeric-uncertainty",
          "title": "目的：区分数据难度与模型犯错",
          "paragraphs": [
            "设一个二分类任务的真实分布是 [0.75,0.25]。即使模型完全知道这个分布，单次结果仍有不确定性；这部分属于数据。若模型预测 [0.5,0.5]，它还额外忽略了第一类更常出现的信息；这部分来自预测不匹配。",
            "使用自然对数计算，真实分布的熵约为 0.5623，均匀预测的交叉熵约为 0.6931，两者相差约 0.1308，这就是从真实分布到均匀预测的 KL 散度。三个数回答不同问题，因此不能只看到“loss 更小”就认为数据本身更确定。"
          ],
          "flow": [
            {
              "label": "明确真实分布",
              "detail": "教学例子 p=[0.75,0.25]"
            },
            {
              "label": "给出预测分布",
              "detail": "q=[0.5,0.5]"
            },
            {
              "label": "计算两种代价",
              "detail": "熵约 0.5623；交叉熵约 0.6931"
            },
            {
              "label": "比较多付部分",
              "detail": "KL 约 0.1308，来自分布不匹配"
            }
          ]
        },
        {
          "id": "units",
          "title": "一条罕见结果携带多少信息？",
          "paragraphs": [
            "某个结果被预测的概率越小，真的出现时越令人意外。用负对数刻画这种“意外程度”有一个好处：独立事件的概率相乘，对应信息量相加。概率 1/2 的结果用以 2 为底的对数计算是 1 bit；概率 1/4 是 2 bits。",
            "本章后续公式统一使用自然对数 ln，单位称为 nat。用哪种底只会整体改变尺度，不改变哪个模型更好；但比较数值时必须使用同一底。不能把 bits 与 nats 直接当作相同数值。"
          ],
          "checkpoint": {
            "question": "模型对真实类别给出概率 1 与概率 0.01 时，哪一种负对数损失更大？",
            "answer": "0.01 的更大：自然对数下损失约 4.605；概率 1 的损失为 0。自信地排除真实类别会受到很大惩罚。"
          }
        }
      ],
      "deep": [
        {
          "id": "entropy-formula",
          "title": "熵：对真实结果的意外程度取平均",
          "paragraphs": [
            "把类别总数命名为 C，把真实分布命名为 p，其中 pᵢ 是第 i 类的概率。每类的意外程度是其概率的负对数；再按照这类真正出现的概率加权平均，就是熵，记为 H(p)。",
            "若类别完全确定，例如 [1,0]，熵为 0；若 C 个类别完全均匀，熵达到 ln C。这些结论针对固定的有限类别集合。零概率项按连续极限记为 0，不应直接在代码里计算 0×ln 0。"
          ],
          "formula": "H(p)=-\\sum_{i=1}^{C}p_i\\ln p_i",
          "formulaReading": "“分布 p 的熵”是：遍历所有类别 i，把该类概率 p 下标 i 乘以它的自然对数，全部相加，最后取负号。等价于按真实概率平均每类的负对数信息量。",
          "notation": [
            {
              "symbol": "p,p_i",
              "meaning": "真实类别概率分布及第 i 类的概率",
              "shape": "C",
              "example": "[0.75,0.25]"
            },
            {
              "symbol": "H(p)",
              "meaning": "分布的熵",
              "shape": "标量",
              "example": "约 0.5623 nats"
            },
            {
              "symbol": "C,i",
              "meaning": "C 是类别总数；i 是类别编号，下标选择对应类别"
            },
            {
              "symbol": "\\sum_{i=1}^{C}",
              "meaning": "从第 1 类加到第 C 类的求和"
            },
            {
              "symbol": "\\ln",
              "meaning": "自然对数；本章统一以自然常数 e 为底"
            },
            {
              "symbol": "-,\\ p_i\\ln p_i",
              "meaning": "前方负号将和取反；中间并列表示标量相乘"
            }
          ]
        },
        {
          "id": "cross-entropy-kl",
          "title": "交叉熵与 KL：把编码规则换成模型的预测",
          "paragraphs": [
            "现在令 q 表示模型预测分布，而 p 仍表示真实分布。交叉熵 H(p,q) 按 p 决定出现频率，却用 q 计算意外程度。KL 散度记为 DKL(p∥q)，它是交叉熵减去真实熵之后的额外代价。",
            "当真实概率大于零的类别被模型赋为零概率，交叉熵和这方向的 KL 会发散到正无穷。KL 不对称：交换 p、q 通常改变数值；它也不满足一般距离的全部性质，所以应叫散度而不是欧氏距离。"
          ],
          "formula": "H(p,q)=-\\sum_{i=1}^{C}p_i\\ln q_i,\\qquad D_{\\mathrm{KL}}(p\\|q)=\\sum_{i=1}^{C}p_i\\ln\\frac{p_i}{q_i}=H(p,q)-H(p)",
          "formulaReading": "交叉熵按真实概率 p 加权，但对预测概率 q 取对数。KL 是每一类 p 乘以“p 除以 q 的自然对数”后求和；它也等于交叉熵减去真实分布的熵。",
          "notation": [
            {
              "symbol": "p_i,q_i",
              "meaning": "分别为第 i 类的真实概率与预测概率",
              "example": "第一类分别为 0.75 与 0.5"
            },
            {
              "symbol": "p,q,C",
              "meaning": "两个 C 类概率向量，分别非负且各自总和为 1"
            },
            {
              "symbol": "H(p,q),H(p)",
              "meaning": "交叉熵与真实熵，都是标量"
            },
            {
              "symbol": "D_{\\mathrm{KL}}(p\\|q)",
              "meaning": "从 p 到 q 的 KL 散度；KL 为名称下标，不是一个待求变量"
            },
            {
              "symbol": "\\|",
              "meaning": "KL 记号中的分隔符，用于指明两个分布及其顺序；这里不是范数"
            },
            {
              "symbol": "i,\\ \\sum_{i=1}^{C}",
              "meaning": "i 遍历所有类别，下标选择类别，∑ 将各类贡献相加"
            },
            {
              "symbol": "\\ln,\\ \\frac{p_i}{q_i}",
              "meaning": "分别为自然对数与除法；先算概率比，再取对数"
            },
            {
              "symbol": "-,\\ p_i\\ln q_i",
              "meaning": "− 表示相减或取负，并列的标量表示相乘"
            }
          ]
        },
        {
          "id": "one-hot",
          "title": "单个标签为什么变成“负对数正确类概率”？",
          "paragraphs": [
            "在一个带确定标签的训练样本中，我们可以用 one-hot 目标表示：正确类别的目标概率为 1，其余为 0。例如真实类别是三类中的第二类，目标就是 [0,1,0]。交叉熵的求和于是只留下第二类，预测概率 [0.1,0.7,0.2] 的损失为 −ln 0.7，约 0.3567。",
            "单个 one-hot 标签不是说整个数据分布没有噪声，而是当前样本的监督信号如此编码。对许多样本取平均，才在估计整体预测代价。软标签、标签平滑和蒸馏改变的是目标分布，应说明来源，而不是仍把它们当作“一个绝对正确的类”。"
          ]
        },
        {
          "id": "logits-stability",
          "title": "先从分数得到概率，再考虑数值稳定",
          "paragraphs": [
            "模型常先输出未归一化分数，称为 logits。令第 i 类分数为 zᵢ，正确类索引为 y，则该样本交叉熵可以写成“所有分数指数和的自然对数，减去正确类分数”。它与先 Softmax 再取负对数等价，但能更稳定地实现。",
            "直接对 1000 这样的分数取指数会溢出。可以先减去最大分数 m，使最大的指数项变成 1，再把 m 加回。所有分数同时加同一个常数时，预测概率和交叉熵不应改变，这是很实用的实现检查。"
          ],
          "formula": "L=\\ln\\!\\left(\\sum_{i=1}^{C}e^{z_i}\\right)-z_y=m+\\ln\\!\\left(\\sum_{i=1}^{C}e^{z_i-m}\\right)-z_y,\\qquad m=\\max_i z_i",
          "formulaReading": "损失等于所有 logits 的指数相加后取自然对数，再减去正确类别的 logit。稳定写法先找最大分数 m，在每个指数内部减去 m，完成对数后再加回 m。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "一个样本的分类交叉熵损失",
              "shape": "标量"
            },
            {
              "symbol": "z,z_i,z_y",
              "meaning": "z 是 C 类未归一化分数向量；两个下标分别取第 i 类与正确类别 y 的分数"
            },
            {
              "symbol": "y",
              "meaning": "正确类别的索引；这里是整数，不是概率",
              "example": "第二类对应 y=2（数学从1计数）"
            },
            {
              "symbol": "C,i",
              "meaning": "类别数与遍历类别的索引"
            },
            {
              "symbol": "e,e^a",
              "meaning": "e是自然对数的底，约2.718；a代表任意实数指数，e的a次幂是指数函数"
            },
            {
              "symbol": "\\ln,\\ \\sum_{i=1}^{C}",
              "meaning": "自然对数与遍历类别求和"
            },
            {
              "symbol": "m,\\ \\max_i",
              "meaning": "m 是所有类别分数中的最大值，maxᵢ 表示遍历 i 取最大"
            },
            {
              "symbol": "-,\\ +",
              "meaning": "普通标量的减法与加法；减去再加回 m 保持结果不变"
            }
          ]
        }
      ],
      "implementation": [
        {
          "id": "entropy-code",
          "title": "标准 Python：同时核对三个量",
          "paragraphs": [
            "此例没有外部依赖。p 为真实概率，q 为预测概率；entropy、cross_entropy、divergence 分别实现熵、交叉熵与 KL。后半段使用稳定 logsumexp 检查 logits 加常数后损失保持不变。"
          ],
          "code": "import math\n\np = [0.75, 0.25]\nq = [0.5, 0.5]\nentropy = -sum(a * math.log(a) for a in p if a > 0)\ncross_entropy = -sum(a * math.log(b) for a, b in zip(p, q) if a > 0)\ndivergence = sum(a * math.log(a / b) for a, b in zip(p, q) if a > 0)\nassert abs(cross_entropy - entropy - divergence) < 1e-12\nassert divergence >= 0\n\ndef logsumexp(values):\n    maximum = max(values)\n    return maximum + math.log(sum(math.exp(v - maximum) for v in values))\n\ndef classification_loss(logits, target_index):\n    return logsumexp(logits) - logits[target_index]\n\nlogits = [1.0, 2.0, -1.0]\nloss = classification_loss(logits, 1)  # Python 第2类索引为1\nshifted_loss = classification_loss([v + 1000 for v in logits], 1)\nassert abs(loss - shifted_loss) < 1e-10\nprint(entropy, cross_entropy, divergence, loss)"
        },
        {
          "id": "loss-api",
          "title": "PyTorch 接口最容易传反的地方",
          "paragraphs": [
            "CrossEntropyLoss 的常见类别索引用法接收 logits，不要先做 Softmax；目标通常是 long 类型的类别索引。批量输入若为 B×C，则目标为 B，其中 B 是样本数、C 是类别数。对同一任务使用概率目标时，要核对它满足合法分布并与输入形状匹配。",
            "KLDivLoss 默认接收预测分布的对数作为 input、真实概率作为 target，因此对应的是“真实到预测”的 KL，而非“预测到真实”。其 batchmean 除以 batch 大小；mean 还会对其他元素维平均，数值尺度不同。比较论文公式与代码时，应逐项核对方向、对数域和 reduction。"
          ],
          "checkpoint": {
            "question": "已知 p 固定，最小化 H(p,q) 与最小化 DKL(p∥q) 是否选择相同 q？",
            "answer": "是，因为两者相差与 q 无关的常数 H(p)。若 p 也随参数变化，就不能直接丢掉这一项。"
          }
        }
      ]
    },
    "misconceptions": [
      "KL 的两个参数不能随意交换，零概率支持集也会影响是否有限。",
      "模型 logits 不是概率，CrossEntropyLoss 的常用输入正是 logits。",
      "one-hot 样本目标与真实数据的总体分布，是两个层面的概念。"
    ],
    "references": [
      {
        "title": "CrossEntropyLoss",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
        "reason": "核对 logits、类别索引或软目标以及 reduction 的具体约定。"
      },
      {
        "title": "KLDivLoss",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.KLDivLoss.html",
        "reason": "核对 input/target 的方向与 log_target、batchmean 等语义。"
      },
      {
        "title": "A Mathematical Theory of Communication",
        "author": "Claude E. Shannon · 1948",
        "url": "https://doi.org/10.1002/j.1538-7305.1948.tb01338.x",
        "reason": "阅读信息量与熵的原始理论背景。"
      }
    ]
  },
  {
    "id": "learning-paradigms-generalization",
    "title": "学习范式与泛化：模型学到的能否迁移到新数据",
    "english": "Learning Paradigms & Generalization",
    "module": 0,
    "minutes": 35,
    "summary": "从监督信号的来源出发，区分监督、自监督与无监督学习；用可计算的偏差—方差分解解释为什么训练集上的成功需要独立验证。",
    "topicIds": [
      "learning-paradigms",
      "bias-variance"
    ],
    "prerequisites": [
      "probability-likelihood",
      "tensors-linear-algebra"
    ],
    "sections": {
      "quick": [
        {
          "id": "purpose-target-source",
          "title": "先问目标从哪里来，再给学习方式命名",
          "paragraphs": [
            "本章解决两个不同的问题：训练时用什么信号纠正模型，以及训练后如何判断它能否处理没见过的数据。先看同一段录音：人工写出“你好”作为识别目标，是监督学习；遮住一段声学特征，让模型借助上下文恢复它，是自监督学习；只按录音相似性分组而没有指定正确转写，是无监督聚类。它们可以使用相同的神经网络结构。",
            "监督学习中的“标签”可以是类别、连续数值或整段文本。自监督学习把原始数据的一部分、变换结果或其他可自动构造的信息当作训练目标，所以“没有人工标注”并不等于“没有监督信号”。无监督学习是更宽的类别；在一些分类习惯中，自监督是其中的一类，本课程单列它以强调目标构造。",
            "举例：10秒录音的1000帧特征中隐藏100帧，恢复目标仍来自这份录音，但输入不能直接看见被预测答案。若答案经预处理泄漏回输入，恢复损失会很低，却未必学到可迁移的语音表示。"
          ],
          "flow": [
            {
              "label": "定义使用场景",
              "detail": "将来识别谁的语音、什么设备与语言？"
            },
            {
              "label": "构造训练目标",
              "detail": "人工标签、隐藏片段或结构约束。"
            },
            {
              "label": "隔离评估数据",
              "detail": "按说话人等独立单位划分，避免相邻片段泄漏。"
            },
            {
              "label": "训练并验证",
              "detail": "更新参数用训练集，选配置用验证集。"
            },
            {
              "label": "独立报告",
              "detail": "固定方案后在测试集上评估。"
            }
          ]
        },
        {
          "id": "prediction-spread-example",
          "title": "同一道题，换训练集为什么会得到不同答案",
          "paragraphs": [
            "把真实答案暂时固定为2。三个独立训练得到的模型分别预测1、2、3：平均预测是2，没有系统偏离，但预测有波动；平均平方误差为(1+0+1)/3，也就是2/3。另三个模型预测0、1、2：平均预测变成1，系统偏离的平方是1，围绕自身平均值的波动仍是2/3，总误差因此为5/3。",
            "这里的偏差指“平均预测离目标多远”，方差指“换训练数据后预测变化多大”。方差不是同一个模型对不同输入的输出差异。小样本与不稳定训练都可能让预测更敏感；限制模型可以降低敏感性，却也可能限制表达真实关系。",
            "以上是固定目标下的精确数值分解，不含测量噪声。现实标签即使输入相同也可能波动，例如同样的音频质量分数由不同人给出；这类无法仅由当前输入确定的变化需要另外计入。"
          ],
          "checkpoint": {
            "question": "模型在一个训练集上误差为0，是否说明偏差和方差都为0？",
            "answer": "不能。训练误差只描述它对这批已见样本的拟合；偏差和方差涉及固定输入上重复抽取训练集后的预测分布，需要额外实验或假设。"
          }
        }
      ],
      "deep": [
        {
          "id": "risk-average",
          "title": "经验风险与真正关心的新样本误差",
          "paragraphs": [
            "把模型全部可学习数值记作参数向量θ（读作theta）；模型接收输入x并输出预测fθ(x)。单个样本的损失ℓ（读作ell）衡量预测与目标y的差异。训练集共有N个样本，第i个输入、目标分别记作xᵢ和yᵢ。",
            "经验风险是训练样本损失的平均值。若三条样本的损失为0.1、0.2、0.6，经验风险为0.3。它能直接计算；总体风险则对未来样本来源取平均，通常不能直接精确求得，只能通过独立、具有代表性的样本估计。"
          ],
          "formula": "\\widehat R(\\theta)=\\frac{1}{N}\\sum_{i=1}^{N}\\ell(f_\\theta(x_i),y_i),\\qquad R(\\theta)=\\mathbb E_{(X,Y)\\sim P}\\!\\left[\\ell(f_\\theta(X),Y)\\right]",
          "formulaReading": "左式读作：参数theta的经验风险，等于把第1到第N个样本的损失相加，再除以样本数N。右式读作：参数theta的总体风险，等于输入和目标按照分布P产生时，预测损失的期望。两式相似，但一个对有限训练数据平均，一个对目标总体平均。",
          "notation": [
            {
              "symbol": "\\theta",
              "meaning": "模型参数向量；本节讨论风险时固定它",
              "shape": "参数个数维向量"
            },
            {
              "symbol": "x_i,y_i",
              "meaning": "第i个已观测输入与目标；下标i标识样本"
            },
            {
              "symbol": "N,i",
              "meaning": "N是训练样本数，i是从1到N的整数索引"
            },
            {
              "symbol": "f_\\theta(\\cdot)",
              "meaning": "由参数θ确定的预测函数；圆括号表示把输入交给函数"
            },
            {
              "symbol": "\\ell(\\widehat y,y)",
              "meaning": "预测值与真实目标之间的单样本损失；ŷ表示预测值"
            },
            {
              "symbol": "\\widehat R,R",
              "meaning": "带帽的R为有限数据上的经验风险；不带帽的R为总体风险"
            },
            {
              "symbol": "\\sum_{i=1}^{N}",
              "meaning": "求和操作：把每个样本对应的量依次相加"
            },
            {
              "symbol": "X,Y,P,\\sim",
              "meaning": "大写X、Y为随机输入与目标；P是其联合分布；∼表示按该分布产生"
            },
            {
              "symbol": "\\mathbb E[\\cdot]",
              "meaning": "期望操作，即按概率加权的平均；不是对每个样本等权的固定求和"
            }
          ]
        },
        {
          "id": "bias-variance-identity",
          "title": "先用有限次预测验证偏差—方差分解",
          "paragraphs": [
            "固定同一个输入，做R次独立训练，把第r次的预测记作fᵣ，真实的无噪声答案记作a，所有预测的平均值记作μ（读作mu）。这些预测是数值，不是模型的权重。下面的恒等式直接由展开平方得到，对任意一组有限预测都成立。",
            "关键一步是每个预测减去平均预测后，其偏差之和为0。因此把“预测减目标”拆成“预测减平均”加“平均减目标”，展开平方后的交叉项平均为0。这里使用除以R的总体式方差，才能与有限平均平方误差精确对应；用于无偏估计总体方差的R−1分母属于另一个问题。"
          ],
          "formula": "\\mu=\\frac{1}{R}\\sum_{r=1}^{R}f_r,\\qquad \\frac{1}{R}\\sum_{r=1}^{R}(f_r-a)^2=(\\mu-a)^2+\\frac{1}{R}\\sum_{r=1}^{R}(f_r-\\mu)^2",
          "formulaReading": "先把R次预测相加除以R，得到平均预测mu。随后，平均的“预测减目标”的平方，恰好等于“平均预测减目标”的平方，加上预测围绕平均值的平均平方波动。左边是误差，右边第一项是平方偏差，第二项是方差。",
          "notation": [
            {
              "symbol": "R,r",
              "meaning": "R是重复训练次数，r是第几次训练的索引；此处R不是上一节的风险函数"
            },
            {
              "symbol": "f_r",
              "meaning": "第r次训练出的模型，对同一个固定输入的标量预测"
            },
            {
              "symbol": "a",
              "meaning": "固定输入对应的无噪声真实目标",
              "example": "前例为2"
            },
            {
              "symbol": "\\mu",
              "meaning": "R次标量预测的算术平均",
              "shape": "标量"
            },
            {
              "symbol": "\\sum_{r=1}^{R}",
              "meaning": "从第1次训练到第R次训练逐项求和"
            },
            {
              "symbol": "(\\cdot)^2",
              "meaning": "括号内的标量乘以自身；用平方消除正负抵消"
            }
          ]
        },
        {
          "id": "noise-and-capacity",
          "title": "标签噪声、模型容量与分解的适用边界",
          "paragraphs": [
            "如果标签由可预测的真实函数再加一个条件均值为0的随机扰动生成，并且测试扰动与训练数据独立，那么平均测试平方误差还包含该扰动的方差。这被称为不可约误差，但它只相对于“当前输入信息和建模假设”而言：加入更有用的测量可能降低它。",
            "经典的简单图景是：模型太受限制时偏差高，模型过于灵活且数据不足时方差高。这个图景有用，却不是“参数越多测试误差必然先降后升”的定律。过参数化模型、优化方式、正则化、预训练和数据量会共同影响误差，有时会出现先升后降的双下降现象。",
            "平方误差的代数分解不能原样套到分类准确率、交叉熵或语音词错误率上。对于这些指标，仍可研究模型对数据抽样的敏感性，但需要各自合适的分析与实验。"
          ]
        },
        {
          "id": "splits-and-shift",
          "title": "划分单位决定你的结论回答什么问题",
          "paragraphs": [
            "若目标是识别新说话人，就应让同一说话人的录音只属于训练、验证或测试中的一个集合。把一段长录音切成相邻片段后随机打散，可能让近乎重复的声音同时进入训练与测试，得到过于乐观的结论。若研究同一说话人的未来录音，则时间顺序可能才是正确隔离单位。",
            "训练集用于拟合参数；验证集用于选择学习率、模型深度和停止时机；测试集用于在方案固定后做一次独立评估。均值方差标准化、词表构建和特征选择等会从数据估计信息的步骤，也必须按实验协议限制其拟合数据，不能悄悄看见测试目标。",
            "自监督预训练是否允许使用未标注测试输入，取决于明确的评估协议；不能只因为没有读取人工标签就宣称完全独立。部署分布若变成另一种口音、设备或噪声环境，原测试集的低误差也不自动保证可靠。"
          ],
          "bullets": [
            "记录划分单位、随机种子和数据来源，而不只记录“80/10/10”。",
            "报告多次运行或重采样的变化范围，尤其是小型测试集。",
            "比较模型时保持相同划分与指标；不要根据测试结果反复挑选方案。",
            "增强应保留任务需要的语义：改变声调可能破坏中文词义，不能盲目当作无害变换。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "repeat-fit-code",
          "title": "完整实验：重复抽样并逐项验证分解",
          "paragraphs": [
            "下面只用Python标准库，模拟固定输入下的回归：真实答案为2，每个训练标签加入标准差为1的高斯噪声；每次用8个标签的均值做预测，共训练400次。另构造一个把预测向0缩小的模型，观察波动变小与偏差增大如何同时发生。",
            "代码中的truth为真实答案，runs为重复次数，sample_size为每次训练的样本数，predictions为各次拟合结果。decompose函数使用有限次平均，因此恒等式会在浮点误差范围内精确成立；它不是声称400次模拟已等于无限次期望。"
          ],
          "code": "import random\nfrom statistics import mean\n\nrng = random.Random(7)\ntruth = 2.0\nruns = 400\nsample_size = 8\npredictions = []\nfor _ in range(runs):\n    training_labels = [\n        truth + rng.gauss(0.0, 1.0)\n        for _ in range(sample_size)\n    ]\n    predictions.append(mean(training_labels))\n\ndef decompose(values, target):\n    center = mean(values)\n    squared_bias = (center - target) ** 2\n    variance = mean((v - center) ** 2 for v in values)\n    mse = mean((v - target) ** 2 for v in values)\n    assert abs(mse - squared_bias - variance) < 1e-12\n    return center, squared_bias, variance, mse\n\nfor name, values in [\n    (\"sample mean\", predictions),\n    (\"shrink toward zero\", [0.75 * p for p in predictions]),\n]:\n    center, bias2, variance, mse = decompose(values, truth)\n    print(name, {\n        \"mean_prediction\": round(center, 4),\n        \"squared_bias\": round(bias2, 4),\n        \"variance\": round(variance, 4),\n        \"mse_without_test_noise\": round(mse, 4),\n    })\n\n# A fixed three-prediction example from the explanation.\n_, bias2, variance, mse = decompose([0.0, 1.0, 2.0], 2.0)\nassert abs(bias2 - 1.0) < 1e-12\nassert abs(variance - 2.0 / 3.0) < 1e-12\nassert abs(mse - 5.0 / 3.0) < 1e-12\n"
        },
        {
          "id": "evaluation-protocol",
          "title": "从模拟走向真实实验",
          "paragraphs": [
            "把每次训练的样本数由8改成32，样本均值估计通常会更稳定；固定随机种子只是让这次实验可以复现，不是让一次结果具有统计保证。将真实答案改成0后，再比较向0缩小的模型，便能看到“先验偏好是否符合任务”会改变结论。",
            "在真实语音任务中，先保存按说话人划分的清单，再拟合训练集统计量。对监督识别记录转写目标，对自监督任务记录遮挡规则和可见信息，对聚类任务记录最终评估如何对齐类别。仅写“用了Transformer”不能说明训练信号与实验是否合理。",
            "自监督预训练可以帮助下游少样本任务，但预训练目标更低并不必然让所有下游任务更好。需要用目标任务的独立验证集检查收益；若要从表示中读出说话人身份，就不能把所有说话人信息都当作应消除的噪声。"
          ],
          "checkpoint": {
            "question": "训练误差和验证误差都很高，是否应该立即增大正则化？",
            "answer": "不能直接这样做。先检查目标、预处理与实现是否正确，再判断模型是否欠拟合、训练是否不足或优化是否失败；增大正则化常会进一步限制拟合。若训练低而验证高，则检查泄漏、分布差异、数据量和模型不稳定性，再选择针对性措施。"
          }
        }
      ]
    },
    "misconceptions": [
      "自监督没有人工标签，但仍有由数据自动构造的目标和损失。",
      "偏差—方差分解针对重复训练后同一输入的预测；不是把单次训练损失拆成两个可直接读出的数。",
      "验证集参与选择方案，所以不能当作从未使用过的最终测试集。",
      "更多参数不必然降低泛化；结论取决于数据、训练算法、正则化与任务。"
    ],
    "references": [
      {
        "title": "CS229 Lecture Notes — Generalization, Model Selection, Self-supervised Learning",
        "author": "Andrew Ng; Tengyu Ma",
        "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
        "reason": "核对平方误差的偏差—方差分解、模型选择以及监督与自监督任务的基本定义。"
      },
      {
        "title": "Reconciling modern machine-learning practice and the classical bias–variance trade-off",
        "author": "Mikhail Belkin et al.",
        "url": "https://doi.org/10.1073/pnas.1903070116",
        "reason": "原始研究说明双下降现象，避免将经典误差曲线误读为所有深度模型的定律。"
      }
    ]
  },
  {
    "id": "linear-models",
    "title": "从线性打分到回归与分类",
    "english": "Linear Models & Perceptron",
    "module": 1,
    "minutes": 5,
    "topicIds": [
      "linear-models"
    ],
    "summary": "先用加权和产生分数，再根据预测任务选择输出含义、损失函数和更新规则。",
    "prerequisites": [
      "矩阵乘法",
      "导数",
      "概率"
    ],
    "sections": {
      "quick": [
        {
          "id": "purpose",
          "title": "同样的分数，可以回答不同问题",
          "paragraphs": [
            "本章要区分三个容易混淆的模型：线性回归预测连续数值，逻辑回归预测二元事件的概率，感知机只要求把两类分开。三者都可以从同一个线性打分开始，但输出的含义与训练方法不同。",
            "例如两个输入特征为 2 和 1，对应权重为 0.5 和 −1，偏置为 0.2；加权和就是 2×0.5+1×(−1)+0.2=0.2。线性回归直接输出 0.2；以零为阈值的感知机输出正类；逻辑回归把它转成约 0.5498 的正类概率。先确认任务，再选择模型。"
          ],
          "flow": [
            {
              "label": "输入特征",
              "detail": "统一量纲或按训练集统计量标准化。"
            },
            {
              "label": "线性打分",
              "detail": "特征乘权重，再加偏置。"
            },
            {
              "label": "解释输出",
              "detail": "连续值、类别或概率，对应不同学习目标。"
            }
          ]
        },
        {
          "id": "score",
          "title": "读懂一个线性打分式",
          "paragraphs": [
            "把单个样本写成列向量 x，包含 D 个特征；w 是同样长度的权重列向量，b 是标量偏置，z 是输出分数。下标 j 只表示第几个特征，不表示训练步数。",
            "转置把列向量 w 变成行向量；行乘列得到标量。例子中 D=2，wᵀx=0，最后加 b=0.2。偏置允许决策边界不经过原点。"
          ],
          "formula": "z=w^\\top x+b=\\sum_{j=1}^{D}w_jx_j+b",
          "formulaReading": "先把权重列向量转成行向量，与输入列向量相乘，再加偏置；等价地，从第一个特征到第 D 个特征，逐项乘权重并求和。",
          "notation": [
            {
              "symbol": "x",
              "meaning": "单个样本的输入特征列向量",
              "shape": "D × 1",
              "example": "[2, 1]ᵀ"
            },
            {
              "symbol": "w",
              "meaning": "可训练权重列向量",
              "shape": "D × 1",
              "example": "[0.5, −1]ᵀ"
            },
            {
              "symbol": "b",
              "meaning": "可训练偏置",
              "shape": "标量",
              "example": "0.2"
            },
            {
              "symbol": "z",
              "meaning": "线性分数",
              "shape": "标量",
              "example": "0.2"
            },
            {
              "symbol": "D",
              "meaning": "特征数量",
              "shape": "正整数",
              "example": "2"
            },
            {
              "symbol": "j; w_j; x_j",
              "meaning": "j 是特征索引，下标取第 j 个元素"
            },
            {
              "symbol": "\\top",
              "meaning": "转置：交换矩阵的行与列"
            },
            {
              "symbol": "\\sum_{j=1}^{D}",
              "meaning": "从 j=1 到 j=D 的求和；相邻符号 w_jx_j 表示乘法"
            }
          ],
          "checkpoint": {
            "question": "把所有特征乘以 100 而权重不变，概率解释会保持不变吗？",
            "answer": "不会。线性分数改变，逻辑回归的概率也会改变；应调整权重或使用一致的标准化。"
          }
        }
      ],
      "deep": [
        {
          "id": "regression",
          "title": "线性回归：误差的大小有意义",
          "paragraphs": [
            "若目标是连续数值，用平方误差会让大误差承担更高代价。令 N 为样本数，第 i 个预测为 ŷᵢ，目标为 yᵢ；帽子表示预测，不表示平均。",
            "两次预测误差为 1 和 3，平均平方损失若带 1/2 系数就是 (1²+3²)/(2×2)=2.5。1/2 不改变最优参数，只让求导时的系数更整洁。训练结果仍取决于特征是否足以描述目标。"
          ],
          "formula": "L=\\frac{1}{2N}\\sum_{i=1}^{N}(\\hat y_i-y_i)^2",
          "formulaReading": "对每个样本，把预测减去目标后平方；把所有平方误差加起来，再除以样本数的两倍。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "当前数据上的标量训练损失"
            },
            {
              "symbol": "N",
              "meaning": "样本数量",
              "shape": "正整数",
              "example": "2"
            },
            {
              "symbol": "i",
              "meaning": "样本索引"
            },
            {
              "symbol": "\\hat y_i",
              "meaning": "第 i 个样本的预测连续值；帽子表示预测"
            },
            {
              "symbol": "y_i",
              "meaning": "第 i 个样本的目标连续值"
            },
            {
              "symbol": "\\sum_{i=1}^{N}",
              "meaning": "遍历所有样本求和"
            },
            {
              "symbol": "(\\cdot)^2",
              "meaning": "括号内数值乘以自身"
            },
            {
              "symbol": "\\frac{1}{2N}",
              "meaning": "把总误差除以 2N，得到带一半系数的平均"
            }
          ]
        },
        {
          "id": "logistic",
          "title": "逻辑回归：拟合概率，而不是先硬分类",
          "paragraphs": [
            "二分类目标取 0 或 1。用 sigmoid 把实数分数 z 映射到概率 p，再使用负对数似然。目标为 1 时，预测概率 0.9 的损失约 0.105，预测概率 0.1 的损失约 2.303；自信但错误的预测会受到很大惩罚。",
            "对于前面的 z=0.2、目标 y=1，p≈0.5498，损失≈0.5981；损失对分数的导数为 p−y≈−0.4502。真实代码宜直接把未归一化分数交给 BCEWithLogitsLoss，避免先 sigmoid 后 log 的精度问题。"
          ],
          "formula": "p=\\sigma(z)=\\frac{1}{1+\\exp(-z)},\\qquad \\ell=-y\\log p-(1-y)\\log(1-p),\\qquad \\frac{\\partial\\ell}{\\partial z}=p-y",
          "formulaReading": "先计算 sigmoid：一除以一加上负分数的指数。接着按真实标签选择正类或负类的负对数概率。最后，损失对分数的变化率等于预测概率减真实标签。",
          "notation": [
            {
              "symbol": "z",
              "meaning": "单个样本的线性分数",
              "shape": "标量",
              "example": "0.2"
            },
            {
              "symbol": "p",
              "meaning": "预测正类的概率",
              "shape": "0 到 1",
              "example": "约 0.5498"
            },
            {
              "symbol": "\\sigma",
              "meaning": "sigmoid 函数的名称"
            },
            {
              "symbol": "\\exp",
              "meaning": "以自然常数 e 为底的指数函数"
            },
            {
              "symbol": "y",
              "meaning": "真实二元标签",
              "shape": "0 或 1"
            },
            {
              "symbol": "\\ell",
              "meaning": "单个样本的负对数似然损失"
            },
            {
              "symbol": "\\log",
              "meaning": "自然对数，损失单位为 nat"
            },
            {
              "symbol": "\\partial\\ell/\\partial z",
              "meaning": "保持其他量固定，损失随分数变化的局部变化率"
            },
            {
              "symbol": "1-y;1-p",
              "meaning": "分别是负类标签权重与负类概率"
            }
          ]
        },
        {
          "id": "perceptron",
          "title": "感知机：错误时把边界推向正确方向",
          "paragraphs": [
            "本节改用 −1 和 +1 表示两类，避免把目标 0 乘进更新后导致永远不动。若正类样本位于负分数一侧，就沿输入方向增加权重；负类被误判时，沿相反方向调整。边界上分数为零也执行更新。",
            "当样本可被一个超平面严格分开时，标准感知机有有限次错误的收敛性质。线性不可分的数据上可能不断来回移动，感知机也没有天然校准的概率输出。逻辑回归的概率形式并不会改变其线性决策边界。"
          ],
          "formula": "\\text{if }y(w^\\top x+b)\\le 0:\\quad w\\leftarrow w+\\eta yx,\\qquad b\\leftarrow b+\\eta y",
          "formulaReading": "若真实类别乘预测分数不大于零，说明分错或正好在边界上；把学习率乘类别再乘输入，加到权重上；偏置也沿类别方向移动。",
          "notation": [
            {
              "symbol": "x; w",
              "meaning": "输入与权重列向量",
              "shape": "D × 1"
            },
            {
              "symbol": "b",
              "meaning": "偏置",
              "shape": "标量"
            },
            {
              "symbol": "y",
              "meaning": "此处真实标签采用 −1 或 +1"
            },
            {
              "symbol": "\\eta",
              "meaning": "正的学习率，控制更新幅度",
              "shape": "标量",
              "example": "0.1"
            },
            {
              "symbol": "\\top",
              "meaning": "把权重转成行向量以计算内积"
            },
            {
              "symbol": "\\le",
              "meaning": "小于或等于"
            },
            {
              "symbol": "\\leftarrow",
              "meaning": "用右边计算结果替换左边变量"
            },
            {
              "symbol": "yx; \\eta yx",
              "meaning": "标量与向量逐元素相乘"
            }
          ]
        }
      ],
      "implementation": [
        {
          "id": "logistic-code",
          "title": "标准库实现一次完整的逻辑回归训练",
          "paragraphs": [
            "以下代码只用 Python 标准库，拟合四个一维样本。每轮先对全部样本累积梯度，再求平均更新；因此它是批量梯度下降，而不是每个样本立刻更新的随机梯度下降。",
            "w 是一维权重，b 是偏置，p 是概率，g_w 与 g_b 是这一轮的平均梯度。输出断言检查的是这四个训练样本，没有据此声称泛化性能。"
          ],
          "code": "import math\n\nxs = [-2.0, -1.0, 1.0, 2.0]\nys = [0.0, 0.0, 1.0, 1.0]\nw, b, lr = 0.0, 0.0, 0.2\nfor _ in range(200):\n    g_w = g_b = 0.0\n    for x, y in zip(xs, ys):\n        p = 1.0 / (1.0 + math.exp(-(w*x+b)))\n        g_w += (p-y)*x\n        g_b += p-y\n    w -= lr*g_w/len(xs)\n    b -= lr*g_b/len(xs)\nprobs = [1/(1+math.exp(-(w*x+b))) for x in xs]\nassert [int(p >= 0.5) for p in probs] == [0, 0, 1, 1]\nprint('weight, bias:', w, b)\nprint('probabilities:', probs)"
        },
        {
          "id": "limits",
          "title": "线性模型是可解释的起点，也需要验证集",
          "paragraphs": [
            "在线性模型中，特征变化如何影响分数可以直接算出；但相关性并不等于因果关系。两个高度相关的特征可能分担权重，让单个系数看起来很不稳定。",
            "划分训练与验证数据后，只在训练集计算特征均值、标准差及选择参数。若模型无法拟合训练数据，检查线性假设；若训练好而验证差，再考虑数据量、正则化与分布差异。用阈值改变精确率与召回率，也不等于改变了概率模型本身。"
          ],
          "checkpoint": {
            "question": "逻辑回归加入 sigmoid 后，能直接解决不添加新特征的 XOR 吗？",
            "answer": "不能。以概率 0.5 为阈值仍对应线性分数为零，其边界仍是一条直线；XOR 需要非线性特征或隐藏层。"
          }
        }
      ]
    },
    "misconceptions": [
      "逻辑回归虽然名称有“回归”，这里解决的是概率分类问题。",
      "感知机更新与对 sigmoid 交叉熵求梯度是两种不同规则。",
      "没有明确的特征尺度，不能直接按权重绝对值比较特征重要性。"
    ],
    "references": [
      {
        "title": "CS229 Lecture Notes",
        "author": "Andrew Ng / Tengyu Ma · Stanford",
        "url": "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
        "reason": "核对线性模型、概率建模和梯度优化的推导。"
      }
    ]
  },
  {
    "id": "mlp-activations",
    "title": "多层感知机：用非线性组成新的特征",
    "english": "MLP & Activation Functions",
    "module": 1,
    "minutes": 5,
    "topicIds": [
      "mlp-foundations",
      "activations",
      "model-mlp"
    ],
    "summary": "隐藏层先把输入重新表示，激活函数让多层线性变换获得新的表达能力；理解表达能力与可训练性的区别。",
    "prerequisites": [
      "线性模型",
      "链式法则"
    ],
    "sections": {
      "quick": [
        {
          "id": "xor",
          "title": "为什么需要隐藏层：从 XOR 开始",
          "paragraphs": [
            "本章回答：输入与目标不能用一条直线分开时，怎样让网络自己产生新特征？异或（XOR）的四个二元输入中，(0,0) 与 (1,1) 输出 0，(1,0) 与 (0,1) 输出 1；任何一条直线都无法完成这个划分。",
            "把两个输入分别记为x₁和x₂，下标表示输入位置。用两个隐藏单元分别计算 ReLU(x₁−x₂) 和 ReLU(x₂−x₁)，再把它们相加，四个点的输出恰好是 0、1、1、0。这里 ReLU 的意思是负数变零，非负数保持原值。这个手工构造展示表达能力，并不证明训练总能找到它。"
          ],
          "flow": [
            {
              "label": "线性组合",
              "detail": "一个单元检测第一个输入是否大于第二个，另一单元检测相反方向。"
            },
            {
              "label": "非线性截断",
              "detail": "ReLU 保留正差异。"
            },
            {
              "label": "组合隐藏特征",
              "detail": "两项相加，得到两个输入是否不同。"
            }
          ],
          "checkpoint": {
            "question": "删除两个 ReLU，只把两层线性变换连起来，能解决 XOR 吗？",
            "answer": "不能。线性或仿射变换的复合仍然是仿射变换；隐藏层宽度本身不带来非线性。"
          }
        },
        {
          "id": "shapes",
          "title": "先把层的形状读清楚",
          "paragraphs": [
            "采用一行一个样本的约定：输入矩阵 X 的形状为 B×D，B 是样本数，D 是输入特征数。第一层把每个样本变成 H 个隐藏特征，第二层输出 C 个数。隐藏层共享同一套权重，样本之间不会被矩阵乘法混在一起。",
            "例如 B=4、D=2、H=3、C=1，第一层有 2×3+3=9 个参数，第二层有 3×1+1=4 个参数，总共 13 个。批量从 4 增到 40，参数量不变，激活与运算量则增加。"
          ],
          "formula": "A=\\phi(XW_1+b_1),\\qquad \\hat Y=AW_2+b_2",
          "formulaReading": "输入乘第一层权重，加上沿样本维广播的偏置，再逐元素应用激活函数；得到的隐藏表示乘第二层权重并加偏置，产生预测。",
          "notation": [
            {
              "symbol": "X",
              "meaning": "按行排列的输入样本",
              "shape": "B × D"
            },
            {
              "symbol": "B,D,H,C",
              "meaning": "样本数、输入特征数、隐藏单元数、输出特征数"
            },
            {
              "symbol": "W_1;W_2",
              "meaning": "下标表示第几层的权重矩阵",
              "shape": "D × H；H × C"
            },
            {
              "symbol": "b_1;b_2",
              "meaning": "各层偏置，沿 B 个样本广播",
              "shape": "H；C"
            },
            {
              "symbol": "\\phi",
              "meaning": "逐元素应用的非线性激活函数"
            },
            {
              "symbol": "A",
              "meaning": "隐藏表示矩阵",
              "shape": "B × H"
            },
            {
              "symbol": "\\hat Y",
              "meaning": "预测矩阵；帽子表示预测",
              "shape": "B × C"
            },
            {
              "symbol": "XW_1;AW_2",
              "meaning": "矩阵乘法，不是逐元素相乘"
            }
          ]
        }
      ],
      "deep": [
        {
          "id": "smooth-and-piecewise",
          "title": "Sigmoid、Tanh 与 ReLU：局部斜率不同",
          "paragraphs": [
            "激活函数影响输出范围，也影响反向梯度。Sigmoid 把数映射到 0 与 1 之间，tanh 映射到 −1 与 1 之间；它们在输入绝对值很大时逐渐变平。ReLU 的正半轴斜率为 1，负半轴为 0。",
            "在输入为零时，sigmoid 输出 0.5、导数 0.25，tanh 输出 0、导数 1。ReLU 在零点不可导；框架可选择次梯度约定，PyTorch 取 0。不要把零点约定写成数学上唯一的导数。"
          ],
          "formula": "\\sigma(z)=\\frac{1}{1+e^{-z}},\\quad \\sigma'(z)=\\sigma(z)(1-\\sigma(z));\\qquad \\tanh'(z)=1-\\tanh^2(z)",
          "formulaReading": "sigmoid 是一除以一加负输入的指数；它的导数是输出乘一减输出。tanh 的导数是一减去 tanh 输出的平方。",
          "notation": [
            {
              "symbol": "z",
              "meaning": "某个单元激活前的标量输入"
            },
            {
              "symbol": "\\sigma",
              "meaning": "sigmoid 函数"
            },
            {
              "symbol": "e",
              "meaning": "自然对数的底，约 2.71828"
            },
            {
              "symbol": "e^{-z}",
              "meaning": "自然常数的负 z 次幂"
            },
            {
              "symbol": "\\tanh",
              "meaning": "双曲正切函数"
            },
            {
              "symbol": "f'(z)",
              "meaning": "f代表本节正在讨论的激活函数；函数后的撇号表示对标量输入z求一阶导数"
            },
            {
              "symbol": "\\tanh^2(z)",
              "meaning": "先计算 tanh(z)，再平方；不是对输入平方"
            }
          ]
        },
        {
          "id": "smooth-gates",
          "title": "GELU 与 SiLU：平滑地调节输入",
          "paragraphs": [
            "GELU 和 SiLU 都将原输入乘以一个平滑门。GELU 的门是标准正态分布的累积概率；SiLU 的门是 sigmoid。输入为零时两者输出为零，局部导数均为 0.5；负输入可以得到小的负输出。",
            "以下写的是精确 GELU。工程实现也常采用 tanh 近似，二者数值接近但不完全相同。激活选择还与初始化、归一化、硬件实现和训练设置有关，不存在脱离任务的绝对排名。"
          ],
          "formula": "\\operatorname{GELU}(z)=z\\Phi(z),\\quad \\operatorname{GELU}'(z)=\\Phi(z)+z\\varphi(z);\\qquad \\operatorname{SiLU}(z)=z\\sigma(z),\\quad \\operatorname{SiLU}'(z)=\\sigma(z)+z\\sigma(z)(1-\\sigma(z))",
          "formulaReading": "GELU 用输入乘标准正态累积概率，按乘积求导得到累积概率加输入乘密度。SiLU 用输入乘 sigmoid，求导时分别对输入与 sigmoid 求导后相加。",
          "notation": [
            {
              "symbol": "z",
              "meaning": "激活前的实数输入",
              "shape": "标量"
            },
            {
              "symbol": "\\Phi(z)",
              "meaning": "均值为0、方差为1的标准正态随机变量不超过z的概率，即累积分布函数"
            },
            {
              "symbol": "\\varphi(z)",
              "meaning": "标准正态分布在z处的概率密度，等于exp(−z²/2)/√(2π)；exp为指数，²为平方，√为非负平方根，π为圆周率，分数线为除法"
            },
            {
              "symbol": "\\sigma(z)",
              "meaning": "sigmoid 输出，等于 1/(1+exp(−z))"
            },
            {
              "symbol": "f'(z)",
              "meaning": "f代表本节正在讨论的激活函数；函数后的撇号表示对标量输入z求一阶导数"
            },
            {
              "symbol": "z\\Phi(z);z\\sigma(z)",
              "meaning": "标量乘法，输入乘门值"
            },
            {
              "symbol": "GELU;SiLU",
              "meaning": "两个激活函数名称，均不是额外的可学习参数"
            }
          ]
        },
        {
          "id": "approximation",
          "title": "通用近似定理承诺了什么？",
          "paragraphs": [
            "经典通用近似结果说明：满足条件的非线性激活，加上足够宽的隐藏层，可以在有界闭合输入区域上把连续函数逼近到任意指定精度。这里说的是某组参数存在，不是随机初始化后必然训练得到。",
            "定理也不保证所需宽度小、有限数据足够、域外预测可靠，或优化过程容易。深度常能以较少单元表达某些组合结构，但也引入训练问题。先检查模型能否表达目标，再检查优化能否找到它，最后用未见数据评价泛化。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "xor-code",
          "title": "用标准库验证隐藏层与激活导数",
          "paragraphs": [
            "下面直接执行手工构造的两单元 XOR 网络，并用中心差分核对五种激活的导数。中心差分用输入两侧的函数值估计斜率；ReLU 测试避开零点，因为那里不存在唯一导数。"
          ],
          "code": "import math\n\ndef sigmoid(z):\n    return 1/(1+math.exp(-z))\ndef relu(z):\n    return max(0.0, z)\ndef cdf(z):\n    return 0.5*(1+math.erf(z/math.sqrt(2)))\ndef density(z):\n    return math.exp(-z*z/2)/math.sqrt(2*math.pi)\n\nfor (x1, x2), target in zip([(0,0),(1,0),(0,1),(1,1)], [0,1,1,0]):\n    prediction = relu(x1-x2) + relu(x2-x1)\n    assert prediction == target\n\npairs = [\n    (sigmoid, lambda z: sigmoid(z)*(1-sigmoid(z))),\n    (math.tanh, lambda z: 1-math.tanh(z)**2),\n    (relu, lambda z: float(z > 0)),\n    (lambda z: z*cdf(z), lambda z: cdf(z)+z*density(z)),\n    (lambda z: z*sigmoid(z), lambda z: sigmoid(z)+z*sigmoid(z)*(1-sigmoid(z))),\n]\nfor fn, derivative in pairs:\n    z, eps = 0.7, 1e-5\n    numerical = (fn(z+eps)-fn(z-eps))/(2*eps)\n    assert abs(numerical-derivative(z)) < 1e-8\nprint('XOR and five activation derivatives verified')"
        },
        {
          "id": "practice",
          "title": "从手工网络走向可训练 MLP",
          "paragraphs": [
            "用 PyTorch 创建两层网络时，nn.Linear(D,H) 的权重存储为 H×D，内部使用转置；这与本章数学中的 D×H 权重约定不同，但计算可以等价。用于分类的最后一层通常输出未归一化分数，交叉熵内部处理所需的归一化。",
            "在训练 XOR 前，先固定手工权重核对输出；再随机初始化并训练，比较不同随机种子是否收敛。把“能表达”与“训练成功”分成两个实验。代码中的 erf 是误差函数，math.erf 提供它，借此计算精确正态累积概率。"
          ],
          "checkpoint": {
            "question": "训练集上 XOR 全部正确，是否已经验证通用近似定理？",
            "answer": "没有。这里只检查了四个离散点上的一种构造；通用近似讨论函数族在整个指定区域上的逼近能力。"
          }
        }
      ]
    },
    "misconceptions": [
      "多层但没有非线性的网络，仍可合并为一个仿射变换。",
      "GELU 的精确形式与 tanh 近似应标明区别。",
      "通用近似是存在性结论，不是优化成功或泛化成功的保证。"
    ],
    "references": [
      {
        "title": "Approximation by superpositions of a sigmoidal function",
        "author": "George Cybenko · 1989",
        "url": "https://link.springer.com/article/10.1007/BF02551274",
        "reason": "核对经典单隐藏层通用近似定理的适用范围。"
      },
      {
        "title": "Gaussian Error Linear Units",
        "author": "Dan Hendrycks & Kevin Gimpel",
        "url": "https://arxiv.org/abs/1606.08415",
        "reason": "核对 GELU 定义、概率门与近似形式。"
      },
      {
        "title": "torch.nn",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/nn.html",
        "reason": "查阅 Linear 与各激活函数的接口和默认行为。"
      }
    ]
  },
  {
    "id": "optimizers",
    "title": "优化器：梯度怎样变成参数更新",
    "english": "SGD, Momentum, Adam & AdamW",
    "module": 1,
    "minutes": 5,
    "topicIds": [
      "optimizers"
    ],
    "summary": "梯度提供当前位置的局部斜率；优化器决定如何结合历史、尺度与权重衰减形成真正的更新。",
    "prerequisites": [
      "反向传播",
      "指数滑动平均"
    ],
    "sections": {
      "quick": [
        {
          "id": "purpose",
          "title": "同一个梯度，更新幅度未必相同",
          "paragraphs": [
            "考虑只有一个参数的损失：参数平方的一半。参数为 2 时，损失为 2，梯度也为 2。学习率取 0.1，普通梯度下降把参数变为 1.8；Adam 第一步在常用初始状态与极小稳定常数下，约把参数变为 1.9。",
            "这个差异来自更新规则，而不是谁算错了导数。本章让你区分梯度、优化器状态和参数更新，并能核对一个训练步。小型二次函数方便计算，但不能据此推断真实神经网络上哪种优化器最好。"
          ],
          "flow": [
            {
              "label": "求当前梯度",
              "detail": "先前向和反向，得到损失对参数的导数。"
            },
            {
              "label": "更新状态",
              "detail": "保存梯度方向的历史与平方尺度；SGD 可以没有状态。"
            },
            {
              "label": "形成参数步长",
              "detail": "结合学习率、状态与可选权重衰减。"
            },
            {
              "label": "重新计算",
              "detail": "在新参数处执行下一次前向，旧梯度不会自动更新。"
            }
          ]
        },
        {
          "id": "mini-batch",
          "title": "SGD 中的随机性来自哪里？",
          "paragraphs": [
            "完整数据梯度需要遍历所有样本，代价可能很高。随机梯度下降通常用随机抽取的小批量估计整体梯度。批内先平均，再更新一次；抽样与平均方式决定估计是否合适。",
            "小批量梯度可能指向与完整梯度不同的方向，因此单步训练损失不一定下降。batch 大小、学习率和更新次数有关联，改变 batch 后只比较 epoch 数可能不公平。学习率为零时，优化器可能仍更新内部状态，但参数通常不会按梯度移动。"
          ],
          "checkpoint": {
            "question": "两次训练得到相同梯度，参数更新一定相同吗？",
            "answer": "不一定。Momentum 与 Adam 的历史状态不同会产生不同更新；学习率、衰减系数也影响结果。"
          }
        }
      ],
      "deep": [
        {
          "id": "momentum",
          "title": "动量：累积方向，减少来回摇摆",
          "paragraphs": [
            "令训练步编号为 t，当前梯度 gₜ 是在更新前参数处计算的向量。动量缓冲 vₜ 保存此前方向：把旧缓冲乘保留系数 μ，再加当前梯度；随后沿这个合成方向更新。初始缓冲为零。",
            "按这里不额外衰减当前梯度（dampening，即阻尼系数为0） 的约定，参数初值 2、学习率 0.1、μ=0.9：第一步缓冲为 2，参数为 1.8；第二步梯度为 1.8，缓冲为 3.6，参数为 1.44。有的教材对当前梯度再乘 1−μ，学习率的等效尺度会不同。"
          ],
          "formula": "v_t=\\mu v_{t-1}+g_t,\\qquad \\theta_t=\\theta_{t-1}-\\eta v_t",
          "formulaReading": "新动量等于保留系数乘上一步动量，再加当前梯度；新参数等于旧参数减去学习率乘新动量。把 μ 设为零，就恢复普通 SGD 更新。",
          "notation": [
            {
              "symbol": "\\theta_t",
              "meaning": "第 t 次更新之后的参数向量",
              "shape": "与梯度形状相同"
            },
            {
              "symbol": "t; t-1",
              "meaning": "训练更新编号及前一次编号"
            },
            {
              "symbol": "g_t",
              "meaning": "在更新前参数 θ_(t−1) 处计算的梯度"
            },
            {
              "symbol": "v_t",
              "meaning": "动量缓冲；v_0=0"
            },
            {
              "symbol": "\\mu",
              "meaning": "旧方向保留比例",
              "shape": "通常 0≤μ<1",
              "example": "0.9"
            },
            {
              "symbol": "\\eta",
              "meaning": "当前步的正学习率",
              "shape": "标量",
              "example": "0.1"
            },
            {
              "symbol": "\\mu v_{t-1};\\eta v_t",
              "meaning": "标量乘向量，逐元素缩放"
            }
          ]
        },
        {
          "id": "adam",
          "title": "Adam：同时估计方向和平方尺度",
          "paragraphs": [
            "Adam 保留梯度的一阶指数平均 m，以及梯度平方的指数平均 v。后者不是“减去均值后的方差”，而是未中心化二阶矩。将方向除以平方尺度的平方根，可以让不同坐标拥有不同的有效步长。",
            "两个缓冲从零开始，早期会偏向零，因此除以一减保留系数的 t 次幂进行偏差修正。第一步若梯度为 2，β₁=0.9、β₂=0.999，则 m=0.2、v=0.004；修正后分别是 2 和 4，归一化方向约为 1。"
          ],
          "formula": "\\begin{aligned}m_t&=\\beta_1m_{t-1}+(1-\\beta_1)g_t\\\\v_t&=\\beta_2v_{t-1}+(1-\\beta_2)g_t^2\\\\\\hat m_t&=m_t/(1-\\beta_1^t),\\quad\\hat v_t=v_t/(1-\\beta_2^t)\\\\\\theta_t&=\\theta_{t-1}-\\eta\\,\\hat m_t/(\\sqrt{\\hat v_t}+\\varepsilon)\\end{aligned}",
          "formulaReading": "分别更新梯度与梯度平方的滑动平均；用保留系数的幂修正零初始化偏差；将修正后的方向除以修正平方尺度的平方根加稳定常数，最后乘学习率并从参数中减去。",
          "notation": [
            {
              "symbol": "t; t-1",
              "meaning": "从 1 开始的更新编号及其前一次"
            },
            {
              "symbol": "g_t;g_t^2",
              "meaning": "当前梯度及逐元素平方",
              "shape": "参数形状"
            },
            {
              "symbol": "m_t;v_t",
              "meaning": "一阶平均与未中心化二阶平均；m_0=v_0=0"
            },
            {
              "symbol": "\\beta_1;\\beta_2",
              "meaning": "两种平均的保留系数",
              "shape": "0 到 1 之间"
            },
            {
              "symbol": "\\beta_1^t;\\beta_2^t",
              "meaning": "系数的 t 次幂，上标此处表示幂"
            },
            {
              "symbol": "\\hat m_t;\\hat v_t",
              "meaning": "偏差修正后的平均；帽子标记修正量"
            },
            {
              "symbol": "\\theta_t",
              "meaning": "更新后的参数"
            },
            {
              "symbol": "\\eta",
              "meaning": "学习率"
            },
            {
              "symbol": "\\varepsilon",
              "meaning": "防止分母为零的正稳定常数",
              "shape": "标量",
              "example": "常见值 10⁻⁸"
            },
            {
              "symbol": "\\sqrt{\\hat v_t}",
              "meaning": "对每个坐标的二阶平均开平方"
            },
            {
              "symbol": "/",
              "meaning": "这里的除法是逐元素相除，不是矩阵求逆"
            }
          ]
        },
        {
          "id": "adamw",
          "title": "AdamW：把收缩参数与归一化梯度分开",
          "paragraphs": [
            "给损失加入参数平方惩罚，会在梯度中加入与参数成正比的一项。若把这项也送进 Adam，它会进入一阶、二阶平均并受到坐标尺度影响；这通常不等于单独按固定比例缩小参数。",
            "AdamW 将衰减直接施加到参数，然后使用由数据损失梯度生成的 Adam 更新。参数 2、学习率 0.1、衰减系数 0.01 时，先缩到 1.998；再减去约 0.1 的 Adam 步，得到约 1.898。是否衰减偏置和归一化参数，是需要明确记录的训练选择。"
          ],
          "formula": "\\theta_t=(1-\\eta\\lambda)\\theta_{t-1}-\\eta\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\varepsilon}",
          "formulaReading": "先把旧参数乘一减学习率乘衰减系数，进行直接收缩；再减去由数据梯度得到的 Adam 自适应更新。",
          "notation": [
            {
              "symbol": "\\theta_{t-1};\\theta_t",
              "meaning": "更新前与更新后的参数向量"
            },
            {
              "symbol": "\\eta",
              "meaning": "学习率"
            },
            {
              "symbol": "\\lambda",
              "meaning": "解耦权重衰减系数",
              "shape": "非负标量",
              "example": "0.01"
            },
            {
              "symbol": "\\hat m_t;\\hat v_t",
              "meaning": "仅由数据损失梯度形成并经偏差修正的一阶、二阶平均"
            },
            {
              "symbol": "\\varepsilon",
              "meaning": "分母稳定常数"
            },
            {
              "symbol": "\\sqrt{\\hat v_t}",
              "meaning": "逐坐标开平方"
            },
            {
              "symbol": "1-\\eta\\lambda",
              "meaning": "当前一步的参数收缩因子"
            },
            {
              "symbol": "\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\varepsilon}",
              "meaning": "逐元素除法得到自适应更新方向"
            }
          ]
        }
      ],
      "implementation": [
        {
          "id": "optimizer-code",
          "title": "用标准库检查四种更新的第一步",
          "paragraphs": [
            "这段代码保存每种优化器的独立参数与状态；目标函数固定为参数平方的一半，梯度等于当前参数。Momentum 使用上一节明确的缓冲约定，AdamW 的衰减不会被加入梯度平均。"
          ],
          "code": "import math\n\ndef run(method, steps=30):\n    theta, momentum, m, v = 2.0, 0.0, 0.0, 0.0\n    lr, beta1, beta2, eps = 0.1, 0.9, 0.999, 1e-8\n    history = []\n    for t in range(1, steps+1):\n        g = theta\n        if method == 'sgd':\n            theta -= lr*g\n        elif method == 'momentum':\n            momentum = 0.9*momentum+g\n            theta -= lr*momentum\n        else:\n            m = beta1*m+(1-beta1)*g\n            v = beta2*v+(1-beta2)*g*g\n            m_hat, v_hat = m/(1-beta1**t), v/(1-beta2**t)\n            if method == 'adamw':\n                theta *= 1-lr*0.01\n            theta -= lr*m_hat/(math.sqrt(v_hat)+eps)\n        history.append(theta)\n    return history\n\nassert abs(run('sgd',1)[0]-1.8) < 1e-12\nassert abs(run('momentum',2)[1]-1.44) < 1e-12\nassert abs(run('adam',1)[0]-1.9) < 1e-8\nassert abs(run('adamw',1)[0]-1.898) < 1e-8\nfor method in ['sgd','momentum','adam','adamw']:\n    print(method, run(method)[-1])"
        },
        {
          "id": "state",
          "title": "恢复训练要恢复哪些东西？",
          "paragraphs": [
            "从 checkpoint 恢复时，只加载参数而不加载 Momentum 或 Adam 状态，下一步通常与连续训练不同。还应恢复调度器状态、必要的梯度缩放状态以及随机状态，并记录训练已经进行了多少次参数更新。",
            "排查训练时，区分梯度范数与实际更新范数。Adam 会重缩放梯度，两个量不必成比例。比较优化器时应给各自合理的学习率，并保持数据、计算预算与评价协议可比。"
          ],
          "checkpoint": {
            "question": "把 Adam 的 m、v 重新置零，但保留同一参数，是否只是清理缓存而不影响训练？",
            "answer": "不是。m、v 是决定下一步方向与尺度的优化状态；重置会改变后续轨迹。"
          }
        }
      ]
    },
    "misconceptions": [
      "Adam 的二阶缓冲是梯度平方的平均，不是中心化方差。",
      "在自适应优化器中，L2 损失惩罚一般不等同于解耦权重衰减。",
      "优化器没有保证非凸神经网络一定到达全局最优。"
    ],
    "references": [
      {
        "title": "Adam: A Method for Stochastic Optimization",
        "author": "Kingma & Ba",
        "url": "https://arxiv.org/abs/1412.6980",
        "reason": "核对矩估计与偏差修正。"
      },
      {
        "title": "Decoupled Weight Decay Regularization",
        "author": "Loshchilov & Hutter",
        "url": "https://arxiv.org/abs/1711.05101",
        "reason": "理解 AdamW 与 L2 惩罚为何不等价。"
      },
      {
        "title": "torch.optim",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/optim.html",
        "reason": "核对具体优化器约定与状态保存接口。"
      }
    ]
  },
  {
    "id": "learning-rate",
    "title": "学习率：每一步走多远，什么时候放慢",
    "english": "Learning Rate & Scheduling",
    "module": 1,
    "minutes": 5,
    "topicIds": [
      "learning-rate"
    ],
    "summary": "学习率控制局部更新幅度；调度器根据更新次数或验证信号调整它，必须明确计数单位与调用顺序。",
    "prerequisites": [
      "梯度下降",
      "优化器"
    ],
    "sections": {
      "quick": [
        {
          "id": "purpose",
          "title": "先观察一个会振荡的数",
          "paragraphs": [
            "最简单的目标是让参数靠近零，损失取参数平方的一半。参数从 2 开始，梯度也等于 2。学习率 0.1 得到 1.8；学习率 1.5 得到 −1，下一步又变成 0.5，虽然来回跨过零仍能收敛；学习率 2.1 则让绝对值逐步增大。",
            "所以“方向正确”不等于“更新安全”。本章先用这个可手算例子理解步长，再区分预先设定的调度和根据验证集反馈的调度。真实深层网络的安全步长会随参数、数据与优化状态改变。"
          ],
          "checkpoint": {
            "question": "参数在最优点两侧交替出现，能断定它发散吗？",
            "answer": "不能。还要看距离和损失是否缩小；例如这个二次函数使用学习率 1.5 时交替靠近零。"
          }
        },
        {
          "id": "schedule-flow",
          "title": "调度器调整学习率，不负责计算梯度",
          "paragraphs": [
            "Warmup 指在最初一段训练中逐渐增大学习率；衰减则在后段减小步长。它们可组合，但不是所有模型都需要同一种曲线。按 epoch 调整与按 optimizer step 调整，时间尺度差异很大。",
            "例如每轮有 1000 个 batch，累计 4 个 batch 才更新一次参数，那么每轮只有约 250 次优化器更新。若计划按更新步数调度，却每个微批都调用调度器，学习率会提前完成整个衰减。"
          ],
          "flow": [
            {
              "label": "读取当前学习率",
              "detail": "这是本次参数更新真正使用的步长。"
            },
            {
              "label": "反向与参数更新",
              "detail": "累计到规定批量后才调用优化器。"
            },
            {
              "label": "更新调度器",
              "detail": "为下一次参数更新准备学习率。"
            },
            {
              "label": "记录",
              "detail": "同时记录更新编号、学习率和验证指标。"
            }
          ]
        }
      ],
      "deep": [
        {
          "id": "stability",
          "title": "二次函数给出一个可计算的稳定区间",
          "paragraphs": [
            "令参数 θ 为标量，曲率 a 为正数，目标损失为 aθ²/2。其梯度是 aθ；一次普通梯度下降后，参数被乘以 1−ηa。这个乘数的绝对值小于 1，参数才逐步靠近零。",
            "因此这个特例要求 0<η<2/a。曲率从 1 增到 100 时，上界从 2 降到 0.02。这解释了为什么狭窄谷底方向更容易因步长过大而振荡；该一维结论不能直接替代对 Adam 或一般非凸网络的分析。"
          ],
          "formula": "L(\\theta)=\\frac{a}{2}\\theta^2,\\qquad \\theta_{t+1}=(1-\\eta a)\\theta_t,\\qquad |1-\\eta a|<1\\Longleftrightarrow 0<\\eta<\\frac{2}{a}",
          "formulaReading": "损失是曲率乘参数平方再除以二；每一步把参数乘一减学习率与曲率的积。这个乘数的绝对值小于一，等价于学习率严格在零和二除以曲率之间。",
          "notation": [
            {
              "symbol": "L",
              "meaning": "标量损失函数"
            },
            {
              "symbol": "\\theta;\\theta_t",
              "meaning": "参数；下标 t 表示第 t 步的参数值"
            },
            {
              "symbol": "a",
              "meaning": "二次函数的正曲率",
              "shape": "正标量"
            },
            {
              "symbol": "\\eta",
              "meaning": "学习率",
              "shape": "正标量"
            },
            {
              "symbol": "\\theta^2",
              "meaning": "参数的平方"
            },
            {
              "symbol": "|\\cdot|",
              "meaning": "绝对值，表示数与零的距离"
            },
            {
              "symbol": "\\Longleftrightarrow",
              "meaning": "两边条件在这个例子中等价"
            },
            {
              "symbol": "t+1",
              "meaning": "下一次参数更新后的编号"
            }
          ]
        },
        {
          "id": "warmup-cosine",
          "title": "把 Warmup 与余弦衰减写成明确的函数",
          "paragraphs": [
            "规定共有 T 次参数更新，最初 W 次线性 warmup。更新编号 t 从 1 开始：第 1 次用最大学习率的 1/W，第 W 次达到最大值；之后按半个余弦平滑下降，到第 T 次达到最小值。",
            "例如 T=20、W=4、最大学习率 0.1、最小学习率 0.01，前四步是 0.025、0.05、0.075、0.1，第 20 步是 0.01。这是本章明确选择的端点约定；不同库可能从零编号，调用时要看真实打印出的序列。"
          ],
          "formula": "\\eta_t=\\begin{cases}\\eta_{\\max}t/W,&1\\le t\\le W\\\\\\eta_{\\min}+\\frac{\\eta_{\\max}-\\eta_{\\min}}{2}\\left[1+\\cos\\!\\left(\\pi\\frac{t-W}{T-W}\\right)\\right],&W<t\\le T\\end{cases}",
          "formulaReading": "在 warmup 区间，用最大学习率乘当前步数除以 warmup 步数。之后先把训练进度换成零到 π 的角度，计算余弦并缩放到最大与最小学习率之间。",
          "notation": [
            {
              "symbol": "\\eta_t",
              "meaning": "第 t 次参数更新使用的学习率"
            },
            {
              "symbol": "t;T;W",
              "meaning": "当前更新编号、总更新次数、warmup 更新次数；0<W<T"
            },
            {
              "symbol": "\\eta_{\\max};\\eta_{\\min}",
              "meaning": "设定的最大与最小学习率；下标 max/min 表示端点"
            },
            {
              "symbol": "\\cos",
              "meaning": "余弦函数，输入单位为弧度"
            },
            {
              "symbol": "\\pi",
              "meaning": "圆周率，约 3.14159"
            },
            {
              "symbol": "(t-W)/(T-W)",
              "meaning": "warmup 结束后的归一化进度"
            },
            {
              "symbol": "\\begin{cases}\\cdot\\end{cases}",
              "meaning": "分段定义：按右边条件选择对应一行"
            },
            {
              "symbol": "\\le;<",
              "meaning": "分别为小于等于、严格小于"
            }
          ]
        },
        {
          "id": "plateau",
          "title": "验证平台期调度：反馈信号必须选对",
          "paragraphs": [
            "ReduceLROnPlateau 一类调度器不只看计数，而是追踪指定指标是否改善。监控验证损失时通常越低越好，监控准确率时通常越高越好。还需明确最小改善阈值、容忍多少次未改善，以及衰减后冷却期。",
            "例如每轮验证一次，耐心值为若干轮，就不应每个 batch 都重复喂同一个验证损失。短暂噪声不是永久平台；不恰当的阈值可能过早降速。验证集负责反馈，测试集应留到最终评估，避免按测试结果反复调参。"
          ]
        }
      ],
      "implementation": [
        {
          "id": "schedule-code",
          "title": "标准库生成并验证每一个端点",
          "paragraphs": [
            "代码先生成全部 20 次更新的学习率，再逐步优化一维二次函数。lr_at 的参数是更新编号，数组下标则从零开始；assert 明确检查 warmup 起点、峰值、结束点和衰减段单调性。"
          ],
          "code": "import math\n\ndef lr_at(t, total=20, warmup=4, peak=0.1, minimum=0.01):\n    assert 1 <= t <= total and 0 < warmup < total\n    if t <= warmup:\n        return peak*t/warmup\n    progress = (t-warmup)/(total-warmup)\n    return minimum+0.5*(peak-minimum)*(1+math.cos(math.pi*progress))\n\nrates = [lr_at(t) for t in range(1,21)]\nassert abs(rates[0]-0.025) < 1e-12\nassert abs(rates[3]-0.1) < 1e-12\nassert abs(rates[-1]-0.01) < 1e-12\nassert all(a >= b for a,b in zip(rates[3:],rates[4:]))\ntheta = 2.0\nfor t, lr in enumerate(rates, start=1):\n    gradient = theta\n    theta -= lr*gradient\n    print(t, round(lr,6), round(theta,6))\nassert abs(theta) < 2.0"
        },
        {
          "id": "pytorch-order",
          "title": "在 PyTorch 中对齐调度与真实更新",
          "paragraphs": [
            "多数按步调度器采用先 optimizer.step()，再 scheduler.step() 的顺序；开始训练前就调用 scheduler.step()，可能跳过学习率序列的第一个值。每轮调度的则在整轮完成后调用。ReduceLROnPlateau 要在得到新的验证指标后调用 scheduler.step(metric)。",
            "使用自动混合精度时，溢出可能使梯度缩放器跳过一次优化器更新。若目标是按“实际更新次数”调度，就要让学习率进度与成功更新一致，而不是盲目随每个 batch 前进。恢复训练应同时恢复优化器与调度器状态，并检查恢复前后的学习率。"
          ],
          "checkpoint": {
            "question": "累计 4 个微批才更新参数一次，却每个微批推进余弦调度，会发生什么？",
            "answer": "按参数更新计的调度会快约四倍；模型还没经历计划中的更新次数，学习率就已降到后期水平。"
          }
        }
      ]
    },
    "misconceptions": [
      "学习率调度的横轴应明确是 batch、参数更新次数还是 epoch。",
      "Warmup 不是消除所有不稳定性的保证。",
      "训练曲线更平滑不自动意味着最终验证性能更高。"
    ],
    "references": [
      {
        "title": "torch.optim — How to adjust learning rate",
        "author": "PyTorch",
        "url": "https://docs.pytorch.org/docs/stable/optim.html",
        "reason": "核对调度调用顺序与 ReduceLROnPlateau 的特殊输入。"
      },
      {
        "title": "SGDR: Stochastic Gradient Descent with Warm Restarts",
        "author": "Loshchilov & Hutter",
        "url": "https://arxiv.org/abs/1608.03983",
        "reason": "理解余弦衰减与重启机制；本章代码只实现单个无重启区间。"
      }
    ]
  },
  {
    "id": "initialization-gradients",
    "title": "初始化与梯度动力学",
    "english": "Initialization and Gradient Dynamics",
    "module": 1,
    "minutes": 30,
    "topicIds": [
      "initialization",
      "gradient-dynamics"
    ],
    "summary": "用方差账本解释Xavier、He初始化与梯度的连续乘积，理解信号为什么消失或爆炸。",
    "prerequisites": [
      "向量点积与方差",
      "链式法则",
      "激活函数"
    ],
    "sections": {
      "quick": [
        {
          "id": "init-purpose",
          "title": "先让信号走得动",
          "paragraphs": [
            "初始化的目的是给不同神经元不同的起点，并让信号在层间保持可用的数量级。它不承诺找到最优解，却能避免训练开始时全部饱和或衰减。",
            "考虑一个神经元有100个独立、均值为0、方差为1的输入。独立权重的方差取0.01时，100项乘积之和的输出方差约为1；权重方差取1时则约为100，容易把双曲正切激活推入饱和区。",
            "ReLU将负半边置零。对关于0对称的输入，它把二阶矩减半。因此保持ReLU后信号尺度时，常把权重方差设成2除以输入个数。"
          ],
          "flow": [
            {
              "label": "确认连接数",
              "detail": "检查输入数、输出数和激活类型。"
            },
            {
              "label": "抽取随机权重",
              "detail": "用合适尺度打破神经元的完全对称。"
            },
            {
              "label": "观察前向",
              "detail": "检查激活二阶矩和饱和比例。"
            },
            {
              "label": "观察反向",
              "detail": "检查各层梯度是否连续衰减或爆炸。"
            }
          ]
        },
        {
          "id": "init-symmetry",
          "title": "相同神经元为什么会一直相同",
          "paragraphs": [
            "如果两个隐藏神经元的输入权重、偏置和输出连接都完全相同，那么它们的输出相同，反向收到的梯度相同，更新后仍然相同。名义上有两个神经元，实际上可能一直只有一种重复特征。",
            "随机权重打破这种对称。偏置通常可以设成0，因为不同的权重已经让神经元接收不同信号。所有隐藏权重都设成0则会保留对称，还可能阻断早期层梯度。",
            "某些残差分支、最后一层或归一化增益有特殊的零初始化设计；这些设计依靠其他路径保持可学习性，不能推广成所有层都置零。"
          ],
          "checkpoint": {
            "question": "隐藏神经元的参数全部相同，训练会自动让它们学会不同特征吗？",
            "answer": "在相同输入和确定性更新下通常不会；相同参数产生相同梯度，更新仍相同。需要随机初始化或有意设计的非对称结构。"
          }
        }
      ],
      "deep": [
        {
          "id": "init-xavier",
          "title": "Xavier：输入与输出连接数的折中",
          "paragraphs": [
            "定义输入连接数为n_in，输出连接数为n_out，单个随机权重为w。输入与权重独立、各连接近似独立且权重均值为0时，输出方差近似为输入连接数乘权重方差再乘输入二阶矩；若输入均值也是0，该二阶矩就是输入方差。",
            "Xavier初始化折中前向与反向的尺度，适合线性变换和处于近线性区域的双曲正切激活。输入、输出各100维时，权重方差为0.01；用均匀分布实现，其区间约为负0.1732到正0.1732。"
          ],
          "formula": "\\operatorname{Var}(w)=\\frac{2}{n_{\\mathrm{in}}+n_{\\mathrm{out}}},\\qquad w\\sim\\mathcal U(-a,a),\\qquad a=\\sqrt{\\frac{6}{n_{\\mathrm{in}}+n_{\\mathrm{out}}}}",
          "notation": [
            {
              "symbol": "\\operatorname{Var}(w)",
              "meaning": "权重w的方差，即与其均值之差的平方的平均"
            },
            {
              "symbol": "w",
              "meaning": "一个初始化权重",
              "shape": "标量"
            },
            {
              "symbol": "n_{\\mathrm{in}},n_{\\mathrm{out}}",
              "meaning": "分别为输入和输出连接数；下标in和out标注方向"
            },
            {
              "symbol": "\\sim",
              "meaning": "服从右侧概率分布"
            },
            {
              "symbol": "\\mathcal U(-a,a)",
              "meaning": "在负a到正a之间的均匀分布"
            },
            {
              "symbol": "a",
              "meaning": "均匀分布区间的正半宽"
            },
            {
              "symbol": "\\sqrt{\\cdot}",
              "meaning": "取非负平方根"
            },
            {
              "symbol": "+,-",
              "meaning": "加法与取负号；分式横线表示除法"
            }
          ],
          "formulaReading": "把输入连接数和输出连接数相加，用2除以这个和得到权重方差。若用均匀分布，把6除以同一个和再开平方得到a，然后在负a到正a之间独立抽取各个权重。"
        },
        {
          "id": "init-he",
          "title": "He：补回ReLU截断的二阶矩",
          "paragraphs": [
            "定义激活前的值为z，ReLU输出为h，输入连接数为n，E表示期望，也就是按概率分布取平均。z关于0对称时，平方在正负两边贡献相同；ReLU删除负半边，所以输出二阶矩减半。",
            "二阶矩是平方的平均；方差还要减去均值的平方。ReLU输出均值通常大于0，因此不能说ReLU把方差精确减半。He初始化追踪的是二阶矩或相应的近似信号尺度。",
            "3×3卷积接收64个通道时，每个输出有576个输入连接，He正态初始化的标准差约为0.0589。输入连接数必须包括卷积核的空间位置。"
          ],
          "formula": "h=\\max(0,z),\\qquad \\mathbb E[h^2]=\\frac12\\mathbb E[z^2],\\qquad \\operatorname{Var}(w)=\\frac{2}{n}",
          "notation": [
            {
              "symbol": "h,z",
              "meaning": "分别为激活后与激活前的标量随机变量"
            },
            {
              "symbol": "\\max(0,z)",
              "meaning": "取0和z中较大的数"
            },
            {
              "symbol": "\\mathbb E[\\cdot]",
              "meaning": "对方括号内随机量求期望"
            },
            {
              "symbol": "h^2,z^2",
              "meaning": "h与z的平方；上标2表示平方"
            },
            {
              "symbol": "\\operatorname{Var}(w)",
              "meaning": "单个权重w的方差"
            },
            {
              "symbol": "n",
              "meaning": "一个输出接收的输入连接数"
            },
            {
              "symbol": "\\frac12",
              "meaning": "二分之一；与期望相邻表示乘法"
            }
          ],
          "formulaReading": "h等于0和z的较大者。在z关于0对称时，h平方的期望是z平方期望的一半。将每个权重的方差设置为2除以输入连接数n，补偿这一次减半。"
        },
        {
          "id": "init-chain",
          "title": "梯度是局部导数的连续乘积",
          "paragraphs": [
            "一条10层标量链，每层局部导数若都是0.5，总导数只有0.0009765625；若都是1.5，总导数约为57.67。每层温和的变化，连乘后也会非常极端。",
            "定义第l层输出为h_l，输入为上一层的h_(l-1)，局部导数为a_l，总层数为L。向量网络把标量导数换成雅可比矩阵，方向也会改变，因此仅看权重元素大小不能判断梯度是否稳定。",
            "饱和激活、矩阵乘积的方向拉伸和损失曲率各有影响。初始化、残差连接、归一化与学习率分别作用于不同环节，不能相互完全替代。",
            "把参数坐标看成横向位置、损失看成高度，就得到损失地形。谷底附近不同方向的曲率可能相差很大，形成狭长谷地；鞍点则在某些方向上升、另一些方向下降，梯度为零不一定表示局部最小值。高维网络的二维切片只展示选定方向，不能把它当成整个地形。"
          ],
          "formula": "a_l=\\frac{\\partial h_l}{\\partial h_{l-1}},\\qquad \\frac{\\partial h_L}{\\partial h_0}=\\prod_{l=1}^{L}a_l",
          "notation": [
            {
              "symbol": "h_l,h_{l-1}",
              "meaning": "第l层及其前一层的标量输出；下标是层编号"
            },
            {
              "symbol": "h_0,h_L",
              "meaning": "整条链的输入和最终输出"
            },
            {
              "symbol": "L",
              "meaning": "总层数，为正整数"
            },
            {
              "symbol": "a_l",
              "meaning": "第l层输出对其输入的局部导数"
            },
            {
              "symbol": "\\partial u/\\partial v",
              "meaning": "其他独立量不变时，u随v的微小变化率"
            },
            {
              "symbol": "\\prod_{l=1}^{L}",
              "meaning": "让l从1到L，把每个对应项依次相乘"
            }
          ],
          "formulaReading": "局部导数a_l等于第l层输出对上一层输出的偏导。最终输出对最初输入的偏导，等于从第一层到第L层的所有局部导数连乘。"
        }
      ],
      "implementation": [
        {
          "id": "init-code",
          "title": "标准库模拟信号尺度",
          "paragraphs": [
            "下面程序只依赖Python标准库。每次试验重新抽取输入与权重，验证初始化分布的统计推导，而不是预测某一个固定网络的精确表现。",
            "程序比较两种方差下ReLU后的二阶矩，并计算10层局部导数连乘。有限采样有波动，所以断言检查合理区间。"
          ],
          "code": "import math\nimport random\n\nrng = random.Random(7)\nfan_in = 100\ntrials = 6000\n\ndef second_moment(weight_variance):\n    squared = []\n    for _ in range(trials):\n        z = sum(rng.gauss(0, math.sqrt(weight_variance)) * rng.gauss(0, 1)\n                for _ in range(fan_in))\n        squared.append(max(0.0, z) ** 2)\n    return sum(squared) / len(squared)\n\nplain = second_moment(1 / fan_in)\nhe = second_moment(2 / fan_in)\nprint('ReLU second moments:', round(plain, 3), round(he, 3))\nprint('ten-layer derivatives:', 0.5 ** 10, 1.5 ** 10)\nassert 0.40 < plain < 0.60\nassert 0.80 < he < 1.20\nassert math.isclose(0.5 ** 10, 0.0009765625)\n"
        },
        {
          "id": "init-diagnostics",
          "title": "从推导到训练前检查",
          "paragraphs": [
            "用固定小批次跑一次前向和反向，逐层记录激活均值、标准差、零值比例、梯度范数以及更新量相对于参数大小的比例。前向正常但早期层梯度很小时，应沿反向路径检查，不能只把全局学习率加大。",
            "PyTorch线性层权重存为“输出特征数×输入特征数”。这与某些教材的右乘权重约定相反。若自行转置权重，应重新核对初始化函数对输入、输出连接数的解释。",
            "固定种子有利于复现，但一个种子不代表平均表现。比较初始化时保持数据、优化器与预算一致，再用多个种子观察稳定性。"
          ]
        }
      ]
    },
    "misconceptions": [
      "ReLU把对称输入的二阶矩减半，不等于把所有输入分布的方差精确减半。",
      "偏置设为0通常可行；所有隐藏权重都相同则可能保留对称。",
      "初始化控制起点的尺度，不保证训练期间一直稳定。"
    ],
    "references": [
      {
        "title": "Understanding the difficulty of training deep feedforward neural networks",
        "author": "Xavier Glorot、Yoshua Bengio",
        "url": "https://proceedings.mlr.press/v9/glorot10a.html",
        "reason": "Xavier初始化及前向、反向方差折中的原始论文。"
      },
      {
        "title": "Delving Deep into Rectifiers",
        "author": "Kaiming He 等",
        "url": "https://arxiv.org/abs/1502.01852",
        "reason": "ReLU网络信号传播与He初始化的原始推导。"
      }
    ]
  },
  {
    "id": "normalization",
    "title": "BN、LN与RMSNorm",
    "english": "Batch, Layer and RMS Normalization",
    "module": 1,
    "minutes": 32,
    "topicIds": [
      "normalization"
    ],
    "summary": "用同一张2×2表看懂归一化轴，再区分批归一化、层归一化与均方根归一化的统计量和训练行为。",
    "prerequisites": [
      "均值、方差与张量轴",
      "多层感知机"
    ],
    "sections": {
      "quick": [
        {
          "id": "norm-purpose",
          "title": "同一张表，沿不同方向标准化",
          "paragraphs": [
            "归一化的目的，是让中间特征的尺度更可控，从而改善优化过程。最先要回答的是“哪些数放在同一组”，而不是先背公式。本章比较批归一化（Batch Normalization，简称BN）、层归一化（Layer Normalization，简称LN）和均方根归一化（Root Mean Square Normalization，简称RMSNorm）。",
            "把两条样本写成两行：[1,3]与[5,7]。对每一列跨样本计算均值，得到3和5；忽略微小稳定常数，标准化后两行是[-1,-1]与[1,1]。对每一行内部计算均值，则得到2和6，标准化后的两行都是[-1,1]。前者体现批归一化，后者体现层归一化。",
            "再看向量[1,3]：平方的平均是5，均方根约为2.236。直接除以均方根得到[0.447,1.342]，平均值仍大于0。这体现RMSNorm不减均值的差别。"
          ],
          "flow": [
            {
              "label": "确定统计组",
              "detail": "先指定批次、位置、通道或特征中的哪些轴一起统计。"
            },
            {
              "label": "计算统计量",
              "detail": "BN与LN计算均值、方差；RMSNorm计算平方平均。"
            },
            {
              "label": "稳定缩放",
              "detail": "在分母加入小的正数，防止零方差或零均方根。"
            },
            {
              "label": "可学习恢复",
              "detail": "用增益，必要时再用偏移，让模型选择合适尺度。"
            }
          ]
        },
        {
          "id": "norm-axes",
          "title": "先认张量轴，再选归一化",
          "paragraphs": [
            "序列常写成“批大小×序列长度×特征宽度”。对最后一维做LayerNorm时，每个样本的每个位置独立统计自己的特征，不混合其他位置或其他样本。",
            "图像常写成“批大小×通道×高度×宽度”。BatchNorm2d对每个通道分别统计，参与统计的是批次、高度和宽度三个轴；它的增益与偏移每个通道各一份。",
            "同样叫LayerNorm，也可以配置多个末尾维度一起归一化。不要只凭层名判断行为，要查看normalized_shape与输入布局。小批量时BN统计噪声可能很大，而LN不需要跨样本统计。"
          ],
          "checkpoint": {
            "question": "输入形状为4×10×64，对最后一维做LayerNorm，一共有多少个独立统计组？每组多少个数？",
            "answer": "有4乘10等于40组，每组64个特征。每个样本、每个位置独立计算均值和方差，组之间不共享这些即时统计量。"
          }
        }
      ],
      "deep": [
        {
          "id": "norm-standard",
          "title": "均值、方差、标准化与仿射变换",
          "paragraphs": [
            "把一组需要共同统计的数编号为1到m，定义第i个数为x_i，组均值为mu，组内方差为v，稳定常数为epsilon。先减均值，再除以方差加稳定常数的平方根，最后用可学习增益gamma_i和偏移beta_i恢复表达自由度。",
            "对[1,3]，均值为2，用组内总体方差的定义得到方差1。增益全为2、偏移全为0.5时，忽略稳定常数，标准化后的[-1,1]变为[-1.5,2.5]。所以归一化层输出不必始终保持零均值和单位方差。",
            "增益与偏移的共享方式取决于模块：BN通常每通道一组参数；LN通常对所归一化的特征位置提供参数。下面的下标只表示相应元素使用的那份参数。"
          ],
          "formula": "\\mu=\\frac1m\\sum_{j=1}^{m}x_j,\\quad v=\\frac1m\\sum_{j=1}^{m}(x_j-\\mu)^2,\\quad y_i=\\gamma_i\\frac{x_i-\\mu}{\\sqrt{v+\\epsilon}}+\\beta_i",
          "notation": [
            {
              "symbol": "m",
              "meaning": "统计组中元素个数"
            },
            {
              "symbol": "x_i,x_j",
              "meaning": "组内第i或第j个输入标量；下标表示编号"
            },
            {
              "symbol": "\\mu",
              "meaning": "这一组的算术平均值"
            },
            {
              "symbol": "v",
              "meaning": "除以组大小m的组内方差"
            },
            {
              "symbol": "\\sum_{j=1}^{m}",
              "meaning": "让j从1到m，把对应项全部相加"
            },
            {
              "symbol": "(\\cdot)^2",
              "meaning": "把括号内的数平方"
            },
            {
              "symbol": "\\epsilon",
              "meaning": "加在方差内的小正数，用于数值稳定"
            },
            {
              "symbol": "\\sqrt{\\cdot}",
              "meaning": "取非负平方根"
            },
            {
              "symbol": "\\gamma_i,\\beta_i",
              "meaning": "第i个输出所用的可学习增益与偏移"
            },
            {
              "symbol": "y_i",
              "meaning": "第i个输出标量"
            },
            {
              "symbol": "+,-",
              "meaning": "相加、相减；相邻因子表示乘法，分式横线表示除法"
            }
          ],
          "formulaReading": "把组内全部输入相加再除以m得到均值mu。每个输入减去均值、平方，全部相加再除以m得到方差v。第i个输入减去均值后，除以方差加epsilon的平方根，再乘以对应增益并加上偏移，得到第i个输出。"
        },
        {
          "id": "norm-state",
          "title": "BN的训练统计与推理统计",
          "paragraphs": [
            "BN训练时使用当前统计组的均值和方差，同时更新运行均值与运行方差；默认推理时使用累积的运行统计量。因此同一个样本在训练模式下可能因同批其他样本改变而输出不同。LN与RMSNorm通常都在当前样本内部计算统计量，训练和推理采用同样的统计规则。",
            "PyTorch中BN前向标准化使用除以组大小的有偏方差估计；更新running_var时使用相应的无偏估计。这里“有偏”是统计估计术语，不代表实现有错误。统计组只有一个元素时，无偏方差无法按通常定义计算，训练中的BN还会受到有效组大小限制。",
            "BN的momentum是新统计量在运行平均中的权重，与优化器Momentum的速度累积不是同一含义。model.eval()切换BN的统计使用方式；torch.no_grad()只关闭梯度记录，不能替代eval。若明确设置track_running_stats=False，BN在推理时也继续使用当前批统计。"
          ]
        },
        {
          "id": "norm-rms",
          "title": "RMSNorm保留均值，只控制均方根",
          "paragraphs": [
            "定义一个长度为d的特征向量，第j个输入为x_j，第i个输出为y_i，可学习增益为gamma_i。RMSNorm把每个输入除以整个向量的均方根；常见形式不设偏移。",
            "向量[1,3]整体加上10会变成[11,13]。LN在忽略稳定常数与固定仿射参数时对这种统一平移保持不变；RMSNorm没有减均值，因此一般不会保持不变。这不是计算失误，而是它省去中心化后的性质。",
            "RMSNorm的输出平方平均在没有稳定常数、且增益为1时等于1。加入稳定常数后通常略小于1，学到不同增益后也不再等于1。"
          ],
          "formula": "r=\\sqrt{\\frac1d\\sum_{j=1}^{d}x_j^2+\\epsilon},\\qquad y_i=\\gamma_i\\frac{x_i}{r}",
          "notation": [
            {
              "symbol": "d",
              "meaning": "本次归一化的特征数量"
            },
            {
              "symbol": "x_j,x_i",
              "meaning": "第j或第i个输入特征；下标是特征编号"
            },
            {
              "symbol": "r",
              "meaning": "加入稳定常数后的均方根",
              "shape": "标量"
            },
            {
              "symbol": "\\sum_{j=1}^{d}",
              "meaning": "从第1到第d个特征求和"
            },
            {
              "symbol": "x_j^2",
              "meaning": "第j个输入的平方"
            },
            {
              "symbol": "\\epsilon",
              "meaning": "用于稳定分母的小正数"
            },
            {
              "symbol": "\\sqrt{\\cdot}",
              "meaning": "平方根"
            },
            {
              "symbol": "\\gamma_i",
              "meaning": "第i个特征的可学习增益"
            },
            {
              "symbol": "y_i",
              "meaning": "第i个输出特征"
            },
            {
              "symbol": "\\frac1d,\\frac{x_i}{r}",
              "meaning": "分别表示除以特征数d与除以均方根r"
            }
          ],
          "formulaReading": "把所有输入特征分别平方并相加，再除以特征数d，加上epsilon后开平方，得到r。每个输入除以同一个r，再乘自己的可学习增益，得到对应输出；整个过程没有减均值。"
        }
      ],
      "implementation": [
        {
          "id": "norm-code",
          "title": "手写两种轴与RMSNorm",
          "paragraphs": [
            "这段标准库代码直接使用二维列表。batch_norm_columns按列统计，layer_norm_rows按行统计；均方根函数不做中心化。所有仿射增益取1，偏移取0。",
            "程序使用0.00001作为稳定常数，所以标准化结果接近而不严格等于正负1。断言用容差比较，避免把稳定常数引起的小差异误判成错误。"
          ],
          "code": "import math\n\nrows = [[1.0, 3.0], [5.0, 7.0]]\neps = 1e-5\n\ndef normalize(values):\n    mean = sum(values) / len(values)\n    var = sum((v - mean) ** 2 for v in values) / len(values)\n    return [(v - mean) / math.sqrt(var + eps) for v in values]\n\ndef batch_norm_columns(matrix):\n    columns = [normalize(list(col)) for col in zip(*matrix)]\n    return [list(row) for row in zip(*columns)]\n\ndef layer_norm_rows(matrix):\n    return [normalize(row) for row in matrix]\n\ndef rms_norm(values):\n    scale = math.sqrt(sum(v * v for v in values) / len(values) + eps)\n    return [v / scale for v in values]\n\nbn = batch_norm_columns(rows)\nln = layer_norm_rows(rows)\nrms = rms_norm(rows[0])\nprint('BN:', bn, '\\nLN:', ln, '\\nRMS:', rms)\nassert math.isclose(bn[0][1], -1.0, abs_tol=1e-5)\nassert math.isclose(ln[0][1], 1.0, abs_tol=1e-5)\nassert math.isclose(sum(ln[0]), 0.0, abs_tol=1e-10)\nassert sum(rms) / len(rms) > 0.8\n"
        },
        {
          "id": "norm-debug",
          "title": "排查轴、状态与精度",
          "paragraphs": [
            "先用一个容易手算的小张量验证统计轴，再检查可学习增益和偏移的形状。输入是“批×时间×特征”时直接使用BatchNorm1d，可能把时间维误认成通道；通常需要先确认布局是否符合该层要求。",
            "保存和加载BN模型时，运行均值、运行方差也是模型状态的一部分。验证时调用eval，返回训练时再调用train；忘记切回会让后续训练继续使用旧的运行统计。",
            "低精度训练中，求和、平方与方差估计可能需要更高精度累积。不要自行把整个模型和所有统计量强制转换成半精度；优先使用框架支持的归一化实现，并通过有限值检查观察异常。"
          ]
        }
      ]
    },
    "misconceptions": [
      "归一化不是把所有数都限制在0到1之间。",
      "批归一化和层归一化的关键区别是统计量沿哪些轴计算。",
      "调用eval不会关闭梯度；它改变批归一化和Dropout等模块的行为。"
    ],
    "references": [
      {
        "title": "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift",
        "author": "Sergey Ioffe、Christian Szegedy",
        "url": "https://arxiv.org/abs/1502.03167",
        "reason": "批归一化的原始方法及训练、推理统计量设计。"
      },
      {
        "title": "Layer Normalization",
        "author": "Jimmy Lei Ba、Jamie Ryan Kiros、Geoffrey E. Hinton",
        "url": "https://arxiv.org/abs/1607.06450",
        "reason": "对单个样本的层内特征归一化，不依赖批统计量。"
      },
      {
        "title": "Root Mean Square Layer Normalization",
        "author": "Biao Zhang、Rico Sennrich",
        "url": "https://arxiv.org/abs/1910.07467",
        "reason": "只做均方根缩放而不减均值的RMSNorm原始论文。"
      }
    ]
  },
  {
    "id": "regularization-residual",
    "title": "正则化、Dropout与残差连接",
    "english": "Regularization, Dropout and Residual Connections",
    "module": 1,
    "minutes": 32,
    "topicIds": [
      "regularization",
      "residual-connections"
    ],
    "summary": "区分控制泛化与改善优化：手算L2惩罚、反向缩放Dropout和残差导数，理解它们各自解决什么问题。",
    "prerequisites": [
      "训练集与验证集",
      "期望与导数",
      "多层感知机"
    ],
    "sections": {
      "quick": [
        {
          "id": "reg-purpose",
          "title": "三个数字例子，三个不同作用",
          "paragraphs": [
            "正则化关注训练数据之外的表现；残差连接关注信息与梯度能否通过深层结构。把它们放在一起比较，是为了分清作用，而不是把所有技巧当成同一种“防过拟合按钮”。",
            "第一例：一个权重为2，L2惩罚强度为0.1，采用强度乘权重平方再除以2的约定，惩罚值为0.2，额外梯度为0.2，会把权重往0拉。",
            "第二例：输入激活为2，Dropout以一半概率保留。训练时保留就输出4，否则输出0，平均仍为2。第三例：残差分支只输出输入的0.1倍，输入2经过恒等捷径与分支相加得到2.2，对输入的导数是1.1。三个例子分别改变优化目标、随机训练过程和网络结构。"
          ],
          "flow": [
            {
              "label": "识别症状",
              "detail": "区分训练误差高、验证差距大与梯度传播困难。"
            },
            {
              "label": "选择手段",
              "detail": "正则惩罚或数据扰动控制拟合；残差路径改善结构。"
            },
            {
              "label": "保持对照",
              "detail": "一次只改变关键因素，保持数据划分与预算一致。"
            },
            {
              "label": "验证结果",
              "detail": "结合验证指标、训练曲线与梯度统计判断收益。"
            }
          ]
        },
        {
          "id": "reg-diagnosis",
          "title": "过拟合与优化失败不能混为一谈",
          "paragraphs": [
            "训练误差很低而验证误差明显更高，才提示模型可能记住训练样本特有的噪声。此时可以比较权重衰减、数据增强、Dropout、早停等方案，并检查数据泄漏与划分是否合理。",
            "若训练和验证误差都很高，可能是模型容量、特征、优化器或训练时间不足。此时加大惩罚或Dropout，往往会进一步压低可拟合能力。",
            "残差网络能让深模型更容易优化，但深模型仍可能过拟合。数据增强应保持任务标签含义，例如语音速度扰动需要保持转写内容，图像变换也不能随意改变标签语义。"
          ],
          "checkpoint": {
            "question": "训练损失一直很高，验证损失也高，首先把Dropout概率从0.1升到0.8是有针对性的处理吗？",
            "answer": "通常不是。先检查数据、模型表达与优化过程。更强Dropout减少每次训练可用的信息，可能使欠拟合更严重。"
          }
        }
      ],
      "deep": [
        {
          "id": "reg-l2",
          "title": "L2惩罚如何进入梯度",
          "paragraphs": [
            "定义模型全部待惩罚参数组成向量theta，共d个分量；原来的数据损失为L_data，惩罚强度为lambda，总目标为J。本节把平方惩罚系数写成lambda除以2，因此额外梯度恰好是lambda乘参数。不同资料可能把这个二分之一吸收进系数，比较数值前必须先核对约定。",
            "若theta只有一个分量2、lambda为0.1，则目标增加0.2，梯度增加0.2。对普通无动量梯度下降，这一步可改写成先按比例缩小参数再做数据梯度更新。",
            "Adam会把合入梯度的L2项一起送入一阶、二阶矩估计，通常不等于直接缩小参数。AdamW明确把权重衰减从自适应梯度中分离。是否对偏置、归一化参数施加衰减也是实现选择，应在实验中记录。"
          ],
          "formula": "J(\\theta)=L_{\\mathrm{data}}(\\theta)+\\frac{\\lambda}{2}\\|\\theta\\|_2^2,\\qquad \\|\\theta\\|_2^2=\\sum_{j=1}^{d}\\theta_j^2,\\qquad \\nabla_\\theta J=\\nabla_\\theta L_{\\mathrm{data}}+\\lambda\\theta",
          "notation": [
            {
              "symbol": "\\theta",
              "meaning": "待惩罚参数向量",
              "shape": "d维向量"
            },
            {
              "symbol": "d",
              "meaning": "参数向量的分量个数"
            },
            {
              "symbol": "\\theta_j",
              "meaning": "第j个参数分量；下标j是编号"
            },
            {
              "symbol": "J",
              "meaning": "加入惩罚后的总目标"
            },
            {
              "symbol": "L_{\\mathrm{data}}",
              "meaning": "原始数据损失；下标data只是名称"
            },
            {
              "symbol": "\\lambda",
              "meaning": "非负惩罚强度"
            },
            {
              "symbol": "\\|\\theta\\|_2",
              "meaning": "欧几里得范数，即所有参数平方和的平方根；下标2表示二范数"
            },
            {
              "symbol": "\\|\\theta\\|_2^2",
              "meaning": "二范数的平方，等于参数平方和"
            },
            {
              "symbol": "\\sum_{j=1}^{d}",
              "meaning": "从第1到第d个参数求和"
            },
            {
              "symbol": "\\nabla_\\theta",
              "meaning": "对全部参数求偏导并排成同形状向量的梯度算子"
            },
            {
              "symbol": "+",
              "meaning": "把数据损失与惩罚相加；相邻量表示乘法"
            }
          ],
          "formulaReading": "总目标等于数据损失，加上lambda的一半乘参数二范数的平方。二范数平方就是每个参数平方后求和。总目标的参数梯度等于数据损失梯度，再加lambda乘参数向量。"
        },
        {
          "id": "reg-dropout",
          "title": "反向缩放Dropout保持条件期望",
          "paragraphs": [
            "定义原激活为h，保留概率为q，随机掩码为r：它以概率q取1，以剩余概率取0。训练输出把掩码、激活相乘后除以q。这里把h固定住，只对随机掩码求平均。",
            "若h为2、q为0.5，输出一半时间为4，一半为0，平均为2。保持期望不等于保持每次预测，也不等于经过后续非线性后的最终输出期望完全不变。",
            "常见框架参数p表示丢弃概率，所以保留概率是1减p。采用本节的反向缩放约定时，推理阶段直接使用原激活，不再乘保留概率。随机性鼓励网络减少对某些固定单元组合的依赖，但过大的丢弃概率会损害拟合。"
          ],
          "formula": "r\\sim\\operatorname{Bernoulli}(q),\\qquad \\widetilde h=\\frac{rh}{q},\\qquad \\mathbb E_r[\\widetilde h\\mid h]=h",
          "notation": [
            {
              "symbol": "h",
              "meaning": "给定的原激活",
              "shape": "标量"
            },
            {
              "symbol": "q",
              "meaning": "保留概率，大于0且不大于1"
            },
            {
              "symbol": "r",
              "meaning": "随机掩码，只取0或1"
            },
            {
              "symbol": "\\sim",
              "meaning": "服从右侧分布"
            },
            {
              "symbol": "\\operatorname{Bernoulli}(q)",
              "meaning": "以概率q取1、以概率1减q取0的伯努利分布"
            },
            {
              "symbol": "\\widetilde h",
              "meaning": "训练阶段随机缩放后的激活；波浪号区分原激活"
            },
            {
              "symbol": "rh",
              "meaning": "掩码r与激活h相乘"
            },
            {
              "symbol": "\\mathbb E_r[\\widetilde h\\mid h]",
              "meaning": "固定h后，只对掩码r的随机性取期望；竖线表示给定h这个条件"
            }
          ],
          "formulaReading": "先从保留概率为q的伯努利分布抽取掩码r。训练输出是r乘h再除以q。固定原激活h，对所有可能掩码的输出求概率加权平均，结果仍为h。"
        },
        {
          "id": "reg-residual",
          "title": "恒等路径给导数增加了什么",
          "paragraphs": [
            "定义输入向量为x，残差分支计算为F，输出为y。输入和分支输出形状相同时可直接相加；例如输入形状是“批大小×64”，分支输出也必须是这个形状。",
            "定义J_F为分支输出对输入的雅可比矩阵，J_y为整个残差块的雅可比矩阵，I为单位矩阵。残差结构把单位矩阵加到了局部导数里，提供一条直接传播路径。标量例F(x)=0.1x的导数为0.1，所以块导数为1.1。",
            "这不保证梯度永不消失：分支雅可比可能在某些方向抵消恒等项，多个块的乘积也可能放大。若输入输出宽度不同，可用投影捷径匹配形状；此时捷径导数是投影矩阵，不能再直接写成单位矩阵。"
          ],
          "formula": "y=x+F(x),\\qquad J_F=\\frac{\\partial F}{\\partial x},\\qquad J_y=I+J_F",
          "notation": [
            {
              "symbol": "x",
              "meaning": "残差块输入",
              "shape": "d维向量"
            },
            {
              "symbol": "F(x)",
              "meaning": "残差分支对输入的变换",
              "shape": "d维向量"
            },
            {
              "symbol": "y",
              "meaning": "残差块输出",
              "shape": "d维向量"
            },
            {
              "symbol": "J_F",
              "meaning": "分支的雅可比矩阵，第i行第j列是第i个分支输出对第j个输入的偏导",
              "shape": "d×d矩阵"
            },
            {
              "symbol": "J_y",
              "meaning": "整个残差块输出对输入的雅可比矩阵",
              "shape": "d×d矩阵"
            },
            {
              "symbol": "\\partial F/\\partial x",
              "meaning": "对输入各分量分别求偏导并排成雅可比矩阵"
            },
            {
              "symbol": "I",
              "meaning": "主对角线上为1、其他位置为0的单位矩阵",
              "shape": "d×d矩阵"
            },
            {
              "symbol": "+",
              "meaning": "向量或矩阵对应位置相加"
            },
            {
              "symbol": "d",
              "meaning": "输入与输出向量的特征维度；两个分支必须具有相同维度才能直接相加"
            }
          ],
          "formulaReading": "残差块输出等于输入加分支输出。先对分支输出关于输入求偏导矩阵，得到J_F；整个块的偏导矩阵等于单位矩阵加上J_F。"
        }
      ],
      "implementation": [
        {
          "id": "reg-code",
          "title": "验证惩罚、随机均值和残差导数",
          "paragraphs": [
            "下面程序只依赖标准库，分别验证三种机制的数值结果。有限差分是把输入稍微向正负方向移动，比较函数值差异得到的近似导数；它可独立检查手算结果。",
            "Dropout均值来自两万次独立抽样，所以用合理容差断言。程序没有声称这样一个实验就能证明真实任务的泛化收益；那仍需固定验证集和多个实验对照。"
          ],
          "code": "import math\nimport random\n\nweight, strength = 2.0, 0.1\npenalty = strength * weight ** 2 / 2\npenalty_grad = strength * weight\nassert math.isclose(penalty, 0.2)\nassert math.isclose(penalty_grad, 0.2)\n\nrng = random.Random(11)\nactivation, keep = 2.0, 0.5\nsamples = [(activation / keep if rng.random() < keep else 0.0)\n           for _ in range(20000)]\nmean = sum(samples) / len(samples)\nassert abs(mean - activation) < 0.06\n\nresidual = lambda x: x + 0.1 * x\nstep = 1e-5\ngrad = (residual(2 + step) - residual(2 - step)) / (2 * step)\nassert math.isclose(residual(2), 2.2)\nassert math.isclose(grad, 1.1, abs_tol=1e-8)\nprint('penalty:', penalty, 'gradient:', penalty_grad)\nprint('dropout mean:', mean, 'residual derivative:', grad)\n"
        },
        {
          "id": "reg-validation",
          "title": "训练、验证和早停的边界",
          "paragraphs": [
            "训练时启用Dropout，验证与推理时使用eval关闭它；如果为了研究不确定性而故意在推理时启用Dropout，应把它视为另一种明确的预测流程，而不是默认行为。",
            "早停依据验证集指标选择训练步数；测试集只用于最终评估，不能每次训练都查看后继续调参。若反复尝试大量配置，同一个验证集也会逐渐受到选择偏差影响。",
            "残差相加前核对形状，不要让意外广播隐藏错误。记录正则强度、丢弃概率、哪些参数被衰减、残差分支结构与验证协议，才有可能复现实验结论。"
          ]
        }
      ]
    },
    "misconceptions": [
      "残差连接主要改善表达与优化路径，不等价于一种保证泛化的正则惩罚。",
      "Dropout训练时把保留值放大，推理时通常关闭，不是两次都乘保留概率。",
      "L2惩罚与解耦权重衰减只在特定更新规则下等价，不能对Adam直接互换。"
    ],
    "references": [
      {
        "title": "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
        "author": "Nitish Srivastava 等",
        "url": "https://jmlr.org/papers/v15/srivastava14a.html",
        "reason": "随机丢弃单元及其防止过拟合作用的原始论文。"
      },
      {
        "title": "Deep Residual Learning for Image Recognition",
        "author": "Kaiming He 等",
        "url": "https://arxiv.org/abs/1512.03385",
        "reason": "学习残差与恒等捷径的原始方法。"
      },
      {
        "title": "Decoupled Weight Decay Regularization",
        "author": "Ilya Loshchilov、Frank Hutter",
        "url": "https://arxiv.org/abs/1711.05101",
        "reason": "区分L2正则与自适应优化器中的解耦权重衰减。"
      }
    ]
  },
  {
    "id": "training-numerics",
    "title": "混合精度、梯度裁剪与累积",
    "english": "Mixed Precision, Gradient Clipping and Accumulation",
    "module": 1,
    "minutes": 35,
    "topicIds": [
      "training-numerics"
    ],
    "summary": "从梯度[3,4]与不等大小微批次出发，明确缩放、累积、反缩放、裁剪和参数更新的正确顺序。",
    "prerequisites": [
      "梯度与优化器",
      "均值、范数与浮点数"
    ],
    "sections": {
      "quick": [
        {
          "id": "num-purpose",
          "title": "省显存、稳定更新，先分清三件事",
          "paragraphs": [
            "混合精度主要减少某些运算与中间张量的成本；梯度累积把一次更新拆成多个较小前向与反向；梯度裁剪则限制一次梯度的整体长度。三者可以一起用，但不能随意交换顺序。",
            "一个梯度向量为[3,4]，欧几里得长度是5。若阈值是1，整体乘0.2得到[0.6,0.8]，方向不变而长度变成1。这不同于把每个分量分别截断到正负1。",
            "再看3条样本的梯度为-4、-16、-36，整体平均是-18.6667。把前两条当一个微批次、最后一条当另一个，两个微批次平均分别为-10与-36；再等权平均会得到-23，改变了目标。"
          ],
          "flow": [
            {
              "label": "按样本数分配损失",
              "detail": "每个微批次贡献除以当前完整累积组的总样本数。"
            },
            {
              "label": "缩放并累积反向",
              "detail": "整个累积组使用同一损失缩放系数，期间不清梯度。"
            },
            {
              "label": "反缩放再裁剪",
              "detail": "全部反向完成后先还原真实梯度，再限制其整体范数。"
            },
            {
              "label": "更新并清空",
              "detail": "执行一次优化器更新、更新缩放器，然后开始下一组。"
            }
          ]
        },
        {
          "id": "num-formats",
          "title": "FP16与BF16各自牺牲什么",
          "paragraphs": [
            "FP32通常指32位单精度浮点格式。FP16与BF16都用16位，但分配给指数和有效数字的位数不同：FP16的有效数字更多，指数范围较小；BF16保留与FP32相近的指数范围，但有效数字更少。",
            "FP16的最大有限正数是65504，较大的激活可能溢出，较小的梯度也可能下溢成0。BF16能表示更大的数量级，所以常不需要FP16式的梯度缩放，但它的舍入误差仍需关注；数值范围大不等于计算更精确。",
            "自动混合精度会按运算类型选择数据类型。通常保持模型参数为单精度，由autocast决定前向中适合降精度的运算。不要把损失缩放理解为修复所有溢出：若前向本身已经产生无穷，单靠缩放器未必能解决。"
          ],
          "checkpoint": {
            "question": "将损失放大1024倍后得到梯度[3072,4096]。要按真实阈值1裁剪，应该先做什么？",
            "answer": "先除以1024还原为[3,4]，再按整体长度5缩放到[0.6,0.8]。若直接裁剪缩放后的梯度，之后再反缩放，真实梯度会被额外压小1024倍。"
          }
        }
      ],
      "deep": [
        {
          "id": "num-scaling",
          "title": "损失缩放如何保护小梯度",
          "paragraphs": [
            "定义原损失为L，参数向量为theta，正缩放系数为s，真实梯度为g。对缩放损失求导会得到原梯度的s倍；在更新之前再除以s，就恢复原梯度。数学目标没有改变，变化的是中间数在有限精度中的可表示性。",
            "例如真实梯度是0.00000001，放大1024倍后约为0.00001024，更容易留在FP16可表示范围内。若在低精度中已经先舍入成0，再事后乘1024则无法恢复，因此缩放必须作用于反向传播的起点。",
            "动态缩放器检测梯度中的无穷或非数值，必要时跳过参数更新并调整缩放系数。一个累积组内不能中途改变系数，也不能中途反缩放后继续加上缩放梯度，否则会把不同单位的梯度混在一起。"
          ],
          "formula": "g=\\nabla_\\theta L,\\qquad g_{\\mathrm{scaled}}=\\nabla_\\theta(sL)=s\\,g,\\qquad g=\\frac{g_{\\mathrm{scaled}}}{s}",
          "notation": [
            {
              "symbol": "L",
              "meaning": "未缩放的标量损失"
            },
            {
              "symbol": "\\theta",
              "meaning": "模型参数向量",
              "shape": "P维向量"
            },
            {
              "symbol": "P",
              "meaning": "全部参数分量个数"
            },
            {
              "symbol": "s",
              "meaning": "正的损失缩放系数，不参与本次求导"
            },
            {
              "symbol": "g",
              "meaning": "真实参数梯度",
              "shape": "P维向量"
            },
            {
              "symbol": "g_{\\mathrm{scaled}}",
              "meaning": "缩放损失产生的梯度；下标scaled只表示已缩放",
              "shape": "P维向量"
            },
            {
              "symbol": "\\nabla_\\theta",
              "meaning": "对参数各分量求偏导并组成梯度向量"
            },
            {
              "symbol": "sL,\\ s\\,g",
              "meaning": "分别表示缩放系数乘损失、乘梯度；分式横线表示除法"
            }
          ],
          "formulaReading": "真实梯度是损失对参数的梯度。把损失乘以固定正数s后求梯度，结果等于真实梯度乘s；更新前再除以s，恢复原来的梯度。"
        },
        {
          "id": "num-clipping",
          "title": "整体范数裁剪保持方向",
          "paragraphs": [
            "定义把全部参数梯度按顺序拼接后的向量为g，总分量数为P，裁剪阈值为c，裁剪后梯度为g_tilde。下面给出理想数学定义：当梯度为零时保持为零，其他情况使用统一缩放比例。",
            "对[3,4]，范数是5。阈值1使缩放比例为0.2；阈值10使比例保持1。裁剪上限作用于全体参数的合成长度，不能逐层各裁到1后就认为总长度也不超过1。",
            "实现常在分母加入很小的正数以避免除零。裁剪限制的是传给优化器的梯度；带动量、Adam自适应缩放或权重衰减之后，实际参数更新量未必具有相同上限。"
          ],
          "formula": "\\|g\\|_2=\\sqrt{\\sum_{j=1}^{P}g_j^2},\\qquad \\widetilde g=\\begin{cases}g,&\\|g\\|_2\\le c\\\\ \\frac{c}{\\|g\\|_2}g,&\\|g\\|_2>c\\end{cases}",
          "notation": [
            {
              "symbol": "g",
              "meaning": "拼接全部参数后的梯度向量",
              "shape": "P维向量"
            },
            {
              "symbol": "P",
              "meaning": "梯度分量总数"
            },
            {
              "symbol": "g_j",
              "meaning": "梯度第j个分量；下标j为编号"
            },
            {
              "symbol": "\\|g\\|_2",
              "meaning": "梯度的二范数，即平方和的平方根"
            },
            {
              "symbol": "\\sum_{j=1}^{P}",
              "meaning": "从第1到第P个分量求和"
            },
            {
              "symbol": "g_j^2",
              "meaning": "第j个梯度分量的平方"
            },
            {
              "symbol": "\\sqrt{\\cdot}",
              "meaning": "非负平方根"
            },
            {
              "symbol": "c",
              "meaning": "正的整体范数阈值"
            },
            {
              "symbol": "\\widetilde g",
              "meaning": "裁剪后的梯度向量"
            },
            {
              "symbol": "\\le,\\ >",
              "meaning": "分别表示小于等于与大于；分段大括号表示按条件选择一个分支"
            }
          ],
          "formulaReading": "先把所有梯度分量平方后相加并开平方，得到整体二范数。若它不超过阈值c，保留原梯度；若超过，就把整个梯度乘以c除以其范数，缩短到阈值而保持方向。"
        },
        {
          "id": "num-accumulation",
          "title": "微批次大小不同也要保持同一个目标",
          "paragraphs": [
            "定义一次参数更新覆盖K个微批次，第k个微批次含n_k个样本，所有微批次合计N个样本，第k组第i条样本的损失为ell_(k,i)。目标是对N条样本等权平均，而不是对K个微批次等权平均。",
            "若各微批次大小都相等，可以把每个微批次的平均损失除以K再反向；若最后一批更小，应改为每批损失之和除以当前累积组的总样本数，或者按实际样本比例加权。尾部不足完整累积步数的组也应按它自己的总样本数归一化。",
            "等价于大批次还需要逐样本可分的损失、同一组内参数不更新且没有改变前向的批间依赖。训练模式的BN会使用各微批次统计，Dropout的随机抽样也可能不同，所以累积不保证逐位复现一次大批次前向。"
          ],
          "formula": "N=\\sum_{k=1}^{K}n_k,\\qquad L=\\frac1N\\sum_{k=1}^{K}\\sum_{i=1}^{n_k}\\ell_{k,i},\\qquad \\nabla_\\theta L=\\sum_{k=1}^{K}\\nabla_\\theta\\left(\\frac1N\\sum_{i=1}^{n_k}\\ell_{k,i}\\right)",
          "notation": [
            {
              "symbol": "K",
              "meaning": "一个更新组中的微批次数"
            },
            {
              "symbol": "k,i",
              "meaning": "微批次编号与该微批次内的样本编号"
            },
            {
              "symbol": "n_k",
              "meaning": "第k个微批次包含的样本数"
            },
            {
              "symbol": "N",
              "meaning": "这次更新覆盖的总样本数"
            },
            {
              "symbol": "\\ell_{k,i}",
              "meaning": "第k个微批次内第i个样本的标量损失；双下标定位样本"
            },
            {
              "symbol": "L",
              "meaning": "整个更新组的平均损失"
            },
            {
              "symbol": "\\theta",
              "meaning": "同一累积组内保持不变的模型参数"
            },
            {
              "symbol": "\\sum_{k=1}^{K},\\sum_{i=1}^{n_k}",
              "meaning": "分别对所有微批次求和、对该微批次内所有样本求和"
            },
            {
              "symbol": "\\nabla_\\theta",
              "meaning": "对参数向量求梯度"
            },
            {
              "symbol": "\\frac1N",
              "meaning": "每条样本统一除以本组总样本数N"
            }
          ],
          "formulaReading": "总样本数N是各微批次样本数之和。总损失把每批每条样本的损失全部相加，再除以N。梯度的线性性质允许逐个微批次计算“该批损失之和除以N”的梯度，再把这些梯度累加。"
        }
      ],
      "implementation": [
        {
          "id": "num-code",
          "title": "先用标准库验证累积权重与裁剪",
          "paragraphs": [
            "程序以单参数线性回归为例：预测值是权重乘输入，目标是输入的2倍，单样本损失为预测误差的平方。当前权重为0，所以三条样本梯度为-4、-16、-36。",
            "两批大小分别为2与1；正确累积和一次性平均完全相同。程序同时验证缩放后还原与整体范数裁剪。"
          ],
          "code": "import math\n\nmicrobatches = [[(1.0, 2.0), (2.0, 4.0)], [(3.0, 6.0)]]\nweight = 0.0\nsample_count = sum(len(batch) for batch in microbatches)\n\ndef sample_grad(x, y):\n    return 2 * (weight * x - y) * x\n\naccumulated = sum(sum(sample_grad(x, y) for x, y in batch) / sample_count\n                  for batch in microbatches)\nfull = sum(sample_grad(x, y) for batch in microbatches for x, y in batch) / sample_count\nwrong = sum(sum(sample_grad(x, y) for x, y in batch) / len(batch)\n            for batch in microbatches) / len(microbatches)\nassert math.isclose(accumulated, full)\nassert math.isclose(full, -56 / 3)\nassert math.isclose(wrong, -23)\n\nscale = 1024.0\nrestored = [value / scale for value in [3 * scale, 4 * scale]]\nnorm = math.sqrt(sum(value ** 2 for value in restored))\nthreshold = 1.0\nfactor = min(1.0, threshold / norm)\nclipped = [value * factor for value in restored]\nassert all(math.isclose(a, b) for a, b in zip(clipped, [0.6, 0.8]))\nprint('full / accumulated / wrong:', full, accumulated, wrong)\nprint('clipped gradient:', clipped)\n"
        },
        {
          "id": "num-pytorch",
          "title": "完整PyTorch例子：累积后反缩放再裁剪",
          "paragraphs": [
            "下面脚本需要安装PyTorch。它自动选择CUDA；没有CUDA时使用CPU单精度，因此可在普通电脑上运行完整流程。CUDA分支演示FP16自动混合精度，CPU分支用于验证更新顺序，并不声称验证了GPU数值行为。",
            "六个样本拆成三个微批次。每批先求损失总和再除以本组总样本数，所有反向完成后只反缩放一次，随后裁剪、更新参数、更新缩放器并清空梯度。示例只有一个完整累积组；扩展到数据加载器时需显式处理尾部组的实际样本总数。",
            "反向放在autocast上下文外；优化器只执行一次更新。若加入按更新计数的学习率调度器，还应让计数对应真正发生的参数更新，考虑缩放器因非有限梯度跳过更新的情况。"
          ],
          "code": "import torch\n\n# PyTorch 2.3+; CPU fallback does not require a CUDA device.\ntorch.manual_seed(3)\ndevice = 'cuda' if torch.cuda.is_available() else 'cpu'\nuse_amp = device == 'cuda'\nmodel = torch.nn.Linear(1, 1).to(device)\noptimizer = torch.optim.SGD(model.parameters(), lr=0.05)\nscaler = torch.amp.GradScaler('cuda', enabled=use_amp)\nx = torch.tensor([[-1.0], [-0.5], [0.0], [0.5], [1.0], [1.5]], device=device)\ny = 2 * x\nbatches = list(zip(x.split(2), y.split(2)))\nnum_samples = sum(batch_x.shape[0] for batch_x, _ in batches)\noptimizer.zero_grad(set_to_none=True)\n\nfor batch_x, batch_y in batches:\n    with torch.autocast(device_type=device, dtype=torch.float16 if use_amp else torch.bfloat16,\n                        enabled=use_amp):\n        prediction = model(batch_x)\n        loss = torch.nn.functional.mse_loss(prediction, batch_y, reduction='sum') / num_samples\n    scaler.scale(loss).backward()\n\nscaler.unscale_(optimizer)\noriginal_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\nassert torch.isfinite(original_norm).item()\nscaler.step(optimizer)\nscaler.update()\noptimizer.zero_grad(set_to_none=True)\nwith torch.no_grad():\n    final_loss = torch.nn.functional.mse_loss(model(x), y).item()\nprint('device:', device, 'gradient norm before clipping:', original_norm.item())\nprint('loss after one update:', final_loss)\n"
        }
      ]
    },
    "misconceptions": [
      "混合精度不是把模型、损失和全部统计量无差别改成半精度。",
      "缩放梯度尚未还原时直接裁剪，会把真实阈值也改变。",
      "微批次大小不相等时，把每个微批次平均损失再等权平均，通常不是全批次平均。"
    ],
    "references": [
      {
        "title": "Mixed Precision Training",
        "author": "Paulius Micikevicius 等",
        "url": "https://arxiv.org/abs/1710.03740",
        "reason": "半精度计算、单精度权重副本和损失缩放的原始训练方法。"
      },
      {
        "title": "Automatic Mixed Precision examples",
        "author": "PyTorch维护团队",
        "url": "https://docs.pytorch.org/docs/stable/notes/amp_examples.html",
        "reason": "核对autocast、GradScaler、反缩放、裁剪与梯度累积的官方调用顺序。"
      },
      {
        "title": "clip_grad_norm_",
        "author": "PyTorch维护团队",
        "url": "https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html",
        "reason": "核对跨参数整体梯度范数及原地裁剪的接口语义。"
      }
    ]
  }
];
