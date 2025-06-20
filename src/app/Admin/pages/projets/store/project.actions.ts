import { createAction, props } from '@ngrx/store';

export const loadProjects = createAction(
  '[Projects] Load Project'
);

export const loadProjectsSuccess = createAction(
  '[Projects] Load Project Success',
  props<{ projects: any[] }>()
);

export const loadProjectsFailure = createAction(
  '[Projects] Load Project Failure',
  props<{ error: string }>()
);

export const loadActiveProjects = createAction(
  '[Projects] Load active Project'
);

export const loadActiveProjectsSuccess = createAction(
  '[Projects] Load active Project Success',
  props<{ projects: any[] }>()
);

export const loadActiveProjectsFailure = createAction(
  '[Projects] Load active Project Failure',
  props<{ error: string }>()
);
