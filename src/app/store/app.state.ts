import { AuthState } from "../features/auth/store/auth.state";
import { DahiraState } from "../features/dahiras/store/dahira.state";

// Interface représentant l'état global de l'application
export interface AppState {
  auth: AuthState;
  dahira: DahiraState
}