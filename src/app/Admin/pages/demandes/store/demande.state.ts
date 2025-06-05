import { RequestDto } from "src/app/features/demandes/models/request.model";

export interface AdminRequestState {
    demandes: RequestDto[];
    loading: boolean;
    error: string | null;
}

export const initialState: AdminRequestState = {
    demandes: [],
    loading: false,
    error: null,
};