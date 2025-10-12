type Member = {
  id: number;
  login: string | null;
  password: string | null;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  activated: boolean | null;
  designedName: string | null;
  langKey: string | null;
  imageUrl: string | null;
  lastLoginDate: string | null;
  isDeleted: boolean | null;
  tenant: any | null;
};

type Video = any; // Replace `any` with actual structure if known

export type Group = {
    code: string | undefined;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  id: number;
  name: string;
  label: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE'; // Add other statuses if they exist
  description: string;
  isGroup: boolean;
  ownerId: number | null;
  members: Member[];
  videos: Video[];
};
