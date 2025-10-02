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
  platform: 'x' | 'facebook' | 'instagram';
  content: string;
  imageUrl?: string;
  imageHint?: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'Published' | 'Scheduled' | 'Draft';
};
