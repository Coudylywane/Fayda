import { createReducer, on } from '@ngrx/store';
import * as ProjectActions from './project.actions';
import { initialState } from './project.state';

export const projectReducer = createReducer(
  initialState,
  on(ProjectActions.loadProjects, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProjectActions.loadActiveProjectsSuccess, (state, { projects }) => {
    console.log('[Reducer] projets reçus :', projects);
    return {
      ...state,
      loading: false,
      projects,
    };
  }),
  on(
    ProjectActions.loadProjectsFailure,
    ProjectActions.loadActiveProjectsFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  )
);
