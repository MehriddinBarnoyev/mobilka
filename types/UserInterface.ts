// types/User.ts

export interface UserResponse {
  createdBy: string;
  createdDate: string; // ISO date string
  lastModifiedBy: string;
  lastModifiedDate: string; // ISO date string
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  designedName: string;
  imageUrl: string | null;
  activated: boolean;
  langKey: string;
  pinCode: string | null;
  agreedToTerms: boolean;
  authorities: string[];
  passwordReset: boolean;
}
