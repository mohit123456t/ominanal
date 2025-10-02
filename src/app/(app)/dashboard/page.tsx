'use client';
import {
  Card,
  CardContent,
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
import { Badge } from '@/components/ui/badge';
import { kpis, followerGrowthData, engagementRateData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Dot, LoaderCircle } from 'lucide-react';
import { FollowerGrowthChart, EngagementRateChart } from '@/components/charts';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { type Post } from '@/lib/types';


function SocialIcon({ platform }: { platform: 'x' | 'facebook' | 'instagram' }) {
  const logo = PlaceHolderImages.find(
    (p) => p.id === `${platform}-logo`
  );
  if (!logo) return null;
  return <Image src={logo.imageUrl} alt={`${platform} logo`} width={20} height={20} data-ai-hint={logo.imageHint} className="rounded-full" />;
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const postsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/posts`);
  }, [user, firestore]);

  const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsCollection);
  
  const bestPosts = posts
    ? [...posts]
        .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 5)
    : [];

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

      <div className="grid gap-4 md:grid-cols-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Best Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPosts ? (
             <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead className="text-center">Platform</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {post.mediaUrl && (
                           <Image
                              src={post.mediaUrl}
                              alt="Post image"
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                              data-ai-hint={post.imageHint}
                           />
                        )}
                        <span className="font-medium line-clamp-2">{post.content}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <SocialIcon platform={post.platform} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{post.likes.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{post.comments.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{post.shares.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
