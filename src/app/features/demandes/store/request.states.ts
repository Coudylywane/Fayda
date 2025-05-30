import { Request } from "../models/request.model";

export interface RequestState {
    demandes: Request[];
    loading: boolean;
    error: string | null;
}

export const initialState: RequestState = {
    demandes: [],
    loading: false,
    error: null,
};