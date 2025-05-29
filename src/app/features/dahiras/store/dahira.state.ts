import { Dahira } from "../models/dahira.model";

export interface DahiraState {
    dahiras: Dahira[];
    loading: boolean;
    error: string | null;
    size: number,
    totalPages: number,
    currentPage: number,
    totalElements: number,
}

export const initialState: DahiraState = {
    dahiras: [],
    loading: false,
    error: null,
    size: 0,
    totalPages: 0,
    currentPage: 0,
    totalElements: 0
};