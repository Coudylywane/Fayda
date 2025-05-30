import { createReducer, on } from '@ngrx/store';
import * as RequestActions from './request.actions';
import { initialState } from './request.states';

export const requestReducer = createReducer(
  initialState,
  on(RequestActions.loadRequests, state => ({
    ...state,
    loading: true,
    error: null
    })),
  on(RequestActions.loadRequestsSuccess, (state, { request }) => ({
    ...state,
    loading: false,
    demandes: request
  })),
  on(RequestActions.loadRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
