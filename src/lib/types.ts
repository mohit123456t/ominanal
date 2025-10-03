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
    accessToken?: string; // For Twitter App-only
    accessTokenSecret?: string; // For Twitter App-only
    createdAt: string;
    updatedAt: string;
}

// Represents a single connected social media account
export type SocialMediaAccount = {
    id: string;
    userId: string;
    platform: 'Instagram' | 'Facebook' | 'YouTube' | 'Twitter';
    credentialsId: string; // Link to the PlatformCredentials document
    username: string;
    accessToken: string; // The user/page-specific access token for making API calls
    refreshToken?: string;
    pageAccessToken?: string;
    instagramId?: string;
    facebookPageId?: string;
    facebookPageName?: string;
    connected: boolean;
    createdAt: string;
    updatedAt: string;
};
