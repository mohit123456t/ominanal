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
  comments: number;
};

export type Post = {
  id: string;
  userId: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'twitter';
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

// Represents the credentials for a platform's API
export type PlatformCredentials = {
    id: string;
    userId: string;
    platform: 'Instagram' | 'YouTube' | 'Twitter';
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    apiSecret?: string;
    createdAt: string;
    updatedAt: string;
}

// Represents a single connected social media account
export type SocialMediaAccount = {
    id: string;
    userId: string;
    platform: 'Instagram' | 'Facebook' | 'YouTube' | 'Twitter';
    username: string;
    accessToken: string; // The user-specific access token (long-lived for Insta/FB)
    refreshToken?: string; // For YouTube
    pageAccessToken?: string; // For Instagram/Facebook Page
    instagramId?: string;
    facebookPageId?: string;
    facebookPageName?: string;
    apiKey?: string; // For Twitter
    apiSecret?: string; // For Twitter
    accessTokenSecret?: string; // For Twitter
    connected: boolean;
    createdAt: string;
    updatedAt: string;
};

    