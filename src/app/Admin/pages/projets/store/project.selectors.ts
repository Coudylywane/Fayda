import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ProjectState } from "./project.state";

export const selectProjectState = createFeatureSelector<ProjectState>('project');

export const selectProjects = createSelector(
  selectProjectState,
  (state) => state.projects
);