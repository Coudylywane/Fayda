import { createAction, props } from '@ngrx/store';
import { RequestDto } from '../models/request.model';

export const loadRequests = createAction(
  '[Requests] Load Request',
  props<{ userId: string }>()
);

export const loadRequestsSuccess = createAction(
  '[Requests] Load Request Success',
  props<{ request: RequestDto[] }>()
);

export const loadRequestsFailure = createAction(
  '[Requests] Load Request Failure',
  props<{ error: string }>()
);

export const loadAdhesionRequests = createAction(
  '[Requests] Load Request',
  props<{ dahiraId: string }>()
);

export const loadAdhesionRequestsSuccess = createAction(
  '[Requests] Load Request Success',
  props<{ demandeAdhesion: RequestDto[] }>()
);

export const loadAdhesionRequestsFailure = createAction(
  '[Requests] Load Request Failure',
  props<{ error: string }>()
);
