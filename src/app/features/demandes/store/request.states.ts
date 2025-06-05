import { RequestDto } from "../models/request.model";

export interface RequestState {
    demandes: RequestDto[];
    demandeAdhesion: RequestDto[];
    loading: boolean;
    error: string | null;
}

export const initialState: RequestState = {
    demandes: [],
    demandeAdhesion: [],
    loading: false,
    error: null,
};