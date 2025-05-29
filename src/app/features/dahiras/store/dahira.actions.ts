import { createAction, props } from '@ngrx/store';
import { Dahira } from '../models/dahira.model';

export const loadDahiras = createAction(
  '[Dahira] Load Dahiras',
  props<{ page: number; size: number }>()
);

export const loadDahirasSuccess = createAction(
  '[Dahira] Load Dahiras Success',
  props<{ dahiras: Dahira[] }>()
);

export const loadDahirasFailure = createAction(
  '[Dahira] Load Dahiras Failure',
  props<{ error: string }>()
);
