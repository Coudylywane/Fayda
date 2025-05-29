import { Dahira } from "../models/dahira.model";

export interface DahiraState {
  dahiras: Dahira[];
  loading: boolean;
  error: string | null;
}

export const initialState: DahiraState = {
  dahiras: [],
  loading: false,
  error: null
};