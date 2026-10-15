#include "dist/solutions.hpp"
#include <cassert>
#include <vector>
#include <sstream>
#include <random>
#include <numeric>
int main() {
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
