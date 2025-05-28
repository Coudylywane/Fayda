import { Token } from "../models/auth.model";
import { User } from "../models/user.model";

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    token: Token | null;
    refreshing?: boolean;
    isAuthenticated: boolean;
}

export const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  refreshing: undefined,
  error: null,
  isAuthenticated: false
};