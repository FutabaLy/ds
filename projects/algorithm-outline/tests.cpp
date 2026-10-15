#include "dist/solutions.hpp"
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
                for(int v:values){end->link=new Node{v,nullptr};end=end->link;if(!seen[std::abs(v)]){survivors.push_back(end);seen[std::abs(v)]=true;}}
                if(mode==0)dedupAbsBrute(&head);else dedupAbsMarked(&head,bound);
                Node* node=head.link;
                for(std::size_t i=0;i<expected.size();++i){assert(node==survivors[i]);assert(node->data==expected[i]);Node* next=node->link;delete node;node=next;}
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
int main() {
    testSecondBatch();
    std::mt19937 rng(408);
    std::ostringstream output;
    auto* old = std::cout.rdbuf(output.rdbuf());
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
                output.str(""); output.clear();
                assert(f(&nodes[0], k) == expected);
                assert(output.str() == text);
                for (int i = 0; i <= n; ++i) {
                    assert(nodes[i].data == 10 * i);
                    assert(nodes[i].link == (i < n ? &nodes[i+1] : nullptr));
                }
            }
        }
    }
    assert(kthTwoPass(nullptr,1)==0 && kthTwoPointers(nullptr,1)==0);
    std::cout.rdbuf(old);
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
