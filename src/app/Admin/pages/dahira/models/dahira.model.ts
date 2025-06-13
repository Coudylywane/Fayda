import { LocationInfo } from "src/app/features/auth/models/user.model";
import { User } from "./user.model";

export interface Dahira {
    id: string;
    name: string;
    memberCount: number;
    location?: string;
    responsible?: User;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum MemberRole {
    DISCIPLE = 'DISCIPLE',
    MOUKHADAM = 'MOUKHADAM',
    RESPONSIBLE = 'RESPONSIBLE'
  }
  
  export interface DahiraMember {
    userId: string;
    dahiraId: string;
    user: User;
    role: MemberRole;
    joinedAt: Date;
  }

export interface CreateDahira{
  dahiraName: string,
  email: string,
  phoneNumber: string,
  numberOfDisciples: number,
  location: {
    country: string,
    region: string,
    department: string,
    nationality?: string,
    address: string
  },
  createdByUserId?: string
}