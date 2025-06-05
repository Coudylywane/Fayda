// src/app/store/dahira/dahira.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RequestActions from './demande.actions';
import { catchError, from, map, mergeMap, of } from 'rxjs';
import { RequestApiService } from 'src/app/features/demandes/services/request.api';

@Injectable()
export class AdminRequestEffects {
    constructor(
        private actions$: Actions
    ) { }

    loadRequests$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RequestActions.loadAdminRequests),
            mergeMap(_ =>
                from(RequestApiService.getAllRequest()).pipe(
                    mergeMap((response) => {
                        console.log("resultat Requests: ", response.data);

                        return of(RequestActions.loadAdminRequestsSuccess({ request: response.data.data  }));
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Erreur de récupération:', error);
                        return of(RequestActions.loadAdminRequestsFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );
}
