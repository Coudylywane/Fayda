import { AdminRequestState } from "../Admin/pages/demandes/store/demande.state";
import { ProjectState } from "../Admin/pages/projets/store/project.state";
import { AuthState } from "../features/auth/store/auth.state";
import { DahiraState } from "../features/dahiras/store/dahira.state";
import { RequestState } from "../features/demandes/store/request.states";

// Interface représentant l'état global de l'application
export interface AppState {
  auth: AuthState;
  dahira: DahiraState,
  request: RequestState,
  adminRequest: AdminRequestState,
  project: ProjectState
}