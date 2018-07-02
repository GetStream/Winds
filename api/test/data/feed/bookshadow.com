<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><channel><title>书影 - 最新日志</title><link>http://bookshadow.com/weblog/</link><description>The latest entries on the site 书影</description><atom:link href="http://bookshadow.com/weblog/feeds/" rel="self"></atom:link><language>zh-CN</language><copyright>Zinnia</copyright><lastBuildDate>Mon, 18 Jun 2018 13:58:13 +0800</lastBuildDate><item><title>[LeetCode]K-Similar Strings
</title><link>http://bookshadow.com/weblog/2018/06/17/leetcode-k-similar-strings/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/k-similar-strings/" target="_blank"&gt;&lt;strong&gt;LeetCode 854. K-Similar Strings&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Strings&amp;nbsp;&lt;code&gt;A&lt;/code&gt; and &lt;code&gt;B&lt;/code&gt; are &lt;code&gt;K&lt;/code&gt;-similar (for some non-negative integer &lt;code&gt;K&lt;/code&gt;) if we can swap the positions of two letters in &lt;code&gt;A&lt;/code&gt; exactly &lt;code&gt;K&lt;/code&gt;&amp;nbsp;times so that the resulting string equals &lt;code&gt;B&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;Given two anagrams &lt;code&gt;A&lt;/code&gt; and &lt;code&gt;B&lt;/code&gt;, return the smallest &lt;code&gt;K&lt;/code&gt;&amp;nbsp;for which &lt;code&gt;A&lt;/code&gt; and &lt;code&gt;B&lt;/code&gt; are &lt;code&gt;K&lt;/code&gt;-similar.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;A = &lt;span id="example-input-1-1"&gt;&amp;quot;ab&amp;quot;&lt;/span&gt;, B = &lt;span id="example-input-1-2"&gt;&amp;quot;ba&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-1"&gt;1&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;A = &lt;span id="example-input-2-1"&gt;&amp;quot;abc&amp;quot;&lt;/span&gt;, B = &lt;span id="example-input-2-2"&gt;&amp;quot;bca&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-2"&gt;2&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;A = &lt;span id="example-input-3-1"&gt;&amp;quot;abac&amp;quot;&lt;/span&gt;, B = &lt;span id="example-input-3-2"&gt;&amp;quot;baca&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-3"&gt;2&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 4:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;A = &lt;span id="example-input-4-1"&gt;&amp;quot;aabc&amp;quot;&lt;/span&gt;, B = &lt;span id="example-input-4-2"&gt;&amp;quot;abca&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-4"&gt;2&lt;/span&gt;&lt;/pre&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= A.length == B.length &amp;lt;= 20&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;A&lt;/code&gt; and &lt;code&gt;B&lt;/code&gt; contain only lowercase letters from the set &lt;code&gt;{&amp;#39;a&amp;#39;, &amp;#39;b&amp;#39;, &amp;#39;c&amp;#39;, &amp;#39;d&amp;#39;, &amp;#39;e&amp;#39;, &amp;#39;f&amp;#39;}&lt;/code&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定字符串的两个&amp;ldquo;变位词&amp;rdquo;（anagram）A和B，求最少调换多少次字符次序可以从A得到B。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;记忆化搜索（Memoization）&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def kSimilarity(self, A, B):
        """
        :type A: str
        :type B: str
        :rtype: int
        """
        self.memo = {}
        return self.solve(A, B)

    def solve(self, A, B):
        diff = [A[i] != B[i] for i in range(len(A))]
        simplify = lambda S: ''.join(c * d for c, d in zip(S, diff))
        A, B = simplify(A), simplify(B)
        if not A: return 0
        if (A, B) in self.memo: return self.memo[(A, B)]
        ans = 0x7FFFFFFF
        for i, x in enumerate(A):
            if A[i] == B[0]:
                C = A[1:i] + A[0] + A[i+1:]
                ans = min(ans, self.solve(C, B[1:]))
        self.memo[(A, B)] = ans + 1
        return ans + 1
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 17 Jun 2018 23:19:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/17/leetcode-k-similar-strings/</guid><category>LeetCode</category></item><item><title>[LeetCode]Exam Room
</title><link>http://bookshadow.com/weblog/2018/06/17/leetcode-exam-room/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/exam-room/" target="_blank"&gt;&lt;strong&gt;LeetCode 855. Exam Room&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;In an exam room, there are &lt;code&gt;N&lt;/code&gt; seats in a single row, numbered &lt;code&gt;0, 1, 2, ..., N-1&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;When a student enters the room, they must sit in the seat that maximizes the distance to the closest person.&amp;nbsp; If there are multiple such seats, they sit in the seat with the lowest number.&amp;nbsp; (Also, if no one is in the room, then the student sits at seat number 0.)&lt;/p&gt;

&lt;p&gt;Return a class &lt;code&gt;ExamRoom(int N)&lt;/code&gt;&amp;nbsp;that exposes two functions: &lt;code&gt;ExamRoom.seat()&lt;/code&gt;&amp;nbsp;returning an &lt;code&gt;int&lt;/code&gt;&amp;nbsp;representing what seat the student sat in, and &lt;code&gt;ExamRoom.leave(int p)&lt;/code&gt;&amp;nbsp;representing that the student in seat number &lt;code&gt;p&lt;/code&gt;&amp;nbsp;now leaves the room.&amp;nbsp; It is guaranteed that any calls to &lt;code&gt;ExamRoom.leave(p)&lt;/code&gt; have a student sitting in seat &lt;code&gt;p&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&lt;span id="example-input-1-1"&gt;[&amp;quot;ExamRoom&amp;quot;,&amp;quot;seat&amp;quot;,&amp;quot;seat&amp;quot;,&amp;quot;seat&amp;quot;,&amp;quot;seat&amp;quot;,&amp;quot;leave&amp;quot;,&amp;quot;seat&amp;quot;]&lt;/span&gt;, &lt;span id="example-input-1-2"&gt;[[10],[],[],[],[],[4],[]]&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-1"&gt;[null,0,9,4,2,null,5]&lt;/span&gt;
&lt;span&gt;&lt;strong&gt;Explanation&lt;/strong&gt;:
ExamRoom(10) -&amp;gt; null
seat() -&amp;gt; 0, no one is in the room, then the student sits at seat number 0.
seat() -&amp;gt; 9, the student sits at the last seat number 9.
seat() -&amp;gt; 4, the student sits at the last seat number 4.
seat() -&amp;gt; 2, the student sits at the last seat number 2.
leave(4) -&amp;gt; null
seat() -&amp;gt; 5, the student​​​​​​​ sits at the last seat number 5.&lt;/span&gt;
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= N &amp;lt;= 10^9&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;ExamRoom.seat()&lt;/code&gt; and &lt;code&gt;ExamRoom.leave()&lt;/code&gt; will be called at most &lt;code&gt;10^4&lt;/code&gt; times across all test cases.&lt;/li&gt;
	&lt;li&gt;Calls to &lt;code&gt;ExamRoom.leave(p)&lt;/code&gt; are guaranteed to have a student currently sitting in seat number &lt;code&gt;p&lt;/code&gt;.&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;房间里有一排N个座位，编号为0, 1, 2, ..., N-1。&lt;/p&gt;

&lt;p&gt;学生进入房间时选择距离最近的人最远的位置就坐。当存在多个满足条件的座位时，选择标号最小的。&lt;/p&gt;

&lt;p&gt;学生也可以离开座位。&lt;/p&gt;

&lt;p&gt;求每一位学生就坐时的位置。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;&lt;strong&gt;TreeSet&lt;/strong&gt;&lt;/p&gt;

&lt;p&gt;将每两个座位之间的位置视为&amp;ldquo;区间&amp;rdquo;&lt;/p&gt;

&lt;p&gt;利用一个TreeSet维护这样的区间，记为pq&lt;/p&gt;

&lt;p&gt;用另一个TreeSet维护当前被占用的座位标号，记为seats。&lt;/p&gt;

&lt;p&gt;对于leave操作，seats可以用O(log n)的代价找到某座位相邻的座位。并将两个区间合二为一。&lt;/p&gt;

&lt;p&gt;对于seat操作，可以通过pq获取当前的最大区间，将区间一分为二。&lt;/p&gt;

&lt;h2&gt;Java代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-java"&gt;import java.awt.Point;
import java.util.TreeSet;

class ExamRoom {

    private int N;
    private TreeSet&amp;lt;Integer&amp;gt; seats = new TreeSet&amp;lt;&amp;gt;();
    private TreeSet&amp;lt;Point&amp;gt; pq = new TreeSet&amp;lt;&amp;gt;(
            (Point p1, Point p2) -&amp;gt; {
                int d1 = getDistance(p1);
                int d2 = getDistance(p2);
                if (d1 == d2) {
                    return p1.x - p2.x; 
                }
                return d2 - d1;
            });

    public ExamRoom(int N) {
        this.N = N;
        seats.add(-1);
        seats.add(N);
        pq.add(new Point(-1, N));
    }
    
    private int getDistance(Point p) {
        int mid = getMid(p.x, p.y);
        if (p.x &amp;lt; 0) {
            return p.y - mid;
        } else if (p.y == this.N) {
            return mid - p.x;            
        }
        return Math.min(p.y - mid, mid - p.x);
    }
    
    private int getMid(int left, int right) {
        if (left &amp;lt; 0) return 0;
        if (right == this.N) return this.N - 1;
        return (left + right) / 2;
    }
    
    public int seat() {
        Point p = pq.pollFirst();
        int left = p.x, right = p.y;
        int mid = getMid(left, right);
        seats.add(mid);
        pq.add(new Point(left, mid));
        pq.add(new Point(mid, right));
        return mid;
    }
    
    public void leave(int p) {
        int left = seats.lower(p);
        int right = seats.higher(p);
        seats.remove(p);
        pq.remove(new Point(left, p));
        pq.remove(new Point(p, right));
        pq.add(new Point(left, right));
    }
}

/**
 * Your ExamRoom object will be instantiated and called as such:
 * ExamRoom obj = new ExamRoom(N);
 * int param_1 = obj.seat();
 * obj.leave(p);
 */
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 17 Jun 2018 21:51:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/17/leetcode-exam-room/</guid><category>LeetCode</category></item><item><title>[LeetCode]Car Fleet
</title><link>http://bookshadow.com/weblog/2018/06/17/leetcode-car-fleet/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/car-fleet/" target="_blank"&gt;&lt;strong&gt;LeetCode 853. Car Fleet&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;&lt;code&gt;N&lt;/code&gt; cars are going to the same destination along a one lane road.&amp;nbsp; The destination is &lt;code&gt;target&lt;/code&gt;&amp;nbsp;miles away.&lt;/p&gt;

&lt;p&gt;Each car &lt;code&gt;i&lt;/code&gt;&amp;nbsp;has a constant speed &lt;code&gt;speed[i]&lt;/code&gt;&amp;nbsp;(in miles per hour), and initial position &lt;code&gt;position[i]&lt;/code&gt;&amp;nbsp;miles towards the target along the road.&lt;/p&gt;

&lt;p&gt;A car can never pass another car ahead of it, but it can catch up to it, and drive bumper to bumper at the same speed.&lt;/p&gt;

&lt;p&gt;The distance between these two cars is ignored - they are assumed to have the same position.&lt;/p&gt;

&lt;p&gt;A &lt;em&gt;car fleet&lt;/em&gt; is some non-empty set of cars driving&amp;nbsp;at the same position and same speed.&amp;nbsp; Note that a single car is also a car fleet.&lt;/p&gt;

&lt;p&gt;If a car catches up to a car fleet right at the destination point, it will&amp;nbsp;still be&amp;nbsp;considered as one car fleet.&lt;/p&gt;

&lt;p&gt;How many car fleets will arrive at the destination?&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;target = &lt;span id="example-input-1-1"&gt;12&lt;/span&gt;, position = &lt;span id="example-input-1-2"&gt;[10,8,0,5,3]&lt;/span&gt;, speed = &lt;span id="example-input-1-3"&gt;[2,4,1,1,3]&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-1"&gt;3&lt;/span&gt;
&lt;strong&gt;Explanation&lt;/strong&gt;:
The cars starting at 10 and 8 become a fleet, meeting each other at 12.
The car starting at 0 doesn&amp;#39;t catch up to any other car, so it is a fleet by itself.
The cars starting at 5 and 3 become a fleet, meeting each other at 6.
Note that no other cars meet these fleets before the destination, so the answer is 3.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= N &amp;lt;= 10 ^ 4&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt; target&amp;nbsp;&amp;lt;= 10 ^ 6&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;&amp;nbsp;speed[i] &amp;lt;= 10 ^ 6&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= position[i] &amp;lt; target&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;All initial positions are different.&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;x轴有若干车辆，坐标为整数数组position，每个车辆的速度为speed。&lt;/p&gt;

&lt;p&gt;当后车追上前车时，两车为一组，以前车的速度继续前进；多车的情况以此类推。&lt;/p&gt;

&lt;p&gt;求车辆在到达target时，会有多少组。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;排序（Sort）&lt;/p&gt;

&lt;p&gt;按照起点倒序，到达目标的预计时间（不考虑多车相遇）为正序对车辆进行排序，记为status。&lt;/p&gt;

&lt;p&gt;初始令时间ctime为0，计数器ans为0&lt;/p&gt;

&lt;p&gt;遍历status，当时间t &amp;gt; ctime时（表示后车不会与前车相遇）：更新ctime，并令ans+1&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def carFleet(self, target, position, speed):
        """
        :type target: int
        :type position: List[int]
        :type speed: List[int]
        :rtype: int
        """
        status = [(-p, float(target - p) / s) for p, s in zip(position, speed)]
        status.sort()
        ctime = 0
        ans = 0
        for p, t in status:
            if t &amp;gt; ctime:
                ans += 1
                ctime = t
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 17 Jun 2018 21:11:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/17/leetcode-car-fleet/</guid><category>LeetCode</category></item><item><title>[LeetCode]Shortest Path Visiting All Nodes
</title><link>http://bookshadow.com/weblog/2018/06/03/leetcode-shortest-path-visiting-all-nodes/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/shortest-path-visiting-all-nodes/" target="_blank"&gt;&lt;strong&gt;LeetCode 847. Shortest Path Visiting All Nodes&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;An undirected, connected graph of N nodes (labeled&amp;nbsp;&lt;code&gt;0, 1, 2, ..., N-1&lt;/code&gt;) is given as &lt;code&gt;graph&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;&lt;code&gt;graph.length = N&lt;/code&gt;, and &lt;code&gt;j != i&lt;/code&gt;&amp;nbsp;is in the list&amp;nbsp;&lt;code&gt;graph[i]&lt;/code&gt;&amp;nbsp;exactly once, if and only if nodes &lt;code&gt;i&lt;/code&gt; and &lt;code&gt;j&lt;/code&gt; are connected.&lt;/p&gt;

&lt;p&gt;Return the length of the shortest path that visits every node. You may start and stop at any node, you may revisit nodes multiple times, and you may reuse edges.&lt;/p&gt;

&lt;ol&gt;
&lt;/ol&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[[1,2,3],[0],[0],[0]]
&lt;strong&gt;Output: &lt;/strong&gt;4
&lt;strong&gt;Explanation&lt;/strong&gt;: One possible path is [1,0,2,0,3]&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[[1],[0,2,4],[1,3,4],[2],[1,2]]
&lt;strong&gt;Output: &lt;/strong&gt;4
&lt;strong&gt;Explanation&lt;/strong&gt;: One possible path is [0,1,4,2,3]
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= graph.length &amp;lt;= 12&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= graph[i].length &amp;lt;&amp;nbsp;graph.length&lt;/code&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定无向图graph，求可以遍历所有点的最短路径&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;Floyd + 动态规划（Dynamic Programming）&lt;/p&gt;

&lt;p&gt;时间复杂度 O(2^n * n^2）&lt;/p&gt;

&lt;pre&gt;
利用Floyd求出每对顶点i, j之间的最短距离，记为dp[i][j]，代价为O(N^3)

利用status[s][i]记录：状态为s，当前所在节点为i时的最小路径长度

状态s是二进制，表示各节点是否被访问过，1表示已访问，0表示未访问

状态转移方程：

status[ns][j] = min(status[ns][j], status[s][i] + dp[i][j])

其中ns表示从状态s的i点出发到达j点时的新状态&lt;/pre&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def shortestPathLength(self, graph):
        """
        :type graph: List[List[int]]
        :rtype: int
        """
        INF = 0x7FFFFFFF
        N = len(graph)
        dp = [[INF] * N for x in range(N)]
        for i, e in enumerate(graph):
            dp[i][i] = 0
            for j in e:
                dp[i][j] = dp[j][i] = 1
        for z in range(N):
            for x in range(N):
                for y in range(N):
                    dp[x][y] = min(dp[x][y], dp[x][z] + dp[z][y])

        status = {(0, i) : 0 for i in range(N)}        
        for s in range(1 &amp;lt;&amp;lt; N):
            for i in range(N):
                if (s, i) not in status: continue
                v = status[(s, i)]
                for j in range(N):
                    ns = s | (1 &amp;lt;&amp;lt; j)
                    if status.get((ns, j), INF) &amp;gt; v + dp[i][j]:
                        status[(ns, j)] = v + dp[i][j]
        return min(status[((1 &amp;lt;&amp;lt; N) - 1, i)] for i in range(N))
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;比赛时只想到了Floyd + DFS + 剪枝的解法&lt;/p&gt;

&lt;p&gt;由于该解法的时间复杂度为O(N!)，因此TLE&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def shortestPathLength(self, graph):
        """
        :type graph: List[List[int]]
        :rtype: int
        """
        INF = 0x7FFFFFFF
        N = len(graph)
        dp = [[INF] * N for x in range(N)]
        for i, e in enumerate(graph):
            dp[i][i] = 0
            for j in e:
                dp[i][j] = dp[j][i] = 1
        for z in range(N):
            for x in range(N):
                for y in range(N):
                    dp[x][y] = min(dp[x][y], dp[x][z] + dp[z][y])

        self.best = INF
        visits = set()
        def dfs(s, c, t):
            if t &amp;gt;= self.best: return
            if c == N:
                self.best = min(self.best, t)
                return
            for n in range(N):
                if n in visits: continue
                visits.add(n)
                dfs(n, c + 1, t + dp[s][n])
                visits.remove(n)
        
        for n in range(len(graph)):
            visits.add(n)
            dfs(n, 1, 0)
            visits.remove(n)
        return self.best
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 03 Jun 2018 18:19:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/03/leetcode-shortest-path-visiting-all-nodes/</guid><category>LeetCode</category></item><item><title>[LeetCode]Longest Mountain in Array
</title><link>http://bookshadow.com/weblog/2018/06/03/leetcode-longest-mountain-in-array/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/longest-mountain-in-array/" target="_blank"&gt;&lt;strong&gt;LeetCode 845. Longest Mountain in Array&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Let&amp;#39;s call any (contiguous) subarray B (of A)&amp;nbsp;a &lt;em&gt;mountain&lt;/em&gt; if the following properties hold:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;B.length &amp;gt;= 3&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;There exists some &lt;code&gt;0 &amp;lt; i&amp;nbsp;&amp;lt; B.length - 1&lt;/code&gt; such that &lt;code&gt;B[0] &amp;lt; B[1] &amp;lt; ... B[i-1] &amp;lt; B[i] &amp;gt; B[i+1] &amp;gt; ... &amp;gt; B[B.length - 1]&lt;/code&gt;&lt;/li&gt;
&lt;/ul&gt;

&lt;p&gt;(Note that B could be any subarray of A, including the entire array A.)&lt;/p&gt;

&lt;p&gt;Given an array &lt;code&gt;A&lt;/code&gt;&amp;nbsp;of integers,&amp;nbsp;return the length of the longest&amp;nbsp;&lt;em&gt;mountain&lt;/em&gt;.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;Return &lt;code&gt;0&lt;/code&gt; if there is no mountain.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[2,1,4,7,3,2,5]
&lt;strong&gt;Output: &lt;/strong&gt;5
&lt;strong&gt;Explanation: &lt;/strong&gt;The largest mountain is [1,4,7,3,2] which has length 5.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[2,2,2]
&lt;strong&gt;Output: &lt;/strong&gt;0
&lt;strong&gt;Explanation: &lt;/strong&gt;There is no mountain.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= A.length &amp;lt;= 10000&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= A[i] &amp;lt;= 10000&lt;/code&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;求数组中的最长&amp;ldquo;山峰&amp;rdquo;的长度&lt;/p&gt;

&lt;p&gt;&amp;ldquo;山峰&amp;rdquo;的定义为：存在 0 &amp;lt; i &amp;lt; B.length - 1 使得 B[0] &amp;lt; B[1] &amp;lt; ... B[i-1] &amp;lt; B[i] &amp;gt; B[i+1] &amp;gt; ... &amp;gt; B[B.length - 1]&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;分别从左往右、从右往左遍历数组&lt;/p&gt;

&lt;p&gt;辅助数组left记录某数字左侧的最长递增子串的长度&lt;/p&gt;

&lt;p&gt;辅助数组right记录数字右侧的最长递减子串的长度&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def longestMountain(self, A):
        """
        :type A: List[int]
        :rtype: int
        """
        SA = len(A)
        left, right = [0] * SA, [0] * SA
        for x in range(1, SA):
            if A[x] &amp;gt; A[x - 1]:
                left[x] = left[x - 1] + 1
        ans = 0
        for x in range(SA - 2, -1, -1):
            if A[x] &amp;gt; A[x + 1]:
                right[x] = right[x + 1] + 1
            if left[x] and right[x]:
                ans = max(ans, left[x] + right[x] + 1)
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 03 Jun 2018 18:09:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/03/leetcode-longest-mountain-in-array/</guid><category>LeetCode</category></item><item><title>[LeetCode]Hand of Straights
</title><link>http://bookshadow.com/weblog/2018/06/03/leetcode-hand-of-straights/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/hand-of-straights/" target="_blank"&gt;&lt;strong&gt;LeetCode 846. Hand of Straights&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Alice has a hand of cards, given as an array of integers.&lt;/p&gt;

&lt;p&gt;Now she wants to rearrange the cards into groups so that each group is size W, and consists of W consecutive cards.&lt;/p&gt;

&lt;p&gt;Return true if and only if she can.&lt;/p&gt;

&lt;ol&gt;
&lt;/ol&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;hand = [1,2,3,6,2,3,4,7,8], W = 3
&lt;strong&gt;Output: &lt;/strong&gt;true
&lt;strong&gt;Explanation:&lt;/strong&gt; Alice&amp;#39;s hand can be rearranged as [1,2,3],[2,3,4],[6,7,8].&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;hand = [1,2,3,4,5], W = 4
&lt;strong&gt;Output: &lt;/strong&gt;false
&lt;strong&gt;Explanation:&lt;/strong&gt; Alice&amp;#39;s hand can&amp;#39;t be rearranged into groups of 4.&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= hand.length &amp;lt;= 10000&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= hand[i]&amp;nbsp;&amp;lt;= 10^9&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= W &amp;lt;= hand.length&lt;/code&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定一副扑克牌，判断其是否可以分成若干组，使得每一组包含W张连续排列的牌。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;时间复杂度：O(N^2 / W)&lt;/p&gt;

&lt;p&gt;用字典handDict统计各张牌的个数&lt;/p&gt;

&lt;p&gt;每次从handDict中最小的key开始枚举W个元素，若发现不存在的元素，则返回False&lt;/p&gt;

&lt;p&gt;否则返回True&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def isNStraightHand(self, hand, W):
        """
        :type hand: List[int]
        :type W: int
        :rtype: bool
        """
        handDict = collections.Counter(hand)
        while handDict:
            mink = min(handDict.keys())
            for y in range(mink, mink + W):
                if not handDict[y]: return False
                handDict[y] -= 1
                if not handDict[y]: del handDict[y]
        return True
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 03 Jun 2018 18:03:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/03/leetcode-hand-of-straights/</guid><category>LeetCode</category></item><item><title>[LeetCode]Backspace String Compare
</title><link>http://bookshadow.com/weblog/2018/06/03/leetcode-backspace-string-compare/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/backspace-string-compare/" target="_blank"&gt;&lt;strong&gt;LeetCode 844. Backspace String Compare&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Given two&amp;nbsp;strings&amp;nbsp;&lt;code&gt;S&lt;/code&gt;&amp;nbsp;and &lt;code&gt;T&lt;/code&gt;,&amp;nbsp;return if they are equal when both are typed into empty text editors. &lt;code&gt;#&lt;/code&gt; means a backspace character.&lt;/p&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;S = &lt;span id="example-input-1-1"&gt;&amp;quot;ab#c&amp;quot;&lt;/span&gt;, T = &lt;span id="example-input-1-2"&gt;&amp;quot;ad#c&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-1"&gt;true
&lt;/span&gt;&lt;span&gt;&lt;strong&gt;Explanation&lt;/strong&gt;: Both S and T become &amp;quot;ac&amp;quot;.&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;S = &lt;span id="example-input-2-1"&gt;&amp;quot;ab##&amp;quot;&lt;/span&gt;, T = &lt;span id="example-input-2-2"&gt;&amp;quot;c#d#&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-2"&gt;true
&lt;/span&gt;&lt;span&gt;&lt;strong&gt;Explanation&lt;/strong&gt;: Both S and T become &amp;quot;&amp;quot;.&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;S = &lt;span id="example-input-3-1"&gt;&amp;quot;a##c&amp;quot;&lt;/span&gt;, T = &lt;span id="example-input-3-2"&gt;&amp;quot;#a#c&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-3"&gt;true
&lt;/span&gt;&lt;span&gt;&lt;strong&gt;Explanation&lt;/strong&gt;: Both S and T become &amp;quot;c&amp;quot;.&lt;/span&gt;
&lt;/pre&gt;

&lt;div&gt;
&lt;p&gt;&lt;strong&gt;Example 4:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;S = &lt;span id="example-input-4-1"&gt;&amp;quot;a#c&amp;quot;&lt;/span&gt;, T = &lt;span id="example-input-4-2"&gt;&amp;quot;b&amp;quot;&lt;/span&gt;
&lt;strong&gt;Output: &lt;/strong&gt;&lt;span id="example-output-4"&gt;false
&lt;/span&gt;&lt;span&gt;&lt;strong&gt;Explanation&lt;/strong&gt;: S becomes &amp;quot;c&amp;quot; while T becomes &amp;quot;b&amp;quot;.&lt;/span&gt;
&lt;/pre&gt;

&lt;p&gt;&lt;span&gt;&lt;strong&gt;Note&lt;/strong&gt;:&lt;/span&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;&lt;span&gt;1 &amp;lt;= S.length &amp;lt;= 200&lt;/span&gt;&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;&lt;span&gt;1 &amp;lt;= T.length &amp;lt;= 200&lt;/span&gt;&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;span&gt;&lt;code&gt;S&lt;/code&gt;&amp;nbsp;and &lt;code&gt;T&lt;/code&gt; only contain&amp;nbsp;lowercase letters and &lt;code&gt;&amp;#39;#&amp;#39;&lt;/code&gt; characters.&lt;/span&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定字符串S和T，其中的#表示退格&lt;/p&gt;

&lt;p&gt;求S是否和T相等&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;栈（Stack）&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def backspaceCompare(self, S, T):
        """
        :type S: str
        :type T: str
        :rtype: bool
        """
        def toString(S):
            ans = []
            for c in S:
                if c == '#': ans and ans.pop()
                else: ans.append(c)
            return ''.join(ans)
        return toString(S) == toString(T)
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 03 Jun 2018 17:33:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/06/03/leetcode-backspace-string-compare/</guid><category>LeetCode</category></item><item><title>[LeetCode]Unique Letter String
</title><link>http://bookshadow.com/weblog/2018/05/06/leetcode-unique-letter-string/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/unique-letter-string/" target="_blank"&gt;&lt;strong&gt;LeetCode 828. Unique Letter String&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;A character is unique in string &lt;code&gt;S&lt;/code&gt; if it occurs exactly once in it.&lt;/p&gt;

&lt;p&gt;For example, in string &lt;code&gt;S = &amp;quot;LETTER&amp;quot;&lt;/code&gt;, the only unique characters are &lt;code&gt;&amp;quot;L&amp;quot;&lt;/code&gt; and &lt;code&gt;&amp;quot;R&amp;quot;&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;Let&amp;#39;s define &lt;code&gt;UNIQ(S)&lt;/code&gt; as the number of unique characters in string &lt;code&gt;S&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;For example, &lt;code&gt;UNIQ(&amp;quot;LETTER&amp;quot;) =&amp;nbsp; 2&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;Given a string S, calculate the sum of &lt;code&gt;UNIQ(substring)&lt;/code&gt; over all non-empty substrings of &lt;code&gt;S&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;If there are two or more equal substrings at different positions in &lt;code&gt;S&lt;/code&gt;, we consider them different.&lt;/p&gt;

&lt;p&gt;Since the answer can be very large, retrun the answer&amp;nbsp;modulo&amp;nbsp;&lt;code&gt;10 ^ 9 + 7&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;ABC&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;10
&lt;strong&gt;Explanation: &lt;/strong&gt;All possible substrings are: &amp;quot;A&amp;quot;,&amp;quot;B&amp;quot;,&amp;quot;C&amp;quot;,&amp;quot;AB&amp;quot;,&amp;quot;BC&amp;quot; and &amp;quot;ABC&amp;quot;.
Evey substring is composed with only unique letters.
Sum of lengths of all substring is 1 + 1 + 1 + 2 + 2 + 3 = 10&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;ABA&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;8
&lt;strong&gt;Explanation: &lt;/strong&gt;The same as example 1, except uni(&amp;quot;ABA&amp;quot;) = 1.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt; &lt;code&gt;0 &amp;lt;= S.length &amp;lt;= 10000&lt;/code&gt;.&lt;/p&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定字符串S，求其各子串中包含的不重复字母的个数。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;字符统计&lt;/p&gt;

&lt;pre&gt;
分别统计每个字母出现的下标

假设字母letter的下标数组为idx，将-1和len(S)插入idx的头部和尾部

则sum((idx[i] - idx[i - 1]) * (idx[i + 1] - idx[i]))为letter出现的总次数&lt;/pre&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def uniqueLetterString(self, S):
        """
        :type S: str
        :rtype: int
        """
        letterIdx = collections.defaultdict(list)
        for i, c in enumerate(S): letterIdx[c].append(i)
        ans = 0
        for letter, idx in letterIdx.items():
            idx = [-1] + idx + [len(S)]
            for x in range(1, len(idx) - 1):
                ans += (idx[x] - idx[x - 1]) * (idx[x + 1] - idx[x])
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;朴素解法（Time Limit Exceeded）&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def uniqueLetterString(self, S):
        """
        :type S: str
        :rtype: int
        """
        q = [(set([c]), set([c]), i) for i, c in enumerate(S)]
        ans = len(S)
        while q:
            q0 = []
            for c, p, i in q:
                if i + 1 == len(S):
                    continue
                if S[i + 1] not in c and S[i + 1] not in p:
                    c.add(S[i + 1])
                elif S[i + 1] in c:
                    c.remove(S[i + 1])
                    p.add(S[i + 1])
                q0.append((c, p, i + 1))
                ans += len(q0[-1][0])
            q = q0
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 06 May 2018 19:53:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/05/06/leetcode-unique-letter-string/</guid><category>LeetCode</category></item><item><title>[LeetCode]Consecutive Numbers Sum
</title><link>http://bookshadow.com/weblog/2018/05/06/leetcode-consecutive-numbers-sum/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/consecutive-numbers-sum/" target="_blank"&gt;&lt;strong&gt;LeetCode 829. Consecutive Numbers Sum&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Given a positive integer&amp;nbsp;&lt;code&gt;N&lt;/code&gt;, how many ways can we write it as a sum of&amp;nbsp;consecutive positive integers?&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;5
&lt;strong&gt;Output: &lt;/strong&gt;2
&lt;strong&gt;Explanation: &lt;/strong&gt;5 = 5 = 2 + 3&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;9
&lt;strong&gt;Output: &lt;/strong&gt;3
&lt;strong&gt;Explanation: &lt;/strong&gt;9 = 9 = 4 + 5 = 2 + 3 + 4&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;15
&lt;strong&gt;Output: &lt;/strong&gt;4
&lt;strong&gt;Explanation: &lt;/strong&gt;15 = 15 = 8 + 7 = 4 + 5 + 6 = 1 + 2 + 3 + 4 + 5&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&lt;/strong&gt;&amp;nbsp;&lt;code&gt;1 &amp;lt;= N &amp;lt;= 10 ^ 9&lt;/code&gt;.&lt;/p&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定正整数N，将其表示为若干连续整数之和。求可以找到多少种这样的组合。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;枚举连续整数的个数c&lt;/p&gt;

&lt;pre&gt;
当c为奇数时， floor(N / c) 为第(c + 1) / 2个数

当c为偶数时，floor(N / c)为第c / 2个数

综上，floor(N / c)为第c / 2 + c % 2个数，并且floor(N / c) &amp;ge; c / 2 + c % 2&lt;/pre&gt;

&lt;p&gt;c符合下列两种情况时，存在一组长度为c的连续整数和为N&lt;/p&gt;

&lt;pre&gt;
c为奇数，并且N可以整除c

c为偶数，并且floor(N / c) * c + c / 2 == N&lt;/pre&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def consecutiveNumbersSum(self, N):
        """
        :type N: int
        :rtype: int
        """
        ans = c = 0
        while True:
            c += 1
            if N / c &amp;lt; c / 2 + c % 2:
                break
            if c % 2 and N % c == 0:
                ans += 1
            elif c % 2 == 0 and (N / c) * c + c / 2 == N:
                ans += 1
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 06 May 2018 19:42:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/05/06/leetcode-consecutive-numbers-sum/</guid><category>LeetCode</category></item><item><title>[LeetCode]Masking Personal Information
</title><link>http://bookshadow.com/weblog/2018/05/06/leetcode-masking-personal-information/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/masking-personal-information/" target="_blank"&gt;&lt;strong&gt;LeetCode 831. Masking Personal Information&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;We are given a&amp;nbsp;personal information string &lt;code&gt;S&lt;/code&gt;, which may represent&amp;nbsp;either &lt;strong&gt;an email address&lt;/strong&gt; or &lt;strong&gt;a phone number.&lt;/strong&gt;&lt;/p&gt;

&lt;p&gt;We would like to mask this&amp;nbsp;personal information according to the&amp;nbsp;following rules:&lt;/p&gt;

&lt;p&gt;&lt;u&gt;&lt;strong&gt;1. Email address:&lt;/strong&gt;&lt;/u&gt;&lt;/p&gt;

&lt;p&gt;We define a&amp;nbsp;&lt;strong&gt;name&lt;/strong&gt; to be a string of &lt;code&gt;length &amp;ge; 2&lt;/code&gt; consisting&amp;nbsp;of only lowercase letters&amp;nbsp;&lt;code&gt;a-z&lt;/code&gt; or uppercase&amp;nbsp;letters&amp;nbsp;&lt;code&gt;A-Z&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;An email address starts with a name, followed by the&amp;nbsp;symbol &lt;code&gt;&amp;#39;@&amp;#39;&lt;/code&gt;, followed by a name, followed by the&amp;nbsp;dot&amp;nbsp;&lt;code&gt;&amp;#39;.&amp;#39;&lt;/code&gt;&amp;nbsp;and&amp;nbsp;followed by a name.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;All email addresses are&amp;nbsp;guaranteed to be valid and in the format of&amp;nbsp;&lt;code&gt;&amp;quot;name1@name2.name3&amp;quot;.&lt;/code&gt;&lt;/p&gt;

&lt;p&gt;To mask an email, &lt;strong&gt;all names must be converted to lowercase&lt;/strong&gt; and &lt;strong&gt;all letters between the first and last letter of the first name&lt;/strong&gt; must be replaced by 5 asterisks &lt;code&gt;&amp;#39;*&amp;#39;&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;&lt;u&gt;&lt;strong&gt;2. Phone number:&lt;/strong&gt;&lt;/u&gt;&lt;/p&gt;

&lt;p&gt;A phone number is a string consisting of&amp;nbsp;only the digits &lt;code&gt;0-9&lt;/code&gt; or the characters from the set &lt;code&gt;{&amp;#39;+&amp;#39;, &amp;#39;-&amp;#39;, &amp;#39;(&amp;#39;, &amp;#39;)&amp;#39;, &amp;#39;&amp;nbsp;&amp;#39;}.&lt;/code&gt;&amp;nbsp;You may assume a phone&amp;nbsp;number contains&amp;nbsp;10 to 13 digits.&lt;/p&gt;

&lt;p&gt;The last 10 digits make up the local&amp;nbsp;number, while the digits before those make up the country code. Note that&amp;nbsp;the country code is optional. We want to expose only the last 4 digits&amp;nbsp;and mask all other&amp;nbsp;digits.&lt;/p&gt;

&lt;p&gt;The local&amp;nbsp;number&amp;nbsp;should be formatted and masked as &lt;code&gt;&amp;quot;***-***-1111&amp;quot;,&amp;nbsp;&lt;/code&gt;where &lt;code&gt;1&lt;/code&gt; represents the exposed digits.&lt;/p&gt;

&lt;p&gt;To mask a phone number with country code like &lt;code&gt;&amp;quot;+111 111 111 1111&amp;quot;&lt;/code&gt;, we write it in the form &lt;code&gt;&amp;quot;+***-***-***-1111&amp;quot;.&lt;/code&gt;&amp;nbsp; The &lt;code&gt;&amp;#39;+&amp;#39;&lt;/code&gt;&amp;nbsp;sign and the first &lt;code&gt;&amp;#39;-&amp;#39;&lt;/code&gt;&amp;nbsp;sign before the local number should only exist if there is a country code.&amp;nbsp; For example, a 12 digit phone number mask&amp;nbsp;should start&amp;nbsp;with &lt;code&gt;&amp;quot;+**-&amp;quot;&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;Note that extraneous characters like &lt;code&gt;&amp;quot;(&amp;quot;, &amp;quot;)&amp;quot;, &amp;quot; &amp;quot;&lt;/code&gt;, as well as&amp;nbsp;extra dashes or plus signs not part of the above formatting scheme should be removed.&lt;/p&gt;

&lt;p&gt;Return the correct &amp;quot;mask&amp;quot; of the information provided.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;LeetCode@LeetCode.com&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;l*****e@leetcode.com&amp;quot;
&lt;strong&gt;Explanation:&amp;nbsp;&lt;/strong&gt;All names are converted to lowercase, and the letters between the
&amp;nbsp;            first and last letter of the first name is replaced by 5 asterisks.
&amp;nbsp;            Therefore, &amp;quot;leetcode&amp;quot; -&amp;gt; &amp;quot;l*****e&amp;quot;.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;AB@qq.com&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;a*****b@qq.com&amp;quot;
&lt;strong&gt;Explanation:&amp;nbsp;&lt;/strong&gt;There must be 5 asterisks between the first and last letter 
&amp;nbsp;            of the first name &amp;quot;ab&amp;quot;. Therefore, &amp;quot;ab&amp;quot; -&amp;gt; &amp;quot;a*****b&amp;quot;.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;1(234)567-890&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;***-***-7890&amp;quot;
&lt;strong&gt;Explanation:&lt;/strong&gt;&amp;nbsp;10 digits in the phone number, which means all digits make up the local number.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 4:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;86-(10)12345678&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;+**-***-***-5678&amp;quot;
&lt;strong&gt;Explanation:&lt;/strong&gt;&amp;nbsp;12 digits, 2 digits for country code and 10 digits for local number. 
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Notes:&lt;/strong&gt;&lt;/p&gt;

&lt;ol&gt;
	&lt;li&gt;&lt;code&gt;S.length&amp;nbsp;&amp;lt;=&amp;nbsp;40&lt;/code&gt;.&lt;/li&gt;
	&lt;li&gt;Emails have length at least 8.&lt;/li&gt;
	&lt;li&gt;Phone numbers have length at least 10.&lt;/li&gt;
&lt;/ol&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定电子邮箱或者电话号码，将其中的部分数字按照一定规则转化为*，只保留末尾的4位数字&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;字符串处理&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def maskPII(self, S):
        """
        :type S: str
        :rtype: str
        """
        if '@' in S:
            left, right = S.lower().split('@')
            return left[0] + '*****' + left[-1] + '@' + right
        digits = re.sub('\D*', '', S)
        countryCode = len(digits) - 10
        return (countryCode and '+' + '*' * countryCode + '-' or '') + '***-***-' + digits[-4:]
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 06 May 2018 14:38:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/05/06/leetcode-masking-personal-information/</guid><category>LeetCode</category></item><item><title>[LeetCode]Positions of Large Groups
</title><link>http://bookshadow.com/weblog/2018/05/06/leetcode-positions-of-large-groups/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/positions-of-large-groups/" target="_blank"&gt;&lt;strong&gt;LeetCode 830. Positions of Large Groups&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;In a string&amp;nbsp;&lt;code&gt;S&lt;/code&gt;&amp;nbsp;of lowercase letters, these letters form consecutive groups of the same character.&lt;/p&gt;

&lt;p&gt;For example, a string like &lt;code&gt;S = &amp;quot;abbxxxxzyy&amp;quot;&lt;/code&gt; has the groups &lt;code&gt;&amp;quot;a&amp;quot;&lt;/code&gt;, &lt;code&gt;&amp;quot;bb&amp;quot;&lt;/code&gt;, &lt;code&gt;&amp;quot;xxxx&amp;quot;&lt;/code&gt;, &lt;code&gt;&amp;quot;z&amp;quot;&lt;/code&gt; and&amp;nbsp;&lt;code&gt;&amp;quot;yy&amp;quot;&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;Call a group &lt;em&gt;large&lt;/em&gt; if it has 3 or more characters.&amp;nbsp; We would like the starting and ending positions of every large group.&lt;/p&gt;

&lt;p&gt;The final answer should be in lexicographic order.&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;abbxxxxzzy&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;[[3,6]]
&lt;strong&gt;Explanation&lt;/strong&gt;: &lt;code&gt;&amp;quot;xxxx&amp;quot; is the single &lt;/code&gt;large group with starting  3 and ending positions 6.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;abc&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;[]
&lt;strong&gt;Explanation&lt;/strong&gt;: We have &amp;quot;a&amp;quot;,&amp;quot;b&amp;quot; and &amp;quot;c&amp;quot; but no large group.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;abcdddeeeeaabbbcd&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;[[3,5],[6,9],[12,14]]&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Note:&amp;nbsp;&lt;/strong&gt;&amp;nbsp;&lt;code&gt;1 &amp;lt;= S.length &amp;lt;= 1000&lt;/code&gt;&lt;/p&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定字符串S，求其中所有连续出现次数大于3次的字母的起止位置。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;双指针法（Two Pointers）&lt;/p&gt;

&lt;p&gt;遍历S，前后&amp;ldquo;指针&amp;rdquo;维护连续字符的起止下标&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def largeGroupPositions(self, S):
        """
        :type S: str
        :rtype: List[List[int]]
        """
        j = -1
        d = ''
        ans = []
        for i, c in enumerate(S + '#'):
            if c != d:
                if i - j &amp;gt;= 3:
                    ans.append([j, i - 1])
                j = i
            d = c
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 06 May 2018 14:35:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/05/06/leetcode-positions-of-large-groups/</guid><category>LeetCode</category></item><item><title>[LeetCode]Making A Large Island
</title><link>http://bookshadow.com/weblog/2018/04/29/leetcode-making-a-large-island/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/making-a-large-island/" target="_blank"&gt;&lt;strong&gt;LeetCode 827. Making A Large Island&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;In a 2D grid of &lt;code&gt;0&lt;/code&gt;s and &lt;code&gt;1&lt;/code&gt;s, we change at most one &lt;code&gt;0&lt;/code&gt; to a &lt;code&gt;1&lt;/code&gt;.&lt;/p&gt;

&lt;p&gt;After, what is the size of the largest island?&amp;nbsp;(An island is a 4-directionally connected group of &lt;code&gt;1&lt;/code&gt;s).&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[[1, 0], [0, 1]]
&lt;strong&gt;Output:&lt;/strong&gt; 3
&lt;strong&gt;Explanation:&lt;/strong&gt; Change one 0 to 1 and connect two 1s, then we get an island with area = 3.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[[1, 1], [1, 0]]
&lt;strong&gt;Output:&lt;/strong&gt; 4
&lt;strong&gt;Explanation: &lt;/strong&gt;Change the 0 to 1 and make the island bigger, only one island with area = 1.&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[[1, 1], [1, 1]]
&lt;strong&gt;Output:&lt;/strong&gt; 4
&lt;strong&gt;Explanation:&lt;/strong&gt; Can&amp;#39;t change any 0 to 1, only one island with area = 1.&lt;/pre&gt;

&lt;p&gt;Notes:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= grid.length = grid[0].length &amp;lt;= 50&lt;/code&gt;.&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;0 &amp;lt;= grid[i][j] &amp;lt;= 1&lt;/code&gt;.&lt;/li&gt;
&lt;/ul&gt;

&lt;p&gt;Notes:&lt;/p&gt;

&lt;p&gt;1 &amp;lt;= grid.length = grid[0].length &amp;lt;= 50.&lt;br /&gt;
0 &amp;lt;= grid[i][j] &amp;lt;= 1.&lt;/p&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定二维01矩阵，其中互相连通的1表示岛屿。&lt;/p&gt;

&lt;p&gt;求最大的岛屿面积。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;广度优先搜索（BFS）&lt;/p&gt;

&lt;pre&gt;
利用辅助二维数组mark记录grid中的元素属于哪个岛屿

遍历grid，利用BFS标记其中的岛屿，将非0元素替换为其连通区域的大小，并在mark中记录其标号，记录并更新最大值

再次遍历grid，尝试将0元素上下左右的岛屿进行加和，记录并更新最大值&lt;/pre&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def largestIsland(self, grid):
        """
        :type grid: List[List[int]]
        :rtype: int
        """
        h, w = len(grid), len(grid[0])
        mark = [[0] * w for x in range(h)]
        
        def neighbors(x, y):
            for dx, dy in zip((1, 0, -1, 0), (0, 1, 0, -1)):
                nx, ny = x + dx, y + dy
                if 0 &amp;lt;= nx &amp;lt; h and 0 &amp;lt;= ny &amp;lt; w and grid[nx][ny]:
                    yield (nx, ny)

        def calcAndMarkArea(sx, sy, mk):
            q = [(sx, sy)]
            vset = set(q)
            ans = 0
            while q:
                x, y = q.pop(0)
                ans += 1
                for nx, ny in neighbors(x, y):
                    if (nx, ny) not in vset:
                        vset.add((nx, ny))
                        q.append((nx, ny))
            for x, y in vset:
                mark[x][y] = mk
                grid[x][y] = ans
            return ans

        maxArea = 0
        mk = 0
        for x in range(h):
            for y in range(w):
                if grid[x][y] and not mark[x][y]:
                    mk += 1
                    maxArea = max(calcAndMarkArea(x, y, mk), maxArea)

        for x in range(h):
            for y in range(w):
                if grid[x][y] == 0:
                    area = 0
                    mkset = set()
                    for nx, ny in neighbors(x, y):
                        if mark[nx][ny] not in mkset:
                            mkset.add(mark[nx][ny])
                            area += grid[nx][ny]
                    maxArea = max(maxArea, area + 1)
        return maxArea
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 29 Apr 2018 15:44:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/04/29/leetcode-making-a-large-island/</guid><category>LeetCode</category></item><item><title>[LeetCode]Most Profit Assigning Work
</title><link>http://bookshadow.com/weblog/2018/04/29/leetcode-most-profit-assigning-work/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/most-profit-assigning-work/" target="_blank"&gt;&lt;strong&gt;LeetCode 826. Most Profit Assigning Work&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;We have jobs: &lt;code&gt;difficulty[i]&lt;/code&gt;&amp;nbsp;is the difficulty of the&amp;nbsp;&lt;code&gt;i&lt;/code&gt;th job, and&amp;nbsp;&lt;code&gt;profit[i]&lt;/code&gt;&amp;nbsp;is the profit of the&amp;nbsp;&lt;code&gt;i&lt;/code&gt;th job.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;Now we have some workers.&amp;nbsp;&lt;code&gt;worker[i]&lt;/code&gt;&amp;nbsp;is the ability of the&amp;nbsp;&lt;code&gt;i&lt;/code&gt;th worker, which means that this worker can only complete a job with difficulty at most&amp;nbsp;&lt;code&gt;worker[i]&lt;/code&gt;.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;Every worker can be assigned at most one job, but one job&amp;nbsp;can be completed multiple times.&lt;/p&gt;

&lt;p&gt;For example, if 3 people attempt the same job that pays $1, then the total profit will be $3.&amp;nbsp; If a worker cannot complete any job, his profit is $0.&lt;/p&gt;

&lt;p&gt;What is the most profit we can make?&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;difficulty = [2,4,6,8,10], profit = [10,20,30,40,50], worker = [4,5,6,7]
&lt;strong&gt;Output: &lt;/strong&gt;100 
&lt;strong&gt;Explanation: W&lt;/strong&gt;orkers are assigned jobs of difficulty [4,4,6,6] and they get profit of [20,20,30,30] seperately.&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Notes:&lt;/strong&gt;&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= difficulty.length = profit.length &amp;lt;= 10000&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= worker.length &amp;lt;= 10000&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;difficulty[i], profit[i], worker[i]&lt;/code&gt;&amp;nbsp; are in range&amp;nbsp;&lt;code&gt;[1, 10^5]&lt;/code&gt;&lt;/li&gt;
&lt;/ul&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定一组任务的难度difficulty及其收益profit，有一组工人最多可以处理难度为worker的任务。&lt;/p&gt;

&lt;p&gt;每一个任务可以执行多次，每一个工人只能执行一个任务，求最大总收益。&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;贪心（Greedy Algorithm）&lt;/p&gt;

&lt;p&gt;每个工人都选择不大于其难度上限的最大收益的任务&lt;/p&gt;

&lt;p&gt;问题即转化为求范围内的最大值&lt;/p&gt;

&lt;h2&gt;Python代码:&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def maxProfitAssignment(self, difficulty, profit, worker):
        """
        :type difficulty: List[int]
        :type profit: List[int]
        :type worker: List[int]
        :rtype: int
        """
        diffPro = collections.defaultdict(int)
        for diff, pro in zip(difficulty, profit):
            diffPro[diff] = max(diffPro[diff], pro)
        maxVal = 0
        for x in range(min(difficulty + worker), max(difficulty + worker) + 1):
            diffPro[x] = max(diffPro[x], maxVal)
            maxVal = max(diffPro[x], maxVal)
        return sum(diffPro[w] for w in worker)
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 29 Apr 2018 15:38:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/04/29/leetcode-most-profit-assigning-work/</guid><category>LeetCode</category></item><item><title>[LeetCode]Friends Of Appropriate Ages
</title><link>http://bookshadow.com/weblog/2018/04/29/leetcode-friends-of-appropriate-ages/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/friends-of-appropriate-ages/" target="_blank"&gt;&lt;strong&gt;LeetCode 825. Friends Of Appropriate Ages&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;Some people will make friend requests. The&amp;nbsp;list of their ages is given and&amp;nbsp;&lt;code&gt;ages[i]&lt;/code&gt;&amp;nbsp;is the age of the&amp;nbsp;ith person.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;Person A will NOT friend request person B (B != A) if any of the following conditions are true:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;age[B]&amp;nbsp;&amp;lt;= 0.5 * age[A]&amp;nbsp;+ 7&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;age[B]&amp;nbsp;&amp;gt; age[A]&lt;/code&gt;&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;age[B]&amp;nbsp;&amp;gt; 100 &amp;amp;&amp;amp;&amp;nbsp;age[A]&amp;nbsp;&amp;lt; 100&lt;/code&gt;&lt;/li&gt;
&lt;/ul&gt;

&lt;p&gt;Otherwise, A will friend request B.&lt;/p&gt;

&lt;p&gt;Note that if&amp;nbsp;A requests B, B does not necessarily request A.&amp;nbsp; Also, people will not friend request themselves.&lt;/p&gt;

&lt;p&gt;How many total friend requests are made?&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[16,16]
&lt;strong&gt;Output: &lt;/strong&gt;2
&lt;strong&gt;Explanation: &lt;/strong&gt;2 people friend request each other.
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[16,17,18]
&lt;strong&gt;Output: &lt;/strong&gt;2
&lt;strong&gt;Explanation: &lt;/strong&gt;Friend requests are made 17 -&amp;gt; 16, 18 -&amp;gt; 17.&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 3:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;[20,30,100,110,120]
&lt;strong&gt;Output: &lt;/strong&gt;
&lt;strong&gt;Explanation: &lt;/strong&gt;Friend requests are made 110 -&amp;gt; 100, 120 -&amp;gt; 110, 120 -&amp;gt; 100.
&lt;/pre&gt;

&lt;p&gt;Notes:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= ages.length&amp;nbsp;&amp;lt;= 20000&lt;/code&gt;.&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= ages[i] &amp;lt;= 120&lt;/code&gt;.&lt;/li&gt;
&lt;/ul&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;给定一组人的年龄，尝试为每个人匹配朋友，规则如下。&lt;/p&gt;

&lt;p&gt;如果出现下列情况之一，则A和B不可以成为朋友：&lt;/p&gt;

&lt;pre&gt;
age[B] &amp;lt;= 0.5 * age[A] + 7

age[B] &amp;gt; age[A]

age[B] &amp;gt; 100 &amp;amp;&amp;amp; age[A] &amp;lt; 100&lt;/pre&gt;

&lt;p&gt;求最多可以匹配多少组朋友关系&lt;/p&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;观察题设条件 1 &amp;lt;= ages[i] &amp;lt;= 120，年龄的范围很小&lt;/p&gt;

&lt;p&gt;统计每一个年龄的人数&lt;/p&gt;

&lt;p&gt;遍历每个人，统计符合其年龄条件约束的人数之和&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def numFriendRequests(self, ages):
        """
        :type ages: List[int]
        :rtype: int
        """
        cnt = collections.Counter(ages)
        ans = 0
        for age in ages:
            cnt[age] -= 1
            left, right = age / 2 + 8, age
            ans += sum(cnt[age] for age in range(left, right + 1))
            cnt[age] += 1
        return ans
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 29 Apr 2018 15:33:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/04/29/leetcode-friends-of-appropriate-ages/</guid><category>LeetCode</category></item><item><title>[LeetCode]Goat Latin
</title><link>http://bookshadow.com/weblog/2018/04/29/leetcode-goat-latin/</link><description>
&lt;h2&gt;题目描述：&lt;/h2&gt;

&lt;p&gt;&lt;a href="https://leetcode.com/problems/goat-latin/" target="_blank"&gt;&lt;strong&gt;LeetCode 824. Goat Latin&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;

&lt;p&gt;A sentence &lt;code&gt;S&lt;/code&gt; is given, composed of words separated by spaces. Each word consists of lowercase and uppercase letters only.&lt;/p&gt;

&lt;p&gt;We would like to convert the sentence to &amp;quot;&lt;em&gt;Goat Latin&amp;quot;&lt;/em&gt;&amp;nbsp;(a made-up language similar to Pig Latin.)&lt;/p&gt;

&lt;p&gt;The rules of Goat Latin are as follows:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;If a word begins with a vowel (a, e, i, o, or u), append &lt;code&gt;&amp;quot;ma&amp;quot;&lt;/code&gt;&amp;nbsp;to the end of the word.&lt;br /&gt;
	For example, the word &amp;#39;apple&amp;#39; becomes &amp;#39;applema&amp;#39;.&lt;br /&gt;
	&amp;nbsp;&lt;/li&gt;
	&lt;li&gt;If a word begins with a consonant (i.e. not a vowel), remove the first letter and append it to the end, then add &lt;code&gt;&amp;quot;ma&amp;quot;&lt;/code&gt;.&lt;br /&gt;
	For example, the word &lt;code&gt;&amp;quot;goat&amp;quot;&lt;/code&gt;&amp;nbsp;becomes &lt;code&gt;&amp;quot;oatgma&amp;quot;&lt;/code&gt;.&lt;br /&gt;
	&amp;nbsp;&lt;/li&gt;
	&lt;li&gt;Add one letter &lt;code&gt;&amp;#39;a&amp;#39;&lt;/code&gt;&amp;nbsp;to the end of each word per its word index in the sentence, starting with 1.&lt;br /&gt;
	For example,&amp;nbsp;the first word gets &lt;code&gt;&amp;quot;a&amp;quot;&lt;/code&gt; added to the end, the second word gets &lt;code&gt;&amp;quot;aa&amp;quot;&lt;/code&gt; added to the end and so on.&lt;/li&gt;
&lt;/ul&gt;

&lt;p&gt;Return the&amp;nbsp;final sentence representing the conversion from &lt;code&gt;S&lt;/code&gt;&amp;nbsp;to Goat&amp;nbsp;Latin.&amp;nbsp;&lt;/p&gt;

&lt;p&gt;&lt;strong&gt;Example 1:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;I speak Goat Latin&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;Imaa peaksmaaa oatGmaaaa atinLmaaaaa&amp;quot;
&lt;/pre&gt;

&lt;p&gt;&lt;strong&gt;Example 2:&lt;/strong&gt;&lt;/p&gt;

&lt;pre&gt;
&lt;strong&gt;Input: &lt;/strong&gt;&amp;quot;The quick brown fox jumped over the lazy dog&amp;quot;
&lt;strong&gt;Output: &lt;/strong&gt;&amp;quot;heTmaa uickqmaaa rownbmaaaa oxfmaaaaa umpedjmaaaaaa overmaaaaaaa hetmaaaaaaaa azylmaaaaaaaaa ogdmaaaaaaaaaa&amp;quot;
&lt;/pre&gt;

&lt;p&gt;Notes:&lt;/p&gt;

&lt;ul&gt;
	&lt;li&gt;&lt;code&gt;S&lt;/code&gt; contains only uppercase, lowercase and spaces.&amp;nbsp;Exactly one space between each word.&lt;/li&gt;
	&lt;li&gt;&lt;code&gt;1 &amp;lt;= S.length &amp;lt;= 100&lt;/code&gt;.&lt;/li&gt;
&lt;/ul&gt;

&lt;h2&gt;题目大意：&lt;/h2&gt;

&lt;p&gt;将句子S中的单词按照如下规则进行转换：&lt;/p&gt;

&lt;pre&gt;
如果单词首字母是元音，在单词末尾添加ma

否则，将单词首字母移动至末尾，并添加ma

对于第i个单词，在其末尾添加i个a&lt;/pre&gt;

&lt;h2&gt;解题思路：&lt;/h2&gt;

&lt;p&gt;字符串模拟&lt;/p&gt;

&lt;h2&gt;Python代码：&lt;/h2&gt;

&lt;pre&gt;
&lt;code class="language-python"&gt;class Solution(object):
    def toGoatLatin(self, S):
        """
        :type S: str
        :rtype: str
        """
        ans = []
        for idx, word in enumerate(S.split()):
            latin = word
            if word[0].lower() not in 'aeiou':
                latin = word[1:] + word[0]
            latin += 'ma' + 'a' * (idx + 1)
            ans.append(latin)
        return ' '.join(ans)
&lt;/code&gt;&lt;/pre&gt;

&lt;p&gt;&amp;nbsp;&lt;/p&gt;

</description><author>qinjiannet@sina.com (在线疯狂)</author><pubDate>Sun, 29 Apr 2018 15:27:00 +0800</pubDate><guid>http://bookshadow.com/weblog/2018/04/29/leetcode-goat-latin/</guid><category>LeetCode</category></item></channel></rss>