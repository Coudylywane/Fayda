import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AdminRequestState } from "./demande.state";
import { StatusEnum } from "src/app/features/demandes/models/request.model";

export const selectAdminRequestState = createFeatureSelector<AdminRequestState>('adminRequest');

export const selectAdminRequest = createSelector(
  selectAdminRequestState,
  (state) => state.demandes
);

export const selectAdminRequestPending = createSelector(
  selectAdminRequestState,
  (state) => state.demandes.filter(e => e.approvalStatus === StatusEnum.PENDING)
);