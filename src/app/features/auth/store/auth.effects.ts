import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthApi } from '../services/auth.api';
import { jwtDecode } from "jwt-decode";
import { User, UserRole } from '../models/user.model';
import { Token } from '../models/auth.model';
import { DahiraApiService } from '../../dahiras/services/dahira-api.service';

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap((action) =>
                from(AuthApi.login(action.login)).pipe(
                    mergeMap((response) => {
                        const token: Token = response.data?.data;
                        console.log('Login success:', response.data);

                        // Stocker le token après succès
                        if (token) {
                            //Stocker le Json Web Token (JWT) dans le localStorage
                            localStorage.setItem('auth_token', JSON.stringify(token));
                            console.log('Token:', token);
                            // ✅ Décodage du token pour extraire "sub"
                            const decoded: any = jwtDecode(token.access_token);
                            const userId = decoded.sub;
                            const roles = decoded?.realm_access.roles;

                            console.log('Token decoded:', roles);
                            // 🔁 Appel API pour récupérer les détails de l'utilisateur
                            return from(AuthApi.getUserInfo(userId!)).pipe(
                                map((userDetailsResponse) => {
                                    let user: User = userDetailsResponse.data.data;
                                    user.roles = roles.filter(
                                        (role: any): role is UserRole => Object.values(UserRole).includes(role as UserRole)
                                    ); // Ajouter les rôles à l'utilisateur
                                    const isAdmin: boolean = [UserRole.ADMIN, UserRole.MOUKHADAM].some(role => user.roles!.includes(role))
                                    console.log(" is Admin?", user.roles);

                                    if(user?.dahiraId) {
                                        console.log("dahiraId");
                                        
                                        from(DahiraApiService.getDahira(user.dahiraId)).pipe(
                                            map((dahiraResponse) => {
                                                console.log("dahira: ",dahiraResponse);
                                                user = {...user, dahira: dahiraResponse.data.data};
                                                
                                                const messageLogin = isAdmin ? 'Connexion réussie en tant qu\'administrateur' : 'Connexion réussie en tant qu\'utilisateur';
                                                return AuthActions.loginSuccess({ token, user, isAdmin, message: messageLogin });
                                            })
                                        ),
                                            catchError((e) => {
                                                console.log("Erreur de récupération de dahira: ", e);
                                                
                                                const messageLogin = isAdmin ? 'Connexion réussie en tant qu\'administrateur' : 'Connexion réussie en tant qu\'utilisateur';
                                                return of(AuthActions.loginSuccess({ token, user, isAdmin, message: messageLogin }));
                                            });
                                    }
                                    const messageLogin = isAdmin ? 'Connexion réussie en tant qu\'administrateur' : 'Connexion réussie en tant qu\'utilisateur';
                                    return AuthActions.loginSuccess({ token, user, isAdmin, message: messageLogin });
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
                        const messageCreate = response.data.message || 'Inscription réussie';
                        return AuthActions.registerSuccess({ user: response.data.data, message: messageCreate });
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
                const token: Token = JSON.parse(localStorage.getItem('auth_token') || '{}');

                if (!token) {
                    return of(AuthActions.loadUserFromTokenFailure({ error: 'Aucun token trouvé' }));
                }

                try {
                    // Décoder le token pour vérifier sa validité et récupérer l'userId
                    const decoded: any = jwtDecode(token.access_token);
                    const userId = decoded.sub;
                    const now = Date.now() / 1000;
                    const roles = decoded?.realm_access.roles;

                    // Vérifier si le token n'est pas expiré
                    if (decoded.exp && decoded.exp < now) {
                        console.log('Token expiré');
                        localStorage.removeItem('auth_token');
                        return of(AuthActions.loadUserFromTokenFailure({ error: 'Token expiré' }));
                    }

                    console.log('Chargement des informations utilisateur depuis le token existant...');

                    // Récupérer les informations de l'utilisateur
                    return from(AuthApi.getUserInfo(userId)).pipe(
                        map((userDetailsResponse) => {
                            const user = userDetailsResponse.data.data;
                            // Stocker is_admin
                            user.roles = roles.filter(
                                (role: any): role is UserRole => Object.values(UserRole).includes(role as UserRole)
                            ); // Ajouter les rôles à l'utilisateur
                            const isAdmin: boolean = [UserRole.ADMIN, UserRole.MOUKHADAM].some(role => user.roles!.includes(role))
                            console.log(" is Admin?", user.roles);

                            const message = isAdmin ? 'recupération de l\'administrateur' : 'Récupération de l\'utilisateur';
                            console.log('Informations utilisateur chargées avec succès:', user);
                            return AuthActions.loadUserFromTokenSuccess({ token, isAdmin, user, message });
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


    // Ajoutez cet effet dans votre classe AuthEffects

    refreshToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.refreshToken),
            mergeMap(() => {
                // Récupérer le token actuel depuis localStorage
                const currentToken: Token | null = (() => {
                    try {
                        const storedToken = localStorage.getItem('auth_token');
                        return storedToken ? JSON.parse(storedToken) : null;
                    } catch (error) {
                        console.warn('Erreur lors de la lecture du token depuis localStorage:', error);
                        return null;
                    }
                })();

                if (!currentToken?.refresh_token) {
                    console.error('❌ Pas de refresh token disponible');
                    return of(AuthActions.refreshTokenFailure({
                        error: 'Pas de refresh token disponible'
                    }));
                }

                console.log('🔄 Démarrage du rafraîchissement du token...');

                return from(AuthApi.refreshToken(currentToken.refresh_token)).pipe(
                    mergeMap((response) => {
                        const newToken: Token = response.data?.data || response.data;
                        console.log("newToken: ", newToken);

                        if (!newToken?.access_token || !newToken?.refresh_token) {
                            console.error('❌ Token rafraîchi invalide - Champs manquants');
                            return of(AuthActions.refreshTokenFailure({
                                error: 'Token rafraîchi invalide'
                            }));
                        }

                        // Sauvegarder le nouveau token dans localStorage
                        try {
                            localStorage.setItem('auth_token', JSON.stringify(newToken));
                            console.log('✅ Token rafraîchi et sauvegardé avec succès');
                        } catch (error) {
                            console.error('❌ Erreur lors de la sauvegarde du token:', error);
                        }

                        // Optionnel : Mettre à jour les informations utilisateur si nécessaire
                        try {
                            const decoded: any = jwtDecode(newToken.access_token);
                            const userId = decoded.sub;
                            const roles = decoded?.realm_access?.roles;

                            // Si vous voulez aussi rafraîchir les infos utilisateur
                            return from(AuthApi.getUserInfo(userId)).pipe(
                                map((userDetailsResponse) => {
                                    const user: User = userDetailsResponse.data.data;
                                    if (roles) {
                                        user.roles = roles.filter(
                                            (role: any): role is UserRole => Object.values(UserRole).includes(role as UserRole)
                                        );
                                    }

                                    console.log('✅ Informations utilisateur mises à jour avec le nouveau token');

                                    // Retourner le succès avec token et utilisateur mis à jour
                                    return AuthActions.refreshTokenSuccess({ token: newToken });
                                }),
                                catchError((userError) => {
                                    console.warn('⚠️ Token rafraîchi mais erreur lors de la récupération du profil utilisateur:', userError);
                                    // Le token est valide, on peut continuer même si la récupération du profil échoue
                                    return of(AuthActions.refreshTokenSuccess({ token: newToken }));
                                })
                            );
                        } catch (decodeError) {
                            console.warn('⚠️ Erreur lors du décodage du nouveau token:', decodeError);
                            // Le token semble valide même si on ne peut pas le décoder
                            return of(AuthActions.refreshTokenSuccess({ token: newToken }));
                        }
                    }),
                    catchError((error) => {
                        console.error('❌ Erreur lors du rafraîchissement du token:', error);

                        // Nettoyer le localStorage en cas d'erreur
                        localStorage.removeItem('auth_token');

                        const errorMessage = error.response?.data?.message ||
                            error.message ||
                            'Erreur lors du rafraîchissement du token';

                        return of(AuthActions.refreshTokenFailure({ error: errorMessage }));
                    })
                );
            })
        )
    );
}