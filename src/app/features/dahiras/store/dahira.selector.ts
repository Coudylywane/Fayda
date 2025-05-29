import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DahiraState } from "./dahira.state";

export const selectDahiraState = createFeatureSelector<DahiraState>('dahira');

export const selectDahiras = createSelector(
  selectDahiraState,
  (state) => state.dahiras
);