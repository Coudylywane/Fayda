import { LocationInfo } from "./user.model";

export interface Login {
    username: string;
    password: string;
}

export interface Register {
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    phoneNumber: string,
    gender: string,
    dateOfBirth: string,
    location: LocationInfo
}

export interface Token {
    scope: string;
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    // not-before-policy': number;
    session_state: string;
    iat: number;
    exp: number;
};
