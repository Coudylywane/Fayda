import { Dahira } from "../../dahiras/models/dahira.model";

export interface User {
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    phoneNumber: string,
    gender: string,
    userIdKeycloak?: string,
    dateOfBirth: string,
    createdAt: string,
    location: LocationInfo,
    active: boolean,
    updatedAt: string,
    dahira?: Dahira;
    mouqadam?: User;
    disciples?: User[];
    roles?: string[];
}

export enum UserRole {
    DISCIPLE = 'DISCIPLE',
    MOUKHADAM = 'MOUKHADAM',
    RESPONSIBLE = 'RESPONSIBLE'
}

export interface LocationInfo {
    locationInfoId: string;
    address?: string;
    region?: string;
    country?: string;
    nationality: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
}