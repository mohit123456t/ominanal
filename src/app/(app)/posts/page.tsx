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
import { Badge } from '@/components/ui/badge';
import { LoaderCircle, MessageCircle, ThumbsUp, Repeat, Eye, FileText, Instagram, Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { type Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const platformIcons = {
  instagram: <Instagram className="h-5 w-5 text-pink-600" />,
  facebook: <Facebook className="h-5 w-5 text-blue-700" />,
  youtube: <Youtube className="h-5 w-5 text-red-600" />,
};

export default function PostsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const postsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Order posts by creation date, newest first
    return query(collection(firestore, `users/${user.uid}/posts`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: posts, isLoading } = useCollection<Post>(postsCollection);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <FileText className="h-10 w-10 text-primary" />
         <div>
            <h1 className="text-3xl font-headline font-bold">Recent Posts</h1>
            <p className="text-muted-foreground">View and track the performance of your posts.</p>
         </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !posts || posts.length === 0 ? (
             <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-lg font-medium">No posts found.</p>
                <p className="text-muted-foreground">Get started by creating a new post!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Content</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Created</TableHead>
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
                            alt="Post media"
                            width={56}
                            height={56}
                            className="rounded-md object-cover"
                            data-ai-hint={post.imageHint || ''}
                          />
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium line-clamp-2">{post.content}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {platformIcons[post.platform]}
                        <span className="capitalize">{post.platform}</span>
                      </div>
                    </TableCell>
                     <TableCell>
                        <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                            {post.status}
                        </Badge>
                     </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1" title="Likes"><ThumbsUp className="h-4 w-4" /> {post.likes.toLocaleString()}</div>
                            <div className="flex items-center gap-1" title="Comments"><MessageCircle className="h-4 w-4" /> {post.comments.toLocaleString()}</div>
                             {post.shares > 0 && <div className="flex items-center gap-1" title="Shares"><Repeat className="h-4 w-4" /> {post.shares.toLocaleString()}</div>}
                             {post.views && post.views > 0 && <div className="flex items-center gap-1" title="Views"><Eye className="h-4 w-4" /> {post.views.toLocaleString()}</div>}
                        </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </TableCell>
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
