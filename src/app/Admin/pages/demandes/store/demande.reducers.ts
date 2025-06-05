import { createReducer, on } from '@ngrx/store';
import * as AdminRequestActions from './demande.actions'
import { initialState } from './demande.state';

export const adminRequestReducer = createReducer(
  initialState,
  on(AdminRequestActions.loadAdminRequests, state => ({
    ...state,
    loading: true,
    error: null
    })),
  on(AdminRequestActions.loadAdminRequestsSuccess, (state, { request }) => ({
    ...state,
    loading: false,
    demandes: request
  })),
  on(AdminRequestActions.loadAdminRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
