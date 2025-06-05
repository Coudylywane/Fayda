import { createAction, props } from '@ngrx/store';
import { RequestDto } from 'src/app/features/demandes/models/request.model';

export const loadAdminRequests = createAction(
  '[AdminRequests] Load AdminRequest'
);

export const loadAdminRequestsSuccess = createAction(
  '[AdminRequests] Load AdminRequest Success',
  props<{ request: RequestDto[] }>()
);

export const loadAdminRequestsFailure = createAction(
  '[AdminRequests] Load AdminRequest Failure',
  props<{ error: string }>()
);

