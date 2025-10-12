export interface VideoItem {
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  id: any;
  title: string;
  description: string;
  url: string;
  watermark: boolean;
  offlineAccess: boolean;
  duration: number; // in seconds
  expiryDays: number;
  status: 'ACTIVE' | 'INACTIVE' | string; // string fallback
  orderNumber: number;
  isGroup: boolean;
  ownerId: number;
  coverImage: string | null;
  coverImgUrl: string;
  users: any[]; // specify more strictly if needed
  eduGroups: any[]; // specify more strictly if needed
}

export type VideoList = VideoItem[];

export type VideoItemWithPlayback = VideoItem & {
  otp: string;
  playbackInfo: string;
  coverImageUrl: string | null;
  expirationDate: string;
};
