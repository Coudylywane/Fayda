// src/app/store/dahira/dahira.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as DahiraActions from './dahira.actions';
import { catchError, from, map, mergeMap, of } from 'rxjs';
import { DahiraApiService } from '../services/dahira-api.service';

@Injectable()
export class DahiraEffects {
    constructor(
        private actions$: Actions
    ) { }

    loadDahiras$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DahiraActions.loadDahiras),
            mergeMap(action =>
                from(DahiraApiService.getPaginatedDahiras(action.page, action.size)).pipe(
                    mergeMap((response) => {
                        console.log("resultat Dahiras: ", response.data.data);
                        const {currentPage, totalElements, size, totalPages} = response.data.data;

                        return of(DahiraActions.loadDahirasSuccess({ dahiras: response.data.data.content, currentPage, totalElements, size, totalPages }));
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Login error:', error);
                        return of(DahiraActions.loadDahirasFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );
}
