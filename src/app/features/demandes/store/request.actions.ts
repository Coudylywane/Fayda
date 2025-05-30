import { createAction, props } from '@ngrx/store';
import { Request } from '../models/request.model';

export const loadRequests = createAction(
  '[Requests] Load Request',
  props<{ userId: string }>()
);

export const loadRequestsSuccess = createAction(
  '[Requests] Load Request Success',
  props<{ request: Request[] }>()
);

export const loadRequestsFailure = createAction(
  '[Requests] Load Request Failure',
  props<{ error: string }>()
);
