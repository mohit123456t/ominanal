import { BarChart3, Users, ThumbsUp, MessageCircle } from 'lucide-react';
import type { Kpi, Post } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const kpis: Kpi[] = [
  {
    title: 'Followers',
    value: '45,231',
    change: '+20.1%',
    changeType: 'increase',
    icon: Users,
  },
  {
    title: 'Engagement Rate',
    value: '2.3%',
    change: '+5.2%',
    changeType: 'increase',
    icon: ThumbsUp,
  },
  {
    title: 'Impressions',
    value: '1.2M',
    change: '+12.5%',
    changeType: 'increase',
    icon: BarChart3,
  },
  {
    title: 'Comments',
    value: '1,200',
    change: '-2.1%',
    changeType: 'decrease',
    icon: MessageCircle,
  },
];

export const followerGrowthData = [
  { date: 'Jan 22', followers: 2890 },
  { date: 'Feb 22', followers: 2756 },
  { date: 'Mar 22', followers: 3322 },
  { date: 'Apr 22', followers: 3470 },
  { date: 'May 22', followers: 3475 },
  { date: 'Jun 22', followers: 3129 },
  { date: 'Jul 22', followers: 3490 },
  { date: 'Aug 22', followers: 3680 },
  { date: 'Sep 22', followers: 4102 },
  { date: 'Oct 22', followers: 4250 },
  { date: 'Nov 22', followers: 4500 },
  { date: 'Dec 22', followers: 4860 },
];

export const engagementRateData = [
    { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
    { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
];

export const reachAndImpressionsData = [
  { month: 'January', reach: 2400, impressions: 4500 },
  { month: 'February', reach: 1398, impressions: 3200 },
  { month: 'March', reach: 9800, impressions: 12000 },
  { month: 'April', reach: 3908, impressions: 5800 },
  { month: 'May', reach: 4800, impressions: 7000 },
  { month: 'June', reach: 3800, impressions: 6500 },
];

const postImage1 = PlaceHolderImages.find(img => img.id === 'post-image-1');
const postImage2 = PlaceHolderImages.find(img => img.id === 'post-image-2');
const postImage3 = PlaceHolderImages.find(img => img.id === 'post-image-3');
const postImage4 = PlaceHolderImages.find(img => img.id === 'post-image-4');
const postImage5 = PlaceHolderImages.find(img => img.id === 'post-image-5');

export const recentPosts: Post[] = [
  {
    id: '1',
    userId: 'mock-user',
    platform: 'instagram',
    content: 'Just launched our new collection! Check it out. #newarrivals #fashion',
    mediaUrl: postImage1?.imageUrl,
    likes: 1203,
    comments: 89,
    shares: 45,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'mock-user',
    platform: 'x',
    content: 'Exciting news coming soon! Stay tuned. #announcement',
    likes: 302,
    comments: 25,
    shares: 102,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'mock-user',
    platform: 'facebook',
    content:
      'We are looking back at our journey and feeling grateful for all the support. Here are some of our favorite moments from this year. Thank you for being a part of our community!',
    mediaUrl: postImage2?.imageUrl,
    likes: 874,
    comments: 102,
    shares: 67,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'mock-user',
    platform: 'instagram',
    content: 'Our holiday sale is now LIVE! 🎄 Up to 50% off on selected items. Link in bio!',
    mediaUrl: postImage4?.imageUrl,
    likes: 2451,
    comments: 341,
    shares: 129,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
  {
    id: '5',
    userId: 'mock-user',
    platform: 'facebook',
    content: 'A deep dive into our creative process. Learn how we bring our ideas to life.',
    mediaUrl: postImage3?.imageUrl,
    likes: 456,
    comments: 34,
    shares: 22,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
   {
    id: '6',
    userId: 'mock-user',
    platform: 'x',
    content: 'What features would you like to see next? Let us know in the replies!',
    likes: 150,
    comments: 88,
    shares: 12,
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
  },
];
