import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AdminRequestState } from "./demande.state";

export const selectAdminRequestState = createFeatureSelector<AdminRequestState>('adminRequest');

export const selectAdminRequest = createSelector(
  selectAdminRequestState,
  (state) => state.demandes
);