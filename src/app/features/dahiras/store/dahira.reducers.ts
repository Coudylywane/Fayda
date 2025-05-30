import { createReducer, on } from '@ngrx/store';
import * as DahiraActions from './dahira.actions';
import { initialState } from './dahira.state';

export const dahiraReducer = createReducer(
  initialState,
  on(DahiraActions.loadDahiras, state => ({
    ...state,
    loading: true,
    error: null
    })),
  on(DahiraActions.loadDahirasSuccess, (state, { dahiras, currentPage, totalPages, size, totalElements  }) => ({
    ...state,
    loading: false,
    dahiras,
    currentPage,
    totalPages,
    size,
    totalElements
  })),
  on(DahiraActions.loadDahirasFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
