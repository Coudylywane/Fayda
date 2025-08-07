import { Dahira } from "../../dahiras/models/dahira.model";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  img: string;
  phoneNumber: string;
  gender: string;
  userIdKeycloak?: string;
  dateOfBirth: string;
  location: LocationInfo;
  active: boolean;
  dahira?: Dahira;
  dahiraId?: string;
  mouqadamId?: string;
  disciples?: User[];
  roles?: UserRole[];
  createdAt: string;
  updatedAt: string;
  contributions?: Contribution[];
  balance: number;
  totalContributions?: number;
  totalContributionsAmount?: number;
  totalContributionsCount?: number;
}

export interface Contribution {
  id: number;
  amount: number;
  date: string;
  userId: number;
}

export enum UserRole {
    DISCIPLE = 'FAYDA_ROLE_DISCIPLE',
    MOUKHADAM = 'FAYDA_ROLE_MOUQADAM',
    ADMIN = 'FAYDA_ROLE_ADMIN',
    G_DAHIRA = 'FAYDA_ROLE_DAHIRA',
    VISITEUR = 'FAYDA_ROLE_USER',
    COLLECTE_FONDS = 'FAYDA_ROLE_COLLECTE_FONDS'
}

export interface LocationInfo {
    locationInfoId?: string;
    address?: string;
    region?: string;
    country?: string;
    nationality: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    department?: string;
}

// {
//     nationality: string,
//     country: string,
//     region: string,
//     department: string,
//     address: string
//   }


