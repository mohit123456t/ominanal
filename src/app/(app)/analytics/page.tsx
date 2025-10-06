'use client';
import { useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import { LoaderCircle, Users, ThumbsUp, MessageCircle, BarChart3 } from 'lucide-react';
import {
  EngagementRateChart,
} from '@/components/charts';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { type Post, type Kpi, type EngagementData } from '@/lib/types';


export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const postsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/posts`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsCollection);
  
  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  }, [posts]);

  const bestPosts = useMemo(() => sortedPosts.slice(0, 3), [sortedPosts]);
  const worstPosts = useMemo(() => sortedPosts.slice(-3).reverse(), [sortedPosts]);

  const realKpis: Omit<Kpi, 'change' | 'changeType'>[] = useMemo(() => {
    if (!posts) {
      return [
        { title: 'Total Likes', value: '0', icon: ThumbsUp },
        { title: 'Total Comments', value: '0', icon: MessageCircle },
        { title: 'Total Impressions', value: '0', icon: BarChart3 },
      ];
    }
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalImpressions = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    return [
       { title: 'Total Likes', value: totalLikes.toLocaleString(), icon: ThumbsUp },
       { title: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: BarChart3 },
       { title: 'Total Comments', value: totalComments.toLocaleString(), icon: MessageCircle },
    ];
  }, [posts]);

  const engagementByPlatform: EngagementData[] = useMemo(() => {
    if (!posts) return [];
    const dataByPlatform = posts.reduce((acc, post) => {
        if (!acc[post.platform]) {
            acc[post.platform] = { platform: post.platform, likes: 0, comments: 0 };
        }
        acc[post.platform].likes += post.likes;
        acc[post.platform].comments += post.comments;
        return acc;
    }, {} as Record<string, EngagementData>);

    return Object.values(dataByPlatform);
  }, [posts]);


  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {realKpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingPosts ? <LoaderCircle className="h-6 w-6 animate-spin"/> : kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                Total from all posts
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Platform</CardTitle>
             <CardDescription>Real data from your posts.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoadingPosts ? (
                <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <EngagementRateChart data={engagementByPlatform} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoadingPosts ? (
               <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
             ) : (
                <PostTable posts={bestPosts} />
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worst Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPosts ? (
               <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
             ) : (
                <PostTable posts={worstPosts} />
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostTable({ posts }: { posts: Post[] }) {
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
                 {post.mediaUrl && (
                         <Image
                            src={post.mediaUrl}
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
