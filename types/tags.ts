export interface TagsItem {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | string; // adjust as needed
  description: string;
  isDeleted: boolean | null;
  questions: any[]; // use a more specific type if known
  categories: any[]; // use a more specific type if known
}


