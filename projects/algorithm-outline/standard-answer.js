export const commonDeclarations = String.raw`#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

typedef struct Node {
    int data;
    struct Node *link;
} Node;`;

const examples = {
    '2009-42': [String.raw`    Node tail = {30, NULL};
    Node middle = {20, &tail};
    Node first = {10, &middle};
    Node head = {0, &first};  // 头结点不计入长度。
    return kthTwoPointers(&head, 2) ? 0 : 1;`, '20'],
    '2010-42': [String.raw`    int a[] = {1, 2, 3, 4, 5};
    int n = (int)(sizeof a / sizeof a[0]);
    rotateReverse(a, n, 2);
    for (int i = 0; i < n; ++i)
        printf("%d%c", a[i], i == n - 1 ? '\n' : ' ');`, '3 4 5 1 2'],
    '2011-42': [String.raw`    int a[] = {1, 3, 8, 9};
    int b[] = {2, 4, 5, 6};
    int n = (int)(sizeof a / sizeof a[0]);
    printf("%d\n", medianPartition(a, b, n));`, '4'],
    '2012-42': [String.raw`    Node shared = {7, NULL};  // 两条链共享的是同一个结点。
    Node first = {1, &shared};
    Node a = {0, &first};
    Node b = {0, &shared};
    const Node *result = suffixAligned(&a, &b);
    if (result) printf("%d\n", result->data);`, '7'],
    '2013-41': [String.raw`    int a[] = {2, 1, 2, 2, 0};
    int n = (int)(sizeof a / sizeof a[0]);
    printf("%d\n", majorityVote(a, n));`, '2'],
    '2014-41': [String.raw`    WplNode left = {2, NULL, NULL};
    WplNode leaf1 = {3, NULL, NULL};
    WplNode leaf2 = {5, NULL, NULL};
    WplNode right = {0, &leaf1, &leaf2};
    WplNode root = {0, &left, &right};
    printf("%lld\n", treeWpl(&root));`, '18'],
    '2015-41': [String.raw`    const int a[] = {3, -3, 2, -2, 1};
    Node head = {0, NULL};
    Node *tail = &head;
    int status = 0;
    // 会删除结点，数据结点必须用可交给 free 的方式分配。
    for (size_t i = 0; i < sizeof a / sizeof a[0]; ++i) {
        Node *node = (Node *)malloc(sizeof *node);
        if (!node) {
            status = 1;
            break;
        }
        *node = (Node){a[i], NULL};
        tail->link = node;
        tail = node;
    }
    if (status == 0) dedupAbsMarked(&head, 3);
    while (head.link) {
        Node *node = head.link;
        head.link = node->link;
        if (status == 0)
            printf("%d%c", node->data, head.link ? ' ' : '\n');
        free(node);
    }
    return status;`, '3 2 1'],
    '2018-41': [String.raw`    int a[] = {3, 4, -1, 1};
    int n = (int)(sizeof a / sizeof a[0]);
    printf("%d\n", missingMarked(a, n));`, '2'],
    '2019-41': [String.raw`    Node a[] = {{0, NULL}, {1, NULL}, {2, NULL}, {3, NULL}, {4, NULL}};
    for (int i = 0; i < 4; ++i) a[i].link = &a[i + 1];
    reorderLinear(&a[0]);
    for (Node *p = a[0].link; p; p = p->link)
        printf("%d%c", p->data, p->link ? ' ' : '\n');`, '1 4 2 3'],
    '2019-42': [String.raw`    ReuseQueue queue = {NULL, NULL, NULL};
    int first, second, third;
    // 先出队 10，再入队 30，后一操作复用 10 的结点。
    bool ok = queueReusePush(&queue, 10)
           && queueReusePush(&queue, 20)
           && queueReusePop(&queue, &first)
           && queueReusePush(&queue, 30)
           && queueReusePop(&queue, &second)
           && queueReusePop(&queue, &third);
    if (ok) printf("%d %d %d\n", first, second, third);
    queueReuseDestroy(&queue);
    return ok ? 0 : 1;`, '10 20 30'],
    '2020-41': [String.raw`    int a[] = {1, 8}, b[] = {4, 9}, c[] = {7, 10};
    printf("%lld\n", tripleMin(a, 2, b, 2, c, 2));`, '4'],
    '2021-41': [String.raw`    const int edge[] = {
        0, 1, 0, 0,
        1, 0, 1, 0,
        0, 1, 0, 1,
        0, 0, 1, 0
    };  // 路径图 0—1—2—3，每四项是一行。
    printf("%d\n", elExists(edge, 4));`, '1'],
    '2022-41': [String.raw`    const int a[] = {8, 4, 12, -1, 6};
    printf("%s\n", bstCheck(a, sizeof a / sizeof a[0]) ? "true" : "false");`, 'true'],
    '2025-41': [String.raw`    int a[] = {2, -3, 5};
    int n = (int)(sizeof a / sizeof a[0]);
    long long res[sizeof a / sizeof a[0]];
    calMulMax(a, res, n);
    for (int i = 0; i < n; ++i)
        printf("%lld%c", res[i], i == n - 1 ? '\n' : ' ');`, '10 9 25'],
    '2016-43': [String.raw`    int a[] = {7, 1, 4, 2, 9};
    printf("%lld\n", splitPartition(a, 5));`, "17"],
    '2017-41': [String.raw`    ExprNode a = {"12", NULL, NULL}, b = {"3", NULL, NULL};
    ExprNode c = {"4", NULL, NULL}, neg = {"-", NULL, &c};
    ExprNode sum = {"+", &a, &b}, root = {"*", &sum, &neg};
    exprPrint(&root);
    putchar('\n');`, "(12+3)*(-4)"],
    '2023-41': [String.raw`    const int edge[] = {0,1,1, 0,0,0, 0,0,0};
    int count = printKVertices(edge, "ABC", 3);
    printf("\n%d\n", count);`, "A\n1"],
    '2024-41': [String.raw`    const int edge[] = {0,1,0, 0,0,1, 0,0,0};
    int degree[3], ready[3];
    printf("%d\n", topoUniqueQueue(edge, 3, degree, ready));`, "1"],
    '2020-42': [String.raw`    const char *codes[] = {"0", "10", "11"};
    PrefixNode tree[6];
    if (!prefixBuild(codes, "ABC", 3, tree, 6)) return 1;
    if (!prefixDecode(tree, "01011")) return 1;
    putchar('\n');`, "ABC"],
    '2022-42': [String.raw`    int a[] = {12,4,8,10,5,2,1,9,11,3,7,6};
    int smallest[10];
    smallestByHeap(a, 12, smallest, 10);
    for (int i = 0; i < 10; ++i)
        printf("%d%c", smallest[i], i == 9 ? '\n' : ' ');`, "1 2 3 4 5 6 7 8 9 10"],
    '2026-41': [String.raw`    NearNode right = {15, NULL, NULL}, root = {5, NULL, &right};
    NearResult result = nearBst(&root, 10);
    if (!result.count) return 1;
    printf("%lld\n", result.distance);
    for (int i = 0; i < result.count; ++i)
        printf("%d%c", result.keys[i], i + 1 == result.count ? '\n' : ' ');`, "5\n5 15"],
    '2012-41': [String.raw`    long long lengths[] = {10,35,40,50,60,200};
    printf("%lld\n", mergeCostHeap(lengths, 6));`, "825"],
    '2021-42': [String.raw`    int a[] = {25,-10,25,10,11,19};
    int out[6], origin[6], rank[6];
    rankSortStable(a, 6, out, origin, rank);
    for (int i = 0; i < 6; ++i)
        printf("%d%c", out[i], i == 5 ? '\n' : ' ');
    for (int i = 0; i < 6; ++i)
        printf("%d%c", origin[i], i == 5 ? '\n' : ' ');`, "-10 10 11 19 25 25\n1 3 4 5 0 2"]
};

const supportingAnswers = new Set(['2015-41', '2018-41']);
const returnsFromMain = new Set(['2009-42', '2015-41', '2019-42']);

export function standardAnswer(question) {
    const [example, expected] = examples[question.id];
    const declarations = question.topics.includes('linked')
        ? commonDeclarations : commonDeclarations.split('\n\ntypedef')[0];
    const fallback = supportingAnswers.has(question.id)
        ? '\n\n/* 标记表分配失败时使用的基础解。 */\n' + question.brute.code : '';
    const result = returnsFromMain.has(question.id) ? '' : '\n    return 0;';
    const code = [
        [declarations, question.declarations].filter(Boolean).join('\n\n') + fallback,
        '/* 解题函数：' + question.optimized.idea + ' */\n' + question.optimized.code,
        '/* 独立运行示例：在 main 中构造输入并输出结果。 */\nint main(void) {\n'
            + example + result + '\n}\n'
    ].join('\n\n');
    return {code, expected};
}
