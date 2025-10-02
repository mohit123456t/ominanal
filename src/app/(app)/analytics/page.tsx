import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  kpis,
  followerGrowthData,
  engagementRateData,
  reachAndImpressionsData,
  recentPosts,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  FollowerGrowthChart,
  EngagementRateChart,
  ReachAndImpressionsChart,
} from '@/components/charts';
import Image from 'next/image';

function SocialIcon({ platform }: { platform: 'x' | 'facebook' | 'instagram' }) {
  const iconUrl = `/icons/${platform}.svg`;
  // Simple display for demo. In a real app, you'd use SVGs or an icon library.
  return <span className="text-2xl">{platform.charAt(0).toUpperCase()}</span>;
}

export default function AnalyticsPage() {
  const sortedPosts = [...recentPosts].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
  const bestPosts = sortedPosts.slice(0, 3);
  const worstPosts = sortedPosts.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p
                className={cn(
                  'text-xs text-muted-foreground flex items-center',
                  kpi.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {kpi.changeType === 'increase' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                {kpi.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Reach & Impressions</CardTitle>
            <CardDescription>
              A look at your content's visibility over the past months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReachAndImpressionsChart data={reachAndImpressionsData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowerGrowthChart data={followerGrowthData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementRateChart data={engagementRateData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <PostTable posts={bestPosts} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worst Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <PostTable posts={worstPosts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostTable({ posts }: { posts: typeof recentPosts }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead className="text-right">Likes</TableHead>
          <TableHead className="text-right">Comments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <div className="flex items-start gap-3">
                 {post.imageUrl && (
                         <Image
                            src={post.imageUrl}
                            alt="Post image"
                            width={40}
                            height={40}
                            className="rounded-md object-cover mt-1"
                            data-ai-hint={post.imageHint}
                         />
                      )}
                <span className="font-medium line-clamp-3">{post.content}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">{post.likes.toLocaleString()}</TableCell>
            <TableCell className="text-right">{post.comments.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
