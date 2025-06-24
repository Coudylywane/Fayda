// src/app/store/dahira/dahira.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RequestActions from './request.actions';
import { catchError, from, map, mergeMap, of } from 'rxjs';
import { RequestApiService } from '../services/request.api';

@Injectable()
export class RequestEffects {
    constructor(
        private actions$: Actions
    ) { }

    loadRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RequestActions.loadRequests),
            mergeMap(action =>
                from(RequestApiService.getRequest(action.userId)).pipe(
                    mergeMap((response) => {
                        console.log("resultat Requests: ", response.data);

                        return of(RequestActions.loadRequestsSuccess({ request: response.data.data  }));
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Login error:', error);
                        return of(RequestActions.loadRequestsFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );

    loadAdhesionRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RequestActions.loadAdhesionRequests),
            mergeMap(action =>
                from(RequestApiService.getRequestByTargetUser(action.dahiraId)).pipe(
                    mergeMap((response) => {
                        console.log("resultat demandeAdhesion: ", response.data);

                        return of(RequestActions.loadAdhesionRequestsSuccess({ demandeAdhesion: response.data.data  }));
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Login error:', error);
                        return of(RequestActions.loadRequestsFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );
}
