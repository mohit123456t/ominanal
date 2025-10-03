'use client';
import { useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Dot, LoaderCircle, Users, ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import { EngagementRateChart } from '@/components/charts';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { type Post, type EngagementData, Kpi } from '@/lib/types';


function SocialIcon({ platform }: { platform: Post['platform'] }) {
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

  const realKpis: Omit<Kpi, 'change' | 'changeType'>[] = useMemo(() => {
    if (!posts) {
      return [
        { title: 'Followers', value: '45,231', icon: Users }, // Mock follower data
        { title: 'Likes', value: '0', icon: ThumbsUp },
        { title: 'Comments', value: '0', icon: MessageCircle },
        { title: 'Views', value: '0', icon: Eye },
      ];
    }
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    return [
      { title: 'Followers', value: '45,231', icon: Users }, // Mock follower data, with mock change
      { title: 'Likes', value: totalLikes.toLocaleString(), icon: ThumbsUp },
      { title: 'Comments', value: totalComments.toLocaleString(), icon: MessageCircle },
      { title: 'Views', value: totalViews.toLocaleString(), icon: Eye },
    ];
  }, [posts]);

  const engagementData: EngagementData[] = useMemo(() => {
    if (!posts) return [];
    const engagementByPlatform = posts.reduce((acc, post) => {
        if (!acc[post.platform]) {
            acc[post.platform] = { platform: post.platform, likes: 0 };
        }
        acc[post.platform].likes += post.likes;
        return acc;
    }, {} as Record<string, EngagementData>);

    return Object.values(engagementByPlatform);
  }, [posts]);


  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {realKpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingPosts && kpi.title !== 'Followers' ? <LoaderCircle className="h-6 w-6 animate-spin" /> : kpi.value}</div>
              {kpi.title === 'Followers' ? (
                <p className='text-xs text-muted-foreground flex items-center text-green-600'>
                  <ArrowUp className="h-4 w-4" />
                  +20.1% from last month
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Total from all posts</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Engagement by Platform (Likes)</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoadingPosts ? (
                <div className="flex justify-center p-8"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
             <EngagementRateChart data={engagementData} />
            )}
          </CardContent>
        </Card>
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bestPosts.slice(0,5).map((post) => (
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
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
