import { createFeatureSelector, createSelector } from "@ngrx/store";
import { RequestState } from "./request.states";

export const selectRequestState = createFeatureSelector<RequestState>('request');

export const selectRequests = createSelector(
  selectRequestState,
  (state) => state.demandes
);