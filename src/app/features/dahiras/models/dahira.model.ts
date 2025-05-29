import { LocationInfo, User } from "../../auth/models/user.model";

export interface Dahira {
    dahiraId: string;
    dahiraName: string;
    email: string;
    phoneNumber: string;
    numberOfDisciples: number;
    location?: LocationInfo;
    responsable?: User;
    readonly active: boolean;
}