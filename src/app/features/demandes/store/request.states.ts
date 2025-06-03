import { Request } from "../models/request.model";

export interface RequestState {
    demandes: Request[];
    demandeAdhesion: Request[];
    loading: boolean;
    error: string | null;
}

export const initialState: RequestState = {
    demandes: [],
    demandeAdhesion: [],
    loading: false,
    error: null,
};