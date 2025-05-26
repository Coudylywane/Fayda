import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthApi } from '../services/auth.api';
import { jwtDecode } from "jwt-decode";
import { User } from '../models/user.model';

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions) { }

login$ = createEffect(() =>
    this.actions$.pipe(
        ofType(AuthActions.login),
        mergeMap((action) =>
            from(AuthApi.login(action.login)).pipe(
                mergeMap((response) => { // ✅ Utiliser mergeMap au lieu de map
                    const token = response.data?.data?.access_token;
                    console.log('Login success:', response.data);

                    // Stocker le token après succès
                    if (token) {
                        localStorage.setItem('auth_token', token);
                        console.log('Token:', token);
                        // ✅ Décodage du token pour extraire "sub"
                        const decoded = jwtDecode(token);
                        const userId = decoded.sub;

                        console.log('User ID (from token):', userId);
                        // 🔁 Appel API pour récupérer les détails de l'utilisateur
                        return from(AuthApi.getUserInfo(userId!)).pipe(
                            map((userDetailsResponse) => {
                                const user = userDetailsResponse.data.data;
                                return AuthActions.loginSuccess({ token: response.data.data, user });
                            }),
                            catchError((error) => {
                                console.error('Erreur lors de la récupération du profil utilisateur :', error);
                                const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des informations utilisateur';
                                return of(AuthActions.loginFailure({ error: errorMessage }));
                            })
                        );
                    }
                    // En cas d'absence de token
                    return of(AuthActions.loginFailure({ error: 'Token manquant après la connexion' }));
                }),
                catchError((error) => {
                    console.error('Login error:', error);
                    const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
                    return of(AuthActions.loginFailure({ error: errorMessage }));
                })
            )
        )
    )
);

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            mergeMap((action) =>
                from(AuthApi.register(action.userData)).pipe(
                    map((response) => {
                        console.log('Registration success:', response.data);

                        return AuthActions.registerSuccess({ user: response.data.data });
                    }),
                    catchError((error) => {
                        console.error('Registration error:', error);
                        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
                        return of(AuthActions.registerFailure({ error: errorMessage }));
                    })
                )
            )
        )
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            mergeMap(() =>
                from(AuthApi.logout()).pipe(
                    map(() => {
                        localStorage.removeItem('auth_token');
                        return AuthActions.logoutSuccess();
                    }),
                    catchError((error) => {
                        console.error('Logout error:', error);
                        return of(AuthActions.logoutFailure({ error: error.message }));
                    })
                )
            )
        )
    );
    
    // pour charger l'utilisateur depuis le token existant
    loadUserFromToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserFromToken),
            mergeMap(() => {
                const token = localStorage.getItem('auth_token');
                
                if (!token) {
                    return of(AuthActions.loadUserFromTokenFailure({ error: 'Aucun token trouvé' }));
                }

                try {
                    // Décoder le token pour vérifier sa validité et récupérer l'userId
                    const decoded: any = jwtDecode(token);
                    const userId = decoded.sub;
                    const now = Date.now() / 1000;

                    // Vérifier si le token n'est pas expiré
                    if (decoded.exp && decoded.exp < now) {
                        console.log('Token expiré');
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('is_admin');
                        return of(AuthActions.loadUserFromTokenFailure({ error: 'Token expiré' }));
                    }

                    console.log('Chargement des informations utilisateur depuis le token existant...');
                    
                    // Récupérer les informations de l'utilisateur
                    return from(AuthApi.getUserInfo(userId)).pipe(
                        map((userDetailsResponse) => {
                            const user = userDetailsResponse.data.data;
                            // Stocker is_admin
                            // localStorage.setItem('is_admin', user.is_admin ? 'true' : 'false');
                            console.log('Informations utilisateur chargées avec succès:', user);
                            return AuthActions.loadUserFromTokenSuccess({ token, user });
                        }),
                        catchError((error) => {
                            console.error('Erreur lors du chargement des informations utilisateur:', error);
                            const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des informations utilisateur';
                            return of(AuthActions.loadUserFromTokenFailure({ error: errorMessage }));
                        })
                    );
                } catch (error) {
                    console.error('Erreur lors du décodage du token:', error);
                    return of(AuthActions.loadUserFromTokenFailure({ error: 'Token invalide' }));
                }
            })
        )
    );
}
