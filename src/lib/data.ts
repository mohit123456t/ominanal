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
