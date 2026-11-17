#include <iostream>
#include <algorithm>
#include <sstream>
#include <cstdio>
#include <cstdlib>
#include <new>
#include <deque>

static std::ostringstream printed;
static int captureOutput(const char*, int value) {
    printed << value << '\n';
    return 0;
}

#define printf captureOutput
#include "dist/solutions.h"
#undef printf
#include <cassert>
#include <vector>
#include <sstream>
#include <random>
#include <numeric>
void testSecondBatch() {
    std::mt19937 rng(2019);
    // Independent prefixes plus shared tail; all values deliberately identical.
    for(int a=0;a<=8;++a)for(int b=0;b<=8;++b)for(int c=0;c<=5;++c){
        std::vector<Node> left(a),right(b),tail(c);
        for(int i=0;i<c;++i)tail[i]={7,i+1<c?&tail[i+1]:nullptr};
        Node* common=c?&tail[0]:nullptr;
        for(int i=0;i<a;++i)left[i]={7,i+1<a?&left[i+1]:common};
        for(int i=0;i<b;++i)right[i]={7,i+1<b?&right[i+1]:common};
        Node h1{0,a?&left[0]:common},h2{0,b?&right[0]:common};
        std::vector<std::pair<Node*,Node*>> before;
        for(auto* v:{&left,&right,&tail})for(auto& node:*v)before.push_back({&node,node.link});
        assert(suffixBrute(&h1,&h2)==common);
        assert(suffixAligned(&h1,&h2)==common);
        for(auto [node,next]:before){assert(node->data==7);assert(node->link==next);}
        assert(suffixAligned(&h1,&h1)==h1.link);
    }
    assert(suffixAligned(nullptr,nullptr)==nullptr);
    for(int size=0;size<=80;++size){
        for(int trial=0;trial<40;++trial){
            int bound=1+static_cast<int>(rng()%20);
            std::vector<int> values(size),expected;
            std::vector<bool> seen(bound+1,false);
            for(auto& v:values){v=static_cast<int>(rng()%(2*bound+1))-bound;if(!seen[std::abs(v)]){expected.push_back(v);seen[std::abs(v)]=true;}}
            for(int mode=0;mode<2;++mode){
                Node head{0,nullptr};Node* end=&head;
                std::vector<Node*> survivors;std::fill(seen.begin(),seen.end(),false);
                for(int v:values){void* storage=std::malloc(sizeof(Node));assert(storage);end->link=new (storage) Node{v,nullptr};end=end->link;if(!seen[std::abs(v)]){survivors.push_back(end);seen[std::abs(v)]=true;}}
                if(mode==0)dedupAbsBrute(&head);else dedupAbsMarked(&head,bound);
                Node* node=head.link;
                for(std::size_t i=0;i<expected.size();++i){assert(node==survivors[i]);assert(node->data==expected[i]);Node* next=node->link;std::free(node);node=next;}
                assert(node==nullptr);
            }
            std::vector<int> input(size);
            for(auto& v:input)v=static_cast<int>(rng()%(2*size+5))-size;
            if(size&&trial==0)input[0]=INT_MAX;
            if(size&&trial==1)input[0]=INT_MIN;
            int missing=1;while(std::find(input.begin(),input.end(),missing)!=input.end())++missing;
            auto original=input;
            assert(missingBrute(input.data(),size)==missing);
            assert(missingMarked(input.data(),size)==missing);
            assert(input==original);
        }
        for(auto reorder:{reorderBrute,reorderLinear}){
            std::vector<Node> nodes(size+1);
            for(int i=0;i<=size;++i)nodes[i]={i%3,i<size?&nodes[i+1]:nullptr};
            std::vector<Node*> expected;
            for(int l=1,r=size;l<=r;++l,--r){expected.push_back(&nodes[l]);if(l<r)expected.push_back(&nodes[r]);}
            reorder(&nodes[0]);Node* cur=nodes[0].link;
            for(Node* wanted:expected){assert(cur==wanted);assert(cur->data==static_cast<int>(cur-&nodes[0])%3);cur=cur->link;}
            assert(cur==nullptr);
        }
    }
    int complete[]={1,2,3,4};assert(missingMarked(complete,4)==5);
    int zeros[]={0,0,0};assert(missingMarked(zeros,3)==1);
    dedupAbsBrute(nullptr);dedupAbsMarked(nullptr,2);reorderBrute(nullptr);reorderLinear(nullptr);
    std::cout << "Second batch passed: shared-tail identity, dedup retention, missing positive, reorder identity and acyclic termination.\n";
}
void testThirdBatch() {
    std::mt19937 rng(2025);
    for (int trial = 0; trial < 400; ++trial) {
        std::vector<int> a(1 + rng() % 9), b(1 + rng() % 9), c(1 + rng() % 9);
        for (auto* v : {&a, &b, &c}) {
            for (int& value : *v) value = static_cast<int>(rng() % 41) - 20;
            std::sort(v->begin(), v->end());
        }
        assert(tripleMin(a.data(), a.size(), b.data(), b.size(), c.data(), c.size())
            == tripleBrute(a.data(), a.size(), b.data(), b.size(), c.data(), c.size()));

        std::vector<long long> expected(a.size()), actual(a.size());
        if (trial == 0) a.front() = INT_MIN;
        mulBrute(a.data(), expected.data(), a.size());
        calMulMax(a.data(), actual.data(), a.size());
        assert(actual == expected);

        int n = 2 + static_cast<int>(rng() % 8);
        std::vector<int> edge(n * n, 0);
        for (int i = 1; i < n; ++i) {
            edge[i * n + i - 1] = 1;
            edge[(i - 1) * n + i] = 1;
        }
        for (int i = 0; i < n; ++i) {
            for (int j = i + 2; j < n; ++j) {
                edge[i * n + j] = edge[j * n + i] = rng() % 2;
            }
        }
        assert(elExists(edge.data(), n) == elFull(edge.data(), n));

        int tree[] = {50, 20, 80, 10, 30, 70, 90};
        tree[1 + rng() % 6] = 1 + static_cast<int>(rng() % 100);
        assert(bstCheck(tree, 7) == bstRepeated(tree, 7, 0));
    }
    const int valid[] = {8, 4, 12, -1, 6};
    const int invalid[] = {8, 4, 12, -1, 9};
    assert(bstCheck(valid, 5) && !bstCheck(invalid, 5));
    const int star[] = {0,1,1,1, 1,0,0,0, 1,0,0,0, 1,0,0,0};
    assert(!elExists(star, 4));
}

void testQueueAndWpl() {
    ReuseQueue q{};
    std::deque<int> reference;
    int out = 0;
    assert(!queueReusePop(&q, &out));
    assert(queueReusePush(&q, 10));
    auto* first = q.front;
    assert(queueReusePop(&q, &out) && out == 10);
    assert(q.front == nullptr && q.rear == nullptr && q.spare == first);
    assert(queueReusePush(&q, 20) && q.front == first);
    queueReuseDestroy(&q);

    std::mt19937 rng(201942);
    std::size_t peak = 0;
    for (int i = 0; i < 500; ++i) {
        if (rng() % 2 == 0) {
            assert(queueReusePush(&q, i));
            reference.push_back(i);
            peak = std::max(peak, reference.size());
        } else if (reference.empty()) {
            assert(!queueReusePop(&q, &out));
        } else {
            assert(queueReusePop(&q, &out) && out == reference.front());
            reference.pop_front();
        }
        std::size_t allocated = 0;
        for (auto* chain : {q.front, q.spare}) {
            for (auto* node = chain; node; node = node->link) assert(++allocated <= peak);
        }
        assert(allocated == peak);
    }
    queueReuseDestroy(&q);
    assert(!q.front && !q.rear && !q.spare);

    assert(treeWpl(nullptr) == 0);
    WplNode leaf{9, nullptr, nullptr};
    assert(treeWpl(&leaf) == 0);
    for (int n = 1; n <= 70; ++n) {
        std::vector<WplNode> nodes(n);
        for (int i = 0; i < n; ++i) {
            nodes[i] = {static_cast<int>(rng() % 100),
                        2 * i + 1 < n ? &nodes[2 * i + 1] : nullptr,
                        2 * i + 2 < n ? &nodes[2 * i + 2] : nullptr};
        }
        const auto expected = wplByLevel(nodes.data());
        assert(treeWpl(nodes.data()) == expected);
        assert(treeWpl(nodes.data()) == expected);
    }
}

int main() {
    testQueueAndWpl();
    testThirdBatch();
    testSecondBatch();
    std::mt19937 rng(408);

    for (int n = 0; n <= 30; ++n) {
        std::vector<Node> nodes(n + 1);
        for (int i = 0; i <= n; ++i) {
            nodes[i].data = 10 * i;
            nodes[i].link = i < n ? &nodes[i + 1] : nullptr;
        }
        for (int k = -1; k <= n + 2; ++k) {
            int expected = k > 0 && k <= n;
            std::string text = expected ? std::to_string(10 * (n-k+1)) + "\n" : "";
            for (auto f : {kthTwoPass, kthTwoPointers}) {
                printed.str(""); printed.clear();
                assert(f(&nodes[0], k) == expected);
                assert(printed.str() == text);
                for (int i = 0; i <= n; ++i) {
                    assert(nodes[i].data == 10 * i);
                    assert(nodes[i].link == (i < n ? &nodes[i+1] : nullptr));
                }
            }
        }
    }
    assert(kthTwoPass(nullptr,1)==0 && kthTwoPointers(nullptr,1)==0);

    for (int n = 1; n <= 60; ++n) {
        std::vector<int> a(n);
        std::iota(a.begin(),a.end(),0);
        for (int p = 0; p <= 2*n; ++p) {
            auto x=a,y=a,expected=a;
            std::rotate(expected.begin(),expected.begin()+p%n,expected.end());
            rotateBrute(x.data(),n,p);rotateReverse(y.data(),n,p);
            assert(x==expected && y==expected);
        }
        for (int trial=0; trial<100; ++trial) {
            std::vector<int> x(n),y(n);
            for(auto& v:x)v=static_cast<int>(rng()%31)-15;
            for(auto& v:y)v=static_cast<int>(rng()%31)-15;
            std::sort(x.begin(),x.end());std::sort(y.begin(),y.end());
            auto merged=x;merged.insert(merged.end(),y.begin(),y.end());std::sort(merged.begin(),merged.end());
            assert(medianMerge(x.data(),y.data(),n)==merged[n-1]);
            assert(medianPartition(x.data(),y.data(),n)==merged[n-1]);
            for(auto& v:x)v=static_cast<int>(rng()%n);
            if(trial%2==0)for(int i=0;i<=n/2;++i)x[i]=n-1;
            int expected=-1;
            for(int v=0;v<n;++v)if(std::count(x.begin(),x.end(),v)>n/2)expected=v;
            assert(majorityBrute(x.data(),n)==expected);
            assert(majorityVote(x.data(),n)==expected);
        }
    }
    int lo[]={INT_MIN},hi[]={INT_MAX};
    assert(medianPartition(lo,hi,1)==INT_MIN);
    assert(medianPartition(hi,hi,1)==INT_MAX);
    assert(majorityVote(nullptr,0)==-1 && majorityBrute(nullptr,0)==-1);
    rotateBrute(nullptr,0,2);rotateReverse(nullptr,0,2);
    std::cout << "Passed: linked-list boundaries and immutability; 3,720 rotations; 6,000 median and majority comparisons.\n";
}
