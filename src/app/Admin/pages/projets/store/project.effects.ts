// src/app/store/dahira/dahira.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ProjectActions from './project.actions';
import { catchError, from, map, mergeMap, of } from 'rxjs';
import { ProjectApiService } from '../services/project.api';

@Injectable()
export class ProjectEffects {
    constructor(
        private actions$: Actions
    ) { }

    loadProjects$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.loadProjects),
            mergeMap(_ =>
                from(ProjectApiService.getAllProject()).pipe(
                    mergeMap((response) => {
                        console.log("resultat Projects: ", response.data);

                        return of(ProjectActions.loadProjectsSuccess({ projects: response.data.data }));
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Projects error:', error);
                        return of(ProjectActions.loadActiveProjectsFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );

    loadActiveProjects$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectActions.loadActiveProjects),
            mergeMap(_ =>
                from(ProjectApiService.getAllActiveProject()).pipe(
                    mergeMap((response) => {
                        console.log("resultat Projects actifs: ", response.data);

                        return of(
                          ProjectActions.loadActiveProjectsSuccess({
                            projects: response.data.data.content,
                          })
                        );
                    }),
                    catchError((error) => {
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
                        console.error('Projects actifs error:', error);
                        return of(ProjectActions.loadActiveProjectsFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );
}
