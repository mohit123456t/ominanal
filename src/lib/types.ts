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
  platform: string;
  likes: number;
};

export type Post = {
  id: string;
  userId: string;
  platform: 'facebook' | 'instagram' | 'youtube';
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
    platform: 'Instagram' | 'Facebook' | 'YouTube';
    username: string;
    apiKey: string;
    apiSecret?: string;
    refreshToken?: string;
    instagramId?: string; // Specific ID for Instagram Graph API
    facebookPageId?: string; // Specific ID for Facebook Graph API
    connected?: boolean;
    createdAt: string;
    updatedAt: string;
};

    
