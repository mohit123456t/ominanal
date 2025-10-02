export type Kpi = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
};

export type PerformanceData = {
  name: string;
  uv: number;
};

export type EngagementData = {
  name: string;
  total: number;
};

export type Post = {
  id: string;
  userId: string;
  platform: 'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  content: string;
  mediaUrl?: string;
  imageHint?: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  status: 'Published' | 'Scheduled' | 'Draft';
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
};

export type SocialMediaAccount = {
    id: string;
    userId: string;
    platform: 'Instagram' | 'Facebook' | 'X' | 'LinkedIn' | 'YouTube';
    username: string;
    apiKey: string;
    connected?: boolean;
    createdAt: string;
    updatedAt: string;
};
