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


// export interface User {
//   userId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   userIdKeycloak: string;
//   phoneNumber: string;
//   gender: string;
//   dateOfBirth: Date | string;
//   locationInfo?: LocationInfo;
//   dahira?: Dahira;
//   mouqadam?: User;
//   disciples?: User[];
//   roles: string[];
//   isActive: boolean;
// }

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


export interface Dahira {
    dahiraId: string;
    name: string;
    description?: string;
    location?: string;
}