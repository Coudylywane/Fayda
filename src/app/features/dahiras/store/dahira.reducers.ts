import { createReducer, on } from '@ngrx/store';
import * as DahiraActions from './dahira.actions';
import { initialState } from './dahira.state';

export const dahiraReducer = createReducer(
  initialState,
  on(DahiraActions.loadDahiras, state => ({
    ...state,
    loading: true
    })),
  on(DahiraActions.loadDahirasSuccess, (state, { dahiras }) => ({
    ...state,
    loading: false,
    dahiras
  })),
  on(DahiraActions.loadDahirasFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
