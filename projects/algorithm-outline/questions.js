export const questions = [
  {
    "id": "2009-42",
    "year": 2009,
    "number": 42,
    "title": "倒数第 k 个结点",
    "topics": [
      "linked"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2009/",
    "checked": "2026-10-15",
    "stem": "给定带头结点的单链表，定位倒数第 k 个有效结点，不得改动原链表。找到时输出 data 并返回 1，找不到返回 0。",
    "constraints": [
      "头结点不计入长度；k 为正整数。",
      "代码额外防御空头指针与 k≤0；link 是后继指针。"
    ],
    "brute": {
      "idea": "暴力基础解：第一趟统计长度 n，第二趟走到正数第 n−k+1 个结点。两趟都是顺序扫描。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "功能正确，但没有采用题目期望的单趟双指针方案；不据此承诺具体得分。",
      "code": "int kthTwoPass(const Node* head, int k) {\n    if (!head || k <= 0) return 0;\n    int n = 0;\n    for (const Node* p = head->link; p; p = p->link) ++n;\n    if (k > n) return 0;\n    const Node* p = head->link;\n    for (int i = 0; i < n - k; ++i) p = p->link;\n    printf(\"%d\\n\", p->data);\n    return 1;\n}"
    },
    "bottleneck": "两趟解先知道总长度才定位；双指针用固定间距替代长度统计。两者的渐近复杂度相同，优化点是遍历组织方式，并非从 O(n²) 降为 O(n)。",
    "optimized": {
      "idea": "快慢指针都从首元结点出发；快指针先走 k 步，再同时前进。快指针到空时，慢指针就是目标。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "单趟组织、无额外容器，不改变链表。",
      "code": "int kthTwoPointers(const Node* head, int k) {\n    if (!head || k <= 0) return 0;\n    const Node* fast = head->link;\n    const Node* slow = head->link;\n    // Move fast k positions ahead of slow.\n    for (int i = 0; i < k; ++i) {\n        if (!fast) return 0;\n        fast = fast->link;\n    }\n    while (fast) {\n        fast = fast->link;\n        slow = slow->link;\n    }\n    printf(\"%d\\n\", slow->data);\n    return 1;\n}"
    },
    "proof": "快指针领先 k 条后继边。同步前进不改变这个间距；当快指针位于尾结点之后，慢指针距尾后位置恰好 k 步，即倒数第 k 个结点。",
    "steps": [
      "自编示例：head → 10 → 20 → 30 → 40 → 50，k=2；fast=10，slow=10。",
      "快指针先走两步：fast=30，slow=10，保持两步间距。",
      "同步走一步：fast=40，slow=20。",
      "再次同步：fast=50，slow=30。",
      "fast=NULL，slow=40；输出 40，返回 1。"
    ],
    "cases": [
      [
        "空链表，k=1",
        "返回 0，不输出"
      ],
      [
        "10→20→30，k=1",
        "输出 30，返回 1"
      ],
      [
        "10→20→30，k=3",
        "输出 10，返回 1"
      ],
      [
        "10→20→30，k=4",
        "返回 0，不输出"
      ]
    ],
    "pitfalls": [
      "从 head->link 开始，不把头结点算成有效数据。",
      "快指针每次移动前检查空指针。",
      "不要把输出结点值误写成仅返回结点值；原题还要求成功标志。"
    ],
    "takeaway": "尾部相对位置 → 固定间距双指针。"
  },
  {
    "id": "2010-42",
    "year": 2010,
    "number": 42,
    "title": "数组循环左移",
    "topics": [
      "linear"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2010/",
    "checked": "2026-10-15",
    "stem": "把长度为 n 的数组循环左移 p 位，原来的前 p 个元素按原顺序放到末尾，要求时间和空间都尽量高效。",
    "constraints": [
      "原题 n>1，0<p<n。",
      "以下代码额外支持 p=0、p≥n；n≤0 或 p<0 时不处理。"
    ],
    "brute": {
      "idea": "暴力解：每轮暂存首元素，将其余元素左移一格，再把首元素放到末尾；共执行 p 轮。",
      "time": "O(np)，最坏 O(n²)",
      "space": "O(1)",
      "condition": "结果正确且原地，但重复搬移较多，不满足尽量高效的时间目标。",
      "code": "void rotateBrute(int a[], int n, int p) {\n    if (n <= 0 || p < 0) return;\n    p %= n;\n    for (int r = 0; r < p; ++r) {\n        int first = a[0];\n        for (int i = 1; i < n; ++i) a[i - 1] = a[i];\n        a[n - 1] = first;\n    }\n}"
    },
    "bottleneck": "逐格搬移让同一元素重复移动。把数组看成两段 A、B，目标只是 AB→BA，可以通过三次原地逆置完成。",
    "optimized": {
      "idea": "先逆置前 p 项，再逆置后 n−p 项，最后逆置整个数组。辅助函数采用闭区间 [left,right]。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "满足原地和线性时间目标，不分配辅助数组。",
      "code": "void reverseRange(int a[], int left, int right) {\n    while (left < right) {\n        int tmp = a[left];\n        a[left++] = a[right];\n        a[right--] = tmp;\n    }\n}\nvoid rotateReverse(int a[], int n, int p) {\n    if (n <= 0 || p < 0) return;\n    p %= n;\n    if (p == 0) return;\n    // Reverse each part, then reverse the entire array.\n    reverseRange(a, 0, p - 1);\n    reverseRange(a, p, n - 1);\n    reverseRange(a, 0, n - 1);\n}"
    },
    "proof": "两段分别逆置后得到 AᴿBᴿ；整体逆置使两段交换位置，并恢复各段内部次序，结果为 BA。三段处理长度总和为 2n，故时间为 O(n)。",
    "steps": [
      "自编示例：a=[1,2,3,4,5,6,7]，p=3；A=[1,2,3]，B=[4,5,6,7]。",
      "逆置 [0,2]：a=[3,2,1,4,5,6,7]。",
      "逆置 [3,6]：a=[3,2,1,7,6,5,4]。",
      "逆置 [0,6]：a=[4,5,6,7,1,2,3]，完成左移。"
    ],
    "cases": [
      [
        "[1,2,3,4]，p=1",
        "[2,3,4,1]"
      ],
      [
        "[1,2,3,4]，p=3",
        "[4,1,2,3]"
      ],
      [
        "[2,2,3,2]，p=2",
        "[3,2,2,2]"
      ],
      [
        "扩展：p=0 或 p=n",
        "数组不变"
      ]
    ],
    "pitfalls": [
      "左移和右移不要混淆。",
      "闭区间前段终点是 p−1，后段起点是 p。",
      "先检查 n>0，再做 p%n，防止除零。"
    ],
    "takeaway": "连续两段交换 → 三次逆置，线性时间、常数额外空间。"
  },
  {
    "id": "2011-42",
    "year": 2011,
    "number": 42,
    "title": "两个等长升序序列的中位数",
    "topics": [
      "linear",
      "search"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2011/",
    "checked": "2026-10-15",
    "stem": "两个长度都为 n 的升序序列合并后，共 2n 个元素。按本题定义，中位数是第 n 小的元素；求它时尽量节省时间和空间。",
    "constraints": [
      "n≥1；两个输入均已按非降序排列、长度相同。",
      "取下中位数，不求第 n 与第 n+1 项的平均；允许相等元素。"
    ],
    "brute": {
      "idea": "暴力基础解：用两个指针模拟归并，只选出前 n 个元素，不存整个合并数组。第 n 次选中的值就是答案。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "功能正确且空间高效，但仍逐个选取；可以利用有序性优化时间。",
      "code": "int medianMerge(const int a[], const int b[], int n) {\n    int i = 0, j = 0, value = 0;\n    for (int count = 0; count < n; ++count) {\n        if (j == n || (i < n && a[i] <= b[j])) value = a[i++];\n        else value = b[j++];\n    }\n    return value;\n}"
    },
    "bottleneck": "归并只需要边界比较，却要做 n 次。改为寻找一个分割位置，使左侧恰有 n 个元素且不大于右侧，可二分定位。",
    "optimized": {
      "idea": "二分 a 中分到左侧的元素个数 i，b 左侧取 j=n−i。若 a 左端最大值过大就减小 i；若 b 左端最大值过大就增大 i；否则返回左侧最大值。",
      "time": "O(log n)",
      "space": "O(1)",
      "condition": "等长有序序列的可行优化解；使用 long long 边界哨兵，输入数据类型为 int。",
      "code": "int medianPartition(const int a[], const int b[], int n) {\n    int low = 0, high = n;\n    while (low <= high) {\n        int i = low + (high - low) / 2;\n        // The left partitions must contain exactly n values.\n        int j = n - i;\n        long long al = i == 0 ? LLONG_MIN : a[i - 1];\n        long long ar = i == n ? LLONG_MAX : a[i];\n        long long bl = j == 0 ? LLONG_MIN : b[j - 1];\n        long long br = j == n ? LLONG_MAX : b[j];\n        if (al > br) high = i - 1;\n        else if (bl > ar) low = i + 1;\n        else return (int)(al > bl ? al : bl);\n    }\n    abort();  // Unreachable for valid sorted input.\n}"
    },
    "proof": "左侧元素数固定为 i+j=n。当 al≤br 且 bl≤ar 时，两数组各自的有序性保证左侧所有元素都≤右侧所有元素；左侧最大值正是第 n 小。交叉边界不满足时，调整方向唯一，每次缩小一半搜索区间。",
    "steps": [
      "自编示例：a=[1,3,8,9]，b=[2,4,5,6]，n=4；答案是第 4 小。",
      "low=0，high=4；i=2，j=2。左侧 a=[1,3]、b=[2,4]。",
      "边界 al=3，ar=8，bl=4，br=5；3≤5 且 4≤8，分割合法。",
      "返回 max(3,4)=4；不是 (4+5)/2。"
    ],
    "cases": [
      [
        "a=[1]，b=[2]",
        "1"
      ],
      [
        "a=[1,2]，b=[3,4]",
        "2"
      ],
      [
        "a=[1,3]，b=[1,3]",
        "1"
      ],
      [
        "a=[INT_MIN]，b=[INT_MAX]",
        "INT_MIN"
      ]
    ],
    "pitfalls": [
      "原题的中位数定义与统计学常见的偶数取平均不同。",
      "不要直接平均两个原序列的中位数。",
      "i=0/n、j=0/n 时不能访问越界元素。",
      "公开转载代码存在下标与复杂度笔误，本页给出独立验证的二分分割实现。"
    ],
    "takeaway": "第 k 小问题 → 让左半边恰好有 k 个元素，再验证交叉边界。"
  },
  {
    "id": "2012-42",
    "year": 2012,
    "number": 42,
    "title": "两链表的共同后缀",
    "topics": [
      "linked"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2012/",
    "checked": "2026-10-15",
    "stem": "两个带头结点的单链表存放单词，共同后缀可以共享同一串结点。找到第一个共享结点的地址；没有共享结点则返回空指针。",
    "constraints": [
      "输入为无环单链表，头结点不参与比较。",
      "共同后缀指共享存储，不是两段内容相同但地址不同的字符串。",
      "为复用数据结构，代码统一用 Node.link 表示原题 next；data 类型不影响算法，字符可存入 int。"
    ],
    "brute": {
      "idea": "暴力解：枚举第一条链表的每个有效结点，再扫描第二条链表判断是否存在相同地址；第一次命中就是共同后缀起点。",
      "time": "O(mn)，m、n 为两表有效长度",
      "space": "O(1)",
      "condition": "功能正确且不修改链表，但重复扫描，不符合尽可能高效的时间目标。",
      "code": "const Node* suffixBrute(const Node* h1, const Node* h2) {\n    if (!h1 || !h2) return NULL;\n    for (const Node* p = h1->link; p; p = p->link)\n        for (const Node* q = h2->link; q; q = q->link)\n            if (p == q) return p;\n    return NULL;\n}"
    },
    "bottleneck": "两条链表从共享结点开始的尾部完全重合。先消除长度差，使两个指针距表尾一样远，就不必反复比较每一对结点。",
    "optimized": {
      "idea": "分别计数 m、n；较长表先走长度差步，然后同步移动，直到地址相同。若无共同后缀，两指针最终同时到空。",
      "time": "O(m+n)",
      "space": "O(1)",
      "condition": "不改数据或连接，只需常数个计数器与指针。",
      "code": "const Node* suffixAligned(const Node* h1, const Node* h2) {\n    if (!h1 || !h2) return NULL;\n    int m = 0, n = 0;\n    for (const Node* p = h1->link; p; p = p->link) ++m;\n    for (const Node* q = h2->link; q; q = q->link) ++n;\n    const Node* p = h1->link;\n    const Node* q = h2->link;\n    // Align the two pointers by their remaining lengths.\n    while (m > n) { p = p->link; --m; }\n    while (n > m) { q = q->link; --n; }\n    while (p != q) {\n        p = p->link;\n        q = q->link;\n    }\n    return p;\n}"
    },
    "proof": "对齐后两指针剩余路径长度相同，之后同步移动保持该性质。共享尾段的每个位置距表尾长度唯一，因此必在首个共享结点相遇；不共享时一起到空。",
    "steps": [
      "自编示例：表一 a→b→c→S→T，表二 x→S→T；S、T 是同一批结点。",
      "长度分别为 5、3，表一先走 2 步；p=c，q=x。",
      "同时走一步，p 和 q 都指向 S；返回 S 的地址。",
      "若两个值同为 S 的结点地址不同，不能判定相交。"
    ],
    "cases": [
      [
        "长度 5、3，共享最后两结点",
        "返回共同尾段首结点"
      ],
      [
        "两表值相同但所有结点独立",
        "nullptr"
      ],
      [
        "两个表头指向同一首元结点",
        "返回该首元结点"
      ],
      [
        "一表为空",
        "nullptr"
      ]
    ],
    "pitfalls": [
      "比较 p==q，而不是 p->data==q->data。",
      "先跳过头结点，否则同一表头输入可能错误返回头结点。",
      "本算法的终止性依赖无环链表条件。"
    ],
    "takeaway": "共享尾段 → 先对齐剩余长度，再同步按地址比较。"
  },
  {
    "id": "2013-41",
    "year": 2013,
    "number": 41,
    "title": "主元素：候选与验证",
    "topics": [
      "linear"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2013/",
    "checked": "2026-10-15",
    "stem": "寻找数组中出现次数严格超过一半的元素。存在则输出该元素，否则输出 −1。",
    "constraints": [
      "原题 0≤a[i]<n，因此 −1 可作为不存在的标记。",
      "代码函数返回答案；调用方用 printf 输出。空数组作为扩展情况返回 −1。"
    ],
    "brute": {
      "idea": "暴力解：依次把每个元素当候选，再扫描整个数组计数。某个候选的次数超过 n/2 即返回。",
      "time": "O(n²)",
      "space": "O(1)",
      "condition": "功能正确且常数空间，但大量重复计数，不是最高效方案。",
      "code": "int majorityBrute(const int a[], int n) {\n    for (int i = 0; i < n; ++i) {\n        int count = 0;\n        for (int j = 0; j < n; ++j) if (a[j] == a[i]) ++count;\n        if (count > n / 2) return a[i];\n    }\n    return -1;\n}"
    },
    "bottleneck": "不同候选的计数反复扫描。先通过不同元素两两抵消选出唯一可能的候选，再只对它计数一次。",
    "optimized": {
      "idea": "第一遍维护 candidate 与 balance：余额为 0 时更换候选，同值加一、异值减一。第二遍重新统计候选出现次数，严格超过 n/2 才返回。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "线性时间、常数空间；验证扫描不可省略。",
      "code": "int majorityVote(const int a[], int n) {\n    if (n <= 0) return -1;\n    int candidate = 0, balance = 0;\n    for (int i = 0; i < n; ++i) {\n        if (balance == 0) candidate = a[i];\n        balance += a[i] == candidate ? 1 : -1;\n    }\n    // A surviving candidate must still be verified.\n    int count = 0;\n    for (int i = 0; i < n; ++i) if (a[i] == candidate) ++count;\n    return count > n / 2 ? candidate : -1;\n}"
    },
    "proof": "删除一对不同元素不会消除原主元素的严格多数地位。因此若主元素存在，抵消后保留的候选只能是它。但没有主元素时也可能剩下候选，必须再验证实际次数。",
    "steps": [
      "自编示例：a=[2,1,2,3,2]；candidate 未定，balance=0。",
      "读 2：candidate=2，balance=1；读 1：balance=0，两者抵消。",
      "读 2：candidate=2，balance=1；读 3：balance=0。",
      "读最后的 2：candidate=2，balance=1。这里只得到候选。",
      "重新计数：2 出现 3 次，3>5/2，返回 2。"
    ],
    "cases": [
      [
        "[0]",
        "0"
      ],
      [
        "[0,1]",
        "−1"
      ],
      [
        "[1,1,0,0]",
        "−1：恰好一半不算"
      ],
      [
        "[2,1,2,3,2]",
        "2"
      ]
    ],
    "pitfalls": [
      "balance 是抵消余额，不是候选在全数组中的出现次数。",
      "必须严格大于 n/2，不能写成大于等于。",
      "候选阶段结束后必须重新计数。"
    ],
    "takeaway": "超过一半 → 异值抵消筛候选，再验证。"
  },
  {
    "id": "2014-41",
    "year": 2014,
    "number": 41,
    "title": "二叉树的带权路径长度（WPL）",
    "topics": [
      "tree"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2014/",
    "checked": "2026-11-17",
    "stem": "给定用二叉链表存储的树。每个叶结点的路径长度按根到叶的边数计算，求所有叶结点的「权值 × 路径长度」之和。",
    "constraints": [
      "原题的叶结点权值非负。",
      "根结点深度为 0，只有叶结点参与累加。代码也支持空树，返回 0。"
    ],
    "declarations": "typedef struct WplNode {\n    int weight;\n    struct WplNode *left, *right;\n} WplNode;",
    "brute": {
      "idea": "先求树高，再逐层找叶结点。每层都从根重新遍历，用该层深度乘叶结点权值之和。",
      "time": "O(nh)",
      "space": "O(h)",
      "condition": "功能正确；O(nh) 是上界，退化链可以达到该量级。",
      "code": "static int wplHeight(const WplNode *node) {\n    if (!node) return 0;\n    int left = wplHeight(node->left);\n    int right = wplHeight(node->right);\n    return 1 + (left > right ? left : right);\n}\nstatic long long wplWeightAt(const WplNode *node, int depth) {\n    if (!node) return 0;\n    if (depth == 0)\n        return !node->left && !node->right ? node->weight : 0;\n    return wplWeightAt(node->left, depth - 1)\n         + wplWeightAt(node->right, depth - 1);\n}\nlong long wplByLevel(const WplNode *root) {\n    int height = wplHeight(root);\n    long long total = 0;\n    for (int depth = 0; depth < height; ++depth)\n        total += depth * wplWeightAt(root, depth);\n    return total;\n}"
    },
    "bottleneck": "按层查找会多次访问相同的祖先。递归时直接携带当前深度，可以在首次到达叶结点时完成贡献计算。",
    "optimized": {
      "idea": "从根以深度 0 出发。空结点贡献为 0，叶结点返回自身贡献，内部结点返回两棵子树贡献的和。",
      "time": "O(n)",
      "space": "O(h)",
      "condition": "每个结点访问一次；递归栈深度为树高。",
      "code": "static long long wplAtDepth(const WplNode *node, int depth) {\n    if (!node) return 0;\n    if (!node->left && !node->right)\n        return (long long)node->weight * depth;  // Only leaves contribute.\n\n    return wplAtDepth(node->left, depth + 1)\n         + wplAtDepth(node->right, depth + 1);\n}\nlong long treeWpl(const WplNode *root) {\n    return wplAtDepth(root, 0);\n}"
    },
    "proof": "参数 depth 始终等于根到当前结点的边数。每个叶结点只在其所在的递归分支贡献一次，左右子树没有共享叶结点，因此相加得到整棵树的 WPL。",
    "steps": [
      "根的左孩子是权值 2 的叶结点，右孩子的两个叶结点权值是 3 和 5。",
      "左边只有一条边，贡献为 2×1；右边各有两条边，分别贡献 3×2、5×2。",
      "合并两个子树的结果，得到 18。"
    ],
    "cases": [
      [
        "空树",
        "0"
      ],
      [
        "只有一个权为 9 的根",
        "0，深度为 0"
      ],
      [
        "深度为 3 的唯一叶结点权为 4",
        "12"
      ]
    ],
    "pitfalls": [
      "不要把根的深度写成 1。",
      "非叶结点的权值不计入。",
      "返回子树结果再相加，重复调用函数也不会累积上一次的结果。"
    ],
    "takeaway": "递归携带深度，叶结点乘权，内部结点只相加。"
  },
  {
    "id": "2015-41",
    "year": 2015,
    "number": 41,
    "title": "按绝对值去重",
    "topics": [
      "linked"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2015/",
    "checked": "2026-10-15",
    "stem": "链表保存 m 个整数，且每个值的绝对值不超过 n。对绝对值相同的结点，只保留第一次出现的结点，其余删除，保留者顺序不变。",
    "constraints": [
      "n 为正整数，|data|≤n；0 也属于合法值。",
      "代码用带头结点的 Node.link；结点由 malloc 分配，删除时配对使用 free。",
      "不支持把栈上或共享所有权的结点传入这组删除函数。"
    ],
    "brute": {
      "idea": "暴力解：从每个保留结点向后扫描，删除所有绝对值相同的结点；随后处理下一个保留结点。",
      "time": "O(m²)",
      "space": "O(1)",
      "condition": "结果正确并原地去重，但重复检查多，适合作为基础方案。",
      "code": "void dedupAbsBrute(Node* head) {\n    if (!head) return;\n    for (Node* p = head->link; p; p = p->link) {\n        Node* prev = p;\n        while (prev->link) {\n            Node* cur = prev->link;\n            if (llabs((long long)p->data) ==\n                llabs((long long)cur->data)) {\n                prev->link = cur->link;\n                free(cur);\n            } else prev = cur;\n        }\n    }\n}"
    },
    "bottleneck": "数值范围已经给定，可用绝对值直接索引一张出现标记表，避免为每个结点重新扫描后续链表。",
    "optimized": {
      "idea": "分配并清零 n+1 个标记；一次扫描链表，首次出现则保留并标记，否则断开并释放结点。删除后前驱不移动。",
      "time": "O(m+n)：扫描 O(m)，初始化标记 O(n)",
      "space": "O(n)",
      "condition": "以空间换时间；若只计扫描阶段为 O(m)。当 n 很大而 m 很小时，初始化成本不能忽略。 分配标记表失败时退回基础解，下列复杂度按成功分配计算。",
      "code": "void dedupAbsMarked(Node* head, int n) {\n    if (!head || n < 0) return;\n    unsigned char *seen = (unsigned char *)calloc((size_t)n + 1, 1);\n    if (!seen) {\n        dedupAbsBrute(head);\n        return;\n    }\n    Node* prev = head;\n    while (prev->link) {\n        Node* cur = prev->link;\n        size_t key = (size_t)llabs((long long)cur->data);\n        // Precondition: key <= n.\n        if (seen[key]) {\n            prev->link = cur->link;\n            free(cur);\n        } else {\n            seen[key] = 1;\n            prev = cur;\n        }\n    }\n    free(seen);\n}"
    },
    "proof": "扫描到 cur 时，seen 恰记录此前已保留结点的绝对值。标记存在则 cur 必为重复，删除不改变此前顺序；标记不存在则保留 cur，保证每个绝对值只保留首次出现者。",
    "steps": [
      "自编示例：head→2→−1→1→−2→0→0，n=2；标记全为 0。",
      "保留 2 与 −1，标记 seen[2]=1、seen[1]=1。",
      "遇到 1、−2，绝对值已标记，逐个断开并释放；删除后 prev 不前进。",
      "保留第一个 0，删除第二个 0；结果 2→−1→0。"
    ],
    "cases": [
      [
        "2→−1→1→−2→0→0，n=2",
        "2→−1→0"
      ],
      [
        "−3→3→−3，n=3",
        "保留第一个 −3 结点"
      ],
      [
        "0→0，n=1",
        "保留第一个 0"
      ],
      [
        "空链表",
        "仍为空"
      ]
    ],
    "pitfalls": [
      "标记下标必须用绝对值，不能直接用负数 data。",
      "分配 n+1 个位置以覆盖 0 与 n。",
      "删除后不移动 prev，避免跳过连续重复。",
      "free 后不能再读取 cur->link，必须先保存连接。"
    ],
    "takeaway": "有界值域去重 → 用绝对值作索引，标记首次出现。"
  },
  {
    "id": "2018-41",
    "year": 2018,
    "number": 41,
    "title": "缺失的最小正整数",
    "topics": [
      "linear"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2018/",
    "checked": "2026-10-15",
    "stem": "在含 n 个整数的数组中，找出没有出现的最小正整数。输入可能含负数、零、重复项或大于 n 的值。",
    "constraints": [
      "原题 n≥1，目标是时间尽可能高效。",
      "答案必在 [1,n+1]；下面的函数返回答案，不修改原数组。",
      "空数组作为扩展返回 1；n+1 要能用 int 表示。"
    ],
    "brute": {
      "idea": "暴力解：候选从 1 到 n+1，每次扫描原数组；第一个找不到的候选就是答案。",
      "time": "O(n²)",
      "space": "O(1)",
      "condition": "功能正确、不修改输入，但不同候选反复扫描数组。",
      "code": "int missingBrute(const int a[], int n) {\n    for (int candidate = 1; candidate <= n; ++candidate) {\n        bool found = false;\n        for (int i = 0; i < n; ++i) {\n            if (a[i] == candidate) { found = true; break; }\n        }\n        if (!found) return candidate;\n    }\n    return n + 1;\n}"
    },
    "bottleneck": "候选范围虽然无界，但 n 个元素最多覆盖前 n 个正整数。只标记 1…n，即可一次扫描数据后直接找到第一个缺口。",
    "optimized": {
      "idea": "创建长度 n 的标记表，把范围内的 a[i] 映射到下标 a[i]−1；然后从左往右找首个未标记位置，若全标记则返回 n+1。",
      "time": "O(n)",
      "space": "O(n)",
      "condition": "线性时间且不修改输入。原题没有要求 O(1) 空间；原地置换可作为以后扩展方案。 分配失败时退回基础解，复杂度按成功分配计算。",
      "code": "int missingMarked(const int a[], int n) {\n    if (n <= 0) return 1;\n    unsigned char *seen = (unsigned char *)calloc((size_t)n, 1);\n    if (!seen) return missingBrute(a, n);\n\n    // Only values in [1, n] can affect the answer.\n    for (int i = 0; i < n; ++i) {\n        if (a[i] >= 1 && a[i] <= n) seen[a[i] - 1] = 1;\n    }\n    int i = 0;\n    while (i < n && seen[i]) ++i;\n    free(seen);\n    return i + 1;\n}"
    },
    "proof": "n 个位置不可能同时容纳 1 到 n+1 全部不同的正整数。范围外数不影响这一候选区间；标记后按递增顺序找到的首个缺口就是最小缺失正整数。",
    "steps": [
      "自编示例：a=[3,1,1,−2,9]，n=5；seen 对应 1…5，初始全 0。",
      "扫描 3 和 1，seen=[1,0,1,0,0]；重复的 1 不改变标记。",
      "−2 和 9 不在 [1,5] 内，跳过，不能拿来作下标。",
      "从左扫描，seen[1]=0，所以答案为 1+1=2。"
    ],
    "cases": [
      [
        "[−5,0,−1]",
        "1"
      ],
      [
        "[1,2,3]",
        "4"
      ],
      [
        "[3,1,1,−2,9]",
        "2"
      ],
      [
        "[INT_MAX,1]",
        "2，不越界"
      ]
    ],
    "pitfalls": [
      "必须同时检查 a[i]≥1 和 a[i]≤n，只有下界检查会越界。",
      "最小正整数不包含 0。",
      "全部标记时答案是 n+1，而不是 n。"
    ],
    "takeaway": "n 个元素 → 最小缺失正整数只需检查 1…n+1。"
  },
  {
    "id": "2019-41",
    "year": 2019,
    "number": 41,
    "title": "链表首尾交替重排",
    "topics": [
      "linked"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2019/",
    "checked": "2026-10-15",
    "stem": "将带头结点的链表 a1,a2,…,an 改为 a1,an,a2,a(n−1),…，要求额外空间 O(1)，时间尽可能高效。",
    "constraints": [
      "重排现有结点，不能只交换数据伪装成重连。",
      "输入链表无环；统一用 Node.link 对应原题 next。",
      "保留全部结点与其数据，不新增结点，不释放结点。"
    ],
    "brute": {
      "idea": "暴力解：处理当前首结点时，从它后面扫描找到剩余尾结点，摘下并插入当前结点之后；再处理下一对。",
      "time": "O(n²)",
      "space": "O(1)",
      "condition": "满足常数空间并正确重排，但每轮寻找尾结点导致重复扫描。",
      "code": "void reorderBrute(Node* head) {\n    if (!head) return;\n    Node* cur = head->link;\n    while (cur && cur->link) {\n        Node* prev = cur;\n        while (prev->link->link) prev = prev->link;\n        Node* tail = prev->link;\n        if (tail == cur->link) break;\n        prev->link = NULL;\n        tail->link = cur->link;\n        cur->link = tail;\n        cur = tail->link;\n    }\n}"
    },
    "bottleneck": "单链表只能向后走，反复找尾巴很慢。先把后半段逆置，原来的末尾就变成后半段的开头，之后可直接交替取结点。",
    "optimized": {
      "idea": "快慢指针找到前半段末结点，断开两段；逆置后半段；将逆置后的后半段逐个穿插进前半段。奇数长度时前半段多一个结点。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "三段线性处理，全程只使用常数个指针，保留结点身份与数据。",
      "code": "void reorderLinear(Node* head) {\n    if (!head || !head->link || !head->link->link) return;\n    Node* slow = head->link;\n    Node* fast = head->link;\n    while (fast->link && fast->link->link) {\n        slow = slow->link;\n        fast = fast->link->link;\n    }\n    Node* cur = slow->link;\n    // Split the list before reversing the second half.\n    slow->link = NULL;\n    Node* second = NULL;\n    while (cur) {\n        Node* next = cur->link;\n        cur->link = second;\n        second = cur;\n        cur = next;\n    }\n    Node* first = head->link;\n    while (second) {\n        Node* nextFirst = first->link;\n        Node* nextSecond = second->link;\n        first->link = second;\n        second->link = nextFirst;\n        first = nextFirst;\n        second = nextSecond;\n    }\n}"
    },
    "proof": "分割后前半段按 a1,a2,… 排列，逆置后半段按 an,a(n−1),… 排列。每轮交替接入一个结点，恰好构成目标序列；前段长度不少于后段，后段用完时剩余的至多一个中点自然留在末尾。",
    "steps": [
      "自编示例：1→2→3→4→5，slow 最终停在 3。",
      "断开为 1→2→3 和 4→5，必须先令 3.link=NULL。",
      "后半段逆置成 5→4。",
      "依次穿插：1→5→2→4→3；尾结点 3.link=NULL。"
    ],
    "cases": [
      [
        "1→2→3→4",
        "1→4→2→3"
      ],
      [
        "1→2→3→4→5",
        "1→5→2→4→3"
      ],
      [
        "空表或单结点",
        "不变"
      ],
      [
        "两结点",
        "顺序不变，结点身份保持"
      ]
    ],
    "pitfalls": [
      "逆置前先断开两段，避免拼接后成环。",
      "改 link 前保存两段的后继，否则会丢失剩余结点。",
      "用地址检查结点顺序，不能只看值；重复值会掩盖错误。",
      "递归逆置会引入 O(n) 调用栈，不符合常数额外空间要求。"
    ],
    "takeaway": "首尾交替 → 找中点、断开、逆置后半、交叉合并。"
  },
  {
    "id": "2019-42",
    "year": 2019,
    "number": 42,
    "title": "出队空间可复用的链式队列",
    "topics": [
      "stack"
    ],
    "source": "https://pgcode.cn/exams/408/years/2019/preview",
    "checked": "2026-11-17",
    "stem": "设计一个初始为空的队列。入队时可以申请新空间，出队位置要留给后续入队复用。队列占用的空间只增不减，每次入队和出队都要求 O(1)。",
    "constraints": [
      "按 FIFO 顺序访问元素。",
      "以下解法用三根指针管理活动链和备用链。复杂度按通常的数据结构模型计算，一次结点分配计为 O(1)。"
    ],
    "declarations": "typedef struct QueueNode {\n    int data;\n    struct QueueNode *link;\n} QueueNode;\n\ntypedef struct ReuseQueue {\n    QueueNode *front;  // First active node.\n    QueueNode *rear;   // Last active node.\n    QueueNode *spare;  // First reusable node.\n} ReuseQueue;",
    "brute": {
      "idea": "普通链式队列入队时申请新结点，出队时释放结点。用队首、队尾指针保持 FIFO。",
      "time": "O(1) 每次",
      "space": "O(n) 队列存储",
      "condition": "功能是 FIFO，但出队会归还空间，违反题目的只增不减要求。",
      "code": "bool queuePlainPush(ReuseQueue *q, int value) {\n    QueueNode *node = (QueueNode *)malloc(sizeof *node);\n    if (!node) return false;\n    node->data = value;\n    node->link = NULL;\n    if (q->rear) q->rear->link = node;\n    else q->front = node;\n    q->rear = node;\n    return true;\n}\nbool queuePlainPop(ReuseQueue *q, int *out) {\n    QueueNode *node = q->front;\n    if (!node) return false;\n    *out = node->data;\n    q->front = node->link;\n    if (!q->front) q->rear = NULL;\n    free(node);\n    return true;\n}"
    },
    "bottleneck": "出队时活动队列不再需要这个结点，但队列仍应保留它。直接保存备用链表的首指针即可在常数时间取出空闲结点。",
    "optimized": {
      "idea": "出队结点挂到备用链表头。入队时优先取备用链表的首结点，无可复用结点才分配新空间。",
      "time": "O(1) 每次",
      "space": "O(M) 队列存储，O(1) 附加指针",
      "condition": "M 是历史最大队长，销毁前保留相应的结点。",
      "code": "bool queueReusePush(ReuseQueue *q, int value) {\n    QueueNode *node = q->spare;\n    if (node) {\n        q->spare = node->link;  // Take a reusable node.\n    } else {\n        node = (QueueNode *)malloc(sizeof *node);\n        if (!node) return false;\n    }\n\n    node->data = value;\n    node->link = NULL;\n    if (q->rear) q->rear->link = node;\n    else q->front = node;\n    q->rear = node;\n    return true;\n}\nbool queueReusePop(ReuseQueue *q, int *out) {\n    QueueNode *node = q->front;\n    if (!node) return false;\n\n    *out = node->data;\n    q->front = node->link;\n    if (!q->front) q->rear = NULL;  // The active queue is now empty.\n\n    node->link = q->spare;  // Keep this node for a later enqueue.\n    q->spare = node;\n    return true;\n}\nstatic void queueFreeChain(QueueNode *head) {\n    while (head) {\n        QueueNode *next = head->link;\n        free(head);\n        head = next;\n    }\n}\nvoid queueReuseDestroy(ReuseQueue *q) {\n    queueFreeChain(q->front);\n    queueFreeChain(q->spare);\n    q->front = q->rear = q->spare = NULL;\n}"
    },
    "proof": "活动链始终按入队顺序排列，备用链只存已经出队的结点。两条链互不相交。只有备用链为空时才新建结点，此时活动链已包含全部已分配结点，所以总分配量恰好等于历史最大队长。",
    "steps": [
      "入队 10、20，两次都没有备用结点，各申请一个。",
      "出队得到 10，把原结点放入备用链，活动链只剩 20。",
      "入队 30，复用原来存 10 的结点，活动链变成 20→30。",
      "再出队两次依次得到 20、30，活动链空，备用链中有两个结点。"
    ],
    "cases": [
      [
        "初始状态出队",
        "返回 false，无结点分配"
      ],
      [
        "出队最后一项",
        "front 和 rear 都为 NULL，结点移入 spare"
      ],
      [
        "出空后再入队",
        "复用 spare 的首结点，front 与 rear 指向该结点"
      ]
    ],
    "pitfalls": [
      "出队时不调用 free，只在销毁队列时释放。",
      "复用结点后先切断旧的 link，再把结点接到队尾。",
      "出队最后一个元素后必须清空队尾指针。"
    ],
    "takeaway": "活动链存队列顺序，备用链存可复用空间。"
  },
  {
    "id": "2020-41",
    "year": 2020,
    "number": 41,
    "title": "三个有序数组的最小三元组距离",
    "topics": [
      "linear",
      "design"
    ],
    "source": "https://www.csgraduates.com/study_methods/408quiz/2020/",
    "checked": "2026-11-17",
    "stem": "从三个升序整数数组中各选一个数 a、b、c，使 |a−b| + |b−c| + |c−a| 最小。求最小距离。",
    "constraints": [
      "三个数组均非空，可出现负数。",
      "函数返回距离，main 演示输出。用 long long 计算距离，避免普通 int 差值溢出。"
    ],
    "brute": {
      "idea": "枚举三个数组的所有下标组合，逐个计算距离。",
      "time": "O(mnp)",
      "space": "O(1)",
      "condition": "可作正确性对照。",
      "code": "long long tripleBrute(const int a[], int m, const int b[], int n,\n                      const int c[], int p) {\n    long long best = LLONG_MAX;\n    for (int i = 0; i < m; ++i) {\n        for (int j = 0; j < n; ++j) {\n            for (int k = 0; k < p; ++k) {\n                long long d = llabs((long long)a[i] - b[j])\n                            + llabs((long long)b[j] - c[k])\n                            + llabs((long long)c[k] - a[i]);\n                if (d < best) best = d;\n            }\n        }\n    }\n    return best;\n}"
    },
    "bottleneck": "大部分组合不必访问。距离只由三项的最大值与最小值决定。",
    "optimized": {
      "idea": "三个指针从各数组首项出发。更新当前距离后，只推进指向最小值的指针。",
      "time": "O(m+n+p)",
      "space": "O(1)",
      "condition": "利用数组有序性，不修改输入。",
      "code": "long long tripleMin(const int a[], int m, const int b[], int n,\n                    const int c[], int p) {\n    int i = 0, j = 0, k = 0;\n    long long best = LLONG_MAX;\n    while (i < m && j < n && k < p) {\n        int low = a[i] < b[j] ? a[i] : b[j];\n        if (c[k] < low) low = c[k];\n        int high = a[i] > b[j] ? a[i] : b[j];\n        if (c[k] > high) high = c[k];\n\n        // The middle value cancels out in the distance formula.\n        long long distance = 2LL * ((long long)high - low);\n        if (distance < best) best = distance;\n        if (best == 0) break;\n\n        // Keeping the minimum and advancing another pointer cannot help.\n        if (a[i] == low) ++i;\n        else if (b[j] == low) ++j;\n        else ++k;\n    }\n    return best;\n}"
    },
    "proof": "把三值排成 x≤y≤z，距离为 2(z−x)。固定当前最小值时，另外两项只可能随指针前移而变大，无法缩小区间。处理当前组合后可安全舍弃这个最小值。",
    "steps": [
      "A=[1,8]，B=[4,9]，C=[7,10]，先看 (1,4,7)，距离 12。",
      "推进 A，得到 (8,4,7)，距离 8。",
      "推进 B，得到 (8,9,7)，距离 4。",
      "推进 C，得到 (8,9,10)，距离仍为 4；继续推进 A 后结束。"
    ],
    "cases": [
      [
        "三个数组都含 5",
        "0"
      ],
      [
        "[1]，[5]，[8]",
        "14"
      ],
      [
        "[−4]，[0]，[2]",
        "12"
      ]
    ],
    "pitfalls": [
      "推进最小项而非最大项。",
      "任何一个数组读完就结束；最小项并列时任选一个推进。"
    ],
    "takeaway": "绝对值和化成区间宽度，再用有序三指针。"
  },
  {
    "id": "2021-41",
    "year": 2021,
    "number": 41,
    "title": "无向图的 EL 路径判定",
    "topics": [
      "graph"
    ],
    "source": "https://pgcode.cn/exams/408/years/2021/preview",
    "checked": "2026-11-17",
    "stem": "给定采用邻接矩阵存储的无向连通图，判断能否用一条路线把每条边走恰好一次。存在返回 1，否则返回 0。",
    "constraints": [
      "原题保证连通且至少有一条边，允许起点和终点相同。",
      "示例用 0/1 对称矩阵，按行存进一维数组，忽略对角元。"
    ],
    "brute": {
      "idea": "计算所有顶点的度并数奇度顶点。",
      "time": "O(V²)",
      "space": "O(1)",
      "condition": "在题设下已经达到相同的最坏复杂度。",
      "code": "int elFull(const int edge[], int n) {\n    int odd = 0;\n    for (int i = 0; i < n; ++i) {\n        int degree = 0;\n        for (int j = 0; j < n; ++j) {\n            if (i != j && edge[(size_t)i * n + j] != 0) ++degree;\n        }\n        odd += degree % 2;\n    }\n    return odd == 0 || odd == 2;\n}"
    },
    "bottleneck": "题目只需要度的奇偶性。出现第三个奇度顶点后，继续扫描也无法使已经确认的奇度顶点消失。",
    "optimized": {
      "idea": "逐行用异或维护度的奇偶性；数到三个奇度顶点立刻返回 0。",
      "time": "O(V²)",
      "space": "O(1)",
      "condition": "改善可提前判否的输入，最坏量级与基础解相同。",
      "code": "int elExists(const int edge[], int n) {\n    int odd = 0;\n    for (int i = 0; i < n; ++i) {\n        int parity = 0;\n        for (int j = 0; j < n; ++j) {\n            if (i != j) parity ^= edge[(size_t)i * n + j] != 0;\n        }\n        // Three confirmed odd vertices are enough to reject.\n        odd += parity;\n        if (odd > 2) return 0;\n    }\n    return odd == 0 || odd == 2;\n}"
    },
    "proof": "连通无向图存在欧拉迹，当且仅当奇度顶点数是 0 或 2。路线到达并离开同一顶点时消耗成对的边，只有两个端点可能为奇度。",
    "steps": [
      "看路径图 0—1—2—3。",
      "四行非零项数分别为 1、2、2、1，只有两端是奇度。",
      "返回 1，从 0 走到 3 就能各走一遍。"
    ],
    "cases": [
      [
        "四点路径",
        "1"
      ],
      [
        "三点环",
        "1"
      ],
      [
        "四点星形",
        "0"
      ]
    ],
    "pitfalls": [
      "连通性由题设保证。若题意取消该保证，需要另查所有非孤立点是否在同一连通分量。",
      "判断能否遍历所有边，不需要生成实际路线。"
    ],
    "takeaway": "无向连通图能一笔画完 ⇔ 奇度点为 0 或 2。"
  },
  {
    "id": "2022-41",
    "year": 2022,
    "number": 41,
    "title": "顺序存储二叉树判定 BST",
    "topics": [
      "tree",
      "search"
    ],
    "source": "https://pgcode.cn/exams/408/years/2022/preview",
    "checked": "2026-11-17",
    "stem": "二叉树以数组顺序存储，缺失结点用 −1 标记。判断整个树是否满足二叉搜索树的严格大小关系。",
    "constraints": [
      "根下标为 0，左右孩子下标为 2i+1 和 2i+2。",
      "有效结点值均为正整数，输入是合法的顺序存储二叉树；重复关键字判否。"
    ],
    "brute": {
      "idea": "对每个结点分别遍历其左右子树，检查左边全小、右边全大。",
      "time": "O(mh)",
      "space": "O(h)",
      "condition": "m 为实际结点数，h 为树高；结点可能被祖先反复检查。",
      "code": "static bool subtreeSide(const int a[], size_t n, size_t i,\n                        int key, bool smaller) {\n    if (i >= n || a[i] == -1) return true;\n    if (smaller ? a[i] >= key : a[i] <= key) return false;\n    return subtreeSide(a, n, 2 * i + 1, key, smaller)\n        && subtreeSide(a, n, 2 * i + 2, key, smaller);\n}\nbool bstRepeated(const int a[], size_t n, size_t i) {\n    if (i >= n || a[i] == -1) return true;\n    size_t left = 2 * i + 1, right = left + 1;\n    return subtreeSide(a, n, left, a[i], true)\n        && subtreeSide(a, n, right, a[i], false)\n        && bstRepeated(a, n, left)\n        && bstRepeated(a, n, right);\n}"
    },
    "bottleneck": "祖先对整棵子树的限制可以随递归向下传递，每个结点无需反复遍历。",
    "optimized": {
      "idea": "递归传入开区间 (low, high)。左子树收紧上界，右子树收紧下界。",
      "time": "O(m)",
      "space": "O(h)",
      "condition": "每个实际结点只检查一次。",
      "code": "static bool bstWithin(const int a[], size_t n, size_t i,\n                      long long low, long long high) {\n    if (i >= n || a[i] == -1) return true;\n    int key = a[i];\n    if (key <= low || key >= high) return false;\n\n    // Pass ancestor bounds down to both children.\n    return bstWithin(a, n, 2 * i + 1, low, key)\n        && bstWithin(a, n, 2 * i + 2, key, high);\n}\nbool bstCheck(const int a[], size_t n) {\n    return bstWithin(a, n, 0, LLONG_MIN, LLONG_MAX);\n}"
    },
    "proof": "区间保留从根到当前结点的全部祖先约束。当前值在开区间内，恰好满足来自所有祖先的大小限制。",
    "steps": [
      "数组 [8,4,12,−1,6]，根 8 合法。",
      "结点 4 落在上界 8 以下，它的右孩子 6 应同时大于 4、小于 8。",
      "6 在 (4,8) 内，12 也大于 8，整棵树通过。"
    ],
    "cases": [
      [
        "[8,4,12,−1,6]",
        "true"
      ],
      [
        "[8,4,12,−1,9]",
        "false"
      ],
      [
        "[8,8]",
        "false"
      ]
    ],
    "pitfalls": [
      "只比较直接父子会漏掉跨层违规。",
      "先判断越界和 −1 再访问结点；上下界都用严格比较。"
    ],
    "takeaway": "判 BST 时递归携带全部祖先约束。"
  },
  {
    "id": "2025-41",
    "year": 2025,
    "number": 41,
    "title": "每项与后缀元素的最大乘积",
    "topics": [
      "linear",
      "design"
    ],
    "source": "https://static.kaoyan.cn/file/question/2025/11/04/ea4c362c1e27e35785676e188b094e37.pdf",
    "checked": "2026-11-17",
    "stem": "对数组每个位置 i，找出 A[i] 与该位置到数组末尾的任一元素相乘所能得到的最大值，依次写入结果数组。",
    "constraints": [
      "允许 i=j，输入可包含正数、负数和 0。",
      "原题使用 int 结果数组。演示将乘积和结果存为 long long；保证乘积在 int 范围内时可按卷面原型保存。"
    ],
    "brute": {
      "idea": "对每个位置扫描其整个后缀，取乘积最大值。",
      "time": "O(n²)",
      "space": "O(1)",
      "condition": "辅助空间不计输出数组。",
      "code": "void mulBrute(const int a[], long long res[], int n) {\n    for (int i = 0; i < n; ++i) {\n        long long best = (long long)a[i] * a[i];\n        for (int j = i + 1; j < n; ++j) {\n            long long product = (long long)a[i] * a[j];\n            if (product > best) best = product;\n        }\n        res[i] = best;\n    }\n}"
    },
    "bottleneck": "相邻位置的后缀几乎相同。固定第一个因子后，乘积只需要后缀的两个极值。",
    "optimized": {
      "idea": "从右向左扫描，将当前位置计入后缀最小值和最大值。负因子乘最小值，非负因子乘最大值。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "遍历一趟，辅助空间不计输出数组。",
      "code": "void calMulMax(const int a[], long long res[], int n) {\n    if (n <= 0) return;\n    int low = a[n - 1], high = a[n - 1];\n    for (int i = n - 1; i >= 0; --i) {\n        // Include a[i] before computing the result: i == j is allowed.\n        if (a[i] < low) low = a[i];\n        if (a[i] > high) high = a[i];\n        int partner = a[i] < 0 ? low : high;\n        res[i] = (long long)a[i] * partner;\n    }\n}"
    },
    "proof": "每轮更新后 low 和 high 恰好是 A[i..n−1] 的最小值与最大值。乘以非负数时保序，乘以负数时逆序，最大值一定在对应极值处取得。",
    "steps": [
      "数组 [2,−3,5]，位置 2 的后缀只有 5，结果 25。",
      "位置 1 的后缀最小值为 −3，负因子 −3 乘 −3 得 9。",
      "位置 0 的后缀最大值为 5，正因子 2 乘 5 得 10。"
    ],
    "cases": [
      [
        "[2,−3,5]",
        "[10,9,25]"
      ],
      [
        "[−7]",
        "[49]"
      ],
      [
        "[0,0]",
        "[0,0]"
      ]
    ],
    "pitfalls": [
      "必须先纳入当前元素再算乘积。",
      "先转换到 long long 再乘，避免 int 运算先溢出。"
    ],
    "takeaway": "逆向扫描维护后缀两端极值，再按乘数符号选择。"
  }
];
