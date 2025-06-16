import { ActionReducerMap } from '@ngrx/store';
import { AppState } from './app.state';
import { usersReducer } from './store/users.reducer';

export const reducers: ActionReducerMap<AppState> = {
  users: usersReducer
};

export { AppState } from './app.state';