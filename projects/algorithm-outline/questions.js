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
      "code": "int kthTwoPass(const Node* head, int k) {\n    if (!head || k <= 0) return 0;\n    int n = 0;\n    for (const Node* p = head->link; p; p = p->link) ++n;\n    if (k > n) return 0;\n    const Node* p = head->link;\n    for (int i = 0; i < n - k; ++i) p = p->link;\n    std::cout << p->data << '\\n';\n    return 1;\n}"
    },
    "bottleneck": "两趟解先知道总长度才定位；双指针用固定间距替代长度统计。两者的渐近复杂度相同，优化点是遍历组织方式，并非从 O(n²) 降为 O(n)。",
    "optimized": {
      "idea": "快慢指针都从首元结点出发；快指针先走 k 步，再同时前进。快指针到空时，慢指针就是目标。",
      "time": "O(n)",
      "space": "O(1)",
      "condition": "单趟组织、无额外容器，不改变链表。",
      "code": "int kthTwoPointers(const Node* head, int k) {\n    if (!head || k <= 0) return 0;\n    const Node* fast = head->link;\n    const Node* slow = head->link;\n    for (int i = 0; i < k; ++i) {\n        if (!fast) return 0;\n        fast = fast->link;\n    }\n    while (fast) {\n        fast = fast->link;\n        slow = slow->link;\n    }\n    std::cout << slow->data << '\\n';\n    return 1;\n}"
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
      "code": "void reverseRange(int a[], int left, int right) {\n    while (left < right) {\n        int tmp = a[left];\n        a[left++] = a[right];\n        a[right--] = tmp;\n    }\n}\nvoid rotateReverse(int a[], int n, int p) {\n    if (n <= 0 || p < 0) return;\n    p %= n;\n    if (p == 0) return;\n    reverseRange(a, 0, p - 1);\n    reverseRange(a, p, n - 1);\n    reverseRange(a, 0, n - 1);\n}"
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
      "code": "int medianPartition(const int a[], const int b[], int n) {\n    int low = 0, high = n;\n    while (low <= high) {\n        int i = low + (high - low) / 2;\n        int j = n - i;\n        long long al = i == 0 ? LLONG_MIN : a[i - 1];\n        long long ar = i == n ? LLONG_MAX : a[i];\n        long long bl = j == 0 ? LLONG_MIN : b[j - 1];\n        long long br = j == n ? LLONG_MAX : b[j];\n        if (al > br) high = i - 1;\n        else if (bl > ar) low = i + 1;\n        else return static_cast<int>(std::max(al, bl));\n    }\n    throw std::invalid_argument(\"Invalid sorted input\");\n}"
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
      "代码函数返回答案；调用方用 std::cout 输出。空数组作为扩展情况返回 −1。"
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
      "code": "int majorityVote(const int a[], int n) {\n    if (n <= 0) return -1;\n    int candidate = 0, balance = 0;\n    for (int i = 0; i < n; ++i) {\n        if (balance == 0) candidate = a[i];\n        balance += a[i] == candidate ? 1 : -1;\n    }\n    int count = 0;\n    for (int i = 0; i < n; ++i) if (a[i] == candidate) ++count;\n    return count > n / 2 ? candidate : -1;\n}"
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
  }
];
