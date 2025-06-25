import { createReducer, on } from '@ngrx/store';
import * as RequestActions from './request.actions';
import { initialState } from './request.states';

export const requestReducer = createReducer(
  initialState,
  on(RequestActions.loadRequests, RequestActions.loadAdhesionRequests, state => ({
    ...state,
    loading: true,
    error: null
    })),
  on(RequestActions.loadRequestsSuccess, (state, { request }) => ({
    ...state,
    loading: false,
    demandes: request,
    error: null
  })),
  on(RequestActions.loadRequestsFailure, RequestActions.loadAdhesionRequestsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(RequestActions.loadAdhesionRequestsSuccess, (state, { demandeAdhesion }) => ({
    ...state,
    loading: false,
    demandeAdhesion,
    error: null
  }))
);
