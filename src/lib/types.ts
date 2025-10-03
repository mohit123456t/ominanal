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

export type SocialMediaAccount = {
    id: string;
    userId: string;
    platform: 'Instagram' | 'Facebook' | 'YouTube' | 'Twitter';
    username: string;
    apiKey: string; // User's access token for OAuth, or API Key for Twitter
    apiSecret?: string; // For platforms like Twitter or for holding Client Secret for OAuth
    accessToken?: string; // For platforms like Twitter (user's access token)
    accessTokenSecret?: string; // For platforms like Twitter
    refreshToken?: string; // For OAuth2 platforms like YouTube/Google
    instagramId?: string; // Specific ID for Instagram Graph API
    facebookPageId?: string; // Specific ID for Facebook Graph API
    facebookPageName?: string; // Display name of the linked Facebook Page
    connected?: boolean;
    createdAt: string;
    updatedAt: string;
    clientId?: string; // User-provided Client ID for OAuth
    clientSecret?: string; // User-provided Client Secret for OAuth
};
