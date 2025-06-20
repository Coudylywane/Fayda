import { createReducer, on } from '@ngrx/store';
import * as ProjectActions from './project.actions';
import { initialState } from './project.state';

export const projectReducer = createReducer(
  initialState,
  on(ProjectActions.loadProjects, state => ({
    ...state,
    loading: true,
    error: null
    })),
  on(ProjectActions.loadProjectsSuccess, ProjectActions.loadActiveProjectsSuccess, (state, { projects }) => ({
    ...state,
    loading: false,
    projects
  })),
  on(ProjectActions.loadProjectsFailure, ProjectActions.loadActiveProjectsFailure,(state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
);
