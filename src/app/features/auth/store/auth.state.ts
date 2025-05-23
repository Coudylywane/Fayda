import { Token } from "../models/auth.model";
import { User } from "../models/user.model";

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    token: Token | null;
}

export const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,    
    token: null
};