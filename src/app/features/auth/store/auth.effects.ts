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
  constructor(private actions$: Actions) {}

  //   login$ = createEffect(() =>
  //     this.actions$.pipe(
  //       ofType(AuthActions.login),
  //       mergeMap((action) =>
  //         from(AuthApi.login(action.login)).pipe(
  //           mergeMap((response) => {
  //             const token: Token = response.data?.data;
  //             console.log('Login success:', response.data);

  //             // Stocker le token après succès
  //             if (token) {
  //               //Stocker le Json Web Token (JWT) dans le localStorage
  //               localStorage.setItem('auth_token', JSON.stringify(token));
  //               console.log('Token:', token);
  //               // ✅ Décodage du token pour extraire "sub"
  //               const decoded: any = jwtDecode(token.access_token);
  //               const userId = decoded.sub;
  //               const roles = decoded?.realm_access.roles;

  //               console.log('Token decoded:', roles);
  //               // 🔁 Appel API pour récupérer les détails de l'utilisateur
  //               return from(AuthApi.getUserInfo(userId!)).pipe(
  //                 map((userDetailsResponse) => {
  //                   let user: User = userDetailsResponse.data.data;
  //                   user.roles = roles.filter((role: any): role is UserRole =>
  //                     Object.values(UserRole).includes(role as UserRole)
  //                   ); // Ajouter les rôles à l'utilisateur
  //                   const isAdmin: boolean = [
  //                     UserRole.ADMIN,
  //                     UserRole.MOUKHADAM,
  //                   ].some((role) => user.roles!.includes(role));
  //                   console.log(' is Admin?', user.roles);

  //                   if (user?.dahiraId) {
  //                     console.log('dahiraId');

  //                     from(DahiraApiService.getDahira(user.dahiraId)).pipe(
  //                       map((dahiraResponse) => {
  //                         console.log('dahira: ', dahiraResponse);
  //                         user = { ...user, dahira: dahiraResponse.data.data };

  //                         const messageLogin = isAdmin
  //                           ? "Connexion réussie en tant qu'administrateur"
  //                           : "Connexion réussie en tant qu'utilisateur";
  //                         return AuthActions.loginSuccess({
  //                           token,
  //                           user,
  //                           isAdmin,
  //                           message: messageLogin,
  //                         });
  //                       })
  //                     ),
  //                       catchError((e) => {
  //                         console.log('Erreur de récupération de dahira: ', e);

  //                         const messageLogin = isAdmin
  //                           ? "Connexion réussie en tant qu'administrateur"
  //                           : "Connexion réussie en tant qu'utilisateur";
  //                         return of(
  //                           AuthActions.loginSuccess({
  //                             token,
  //                             user,
  //                             isAdmin,
  //                             message: messageLogin,
  //                           })
  //                         );
  //                       });
  //                   }
  //                   const messageLogin = isAdmin
  //                     ? "Connexion réussie en tant qu'administrateur"
  //                     : "Connexion réussie en tant qu'utilisateur";
  //                   return AuthActions.loginSuccess({
  //                     token,
  //                     user,
  //                     isAdmin,
  //                     message: messageLogin,
  //                   });
  //                 }),
  //                 catchError((error) => {
  //                   console.error(
  //                     'Erreur lors de la récupération du profil utilisateur :',
  //                     error
  //                   );
  //                   const errorMessage =
  //                     error.response?.data?.message ||
  //                     'Erreur lors de la récupération des informations utilisateur';
  //                   return of(AuthActions.loginFailure({ error: errorMessage }));
  //                 })
  //               );
  //             }
  //             // En cas d'absence de token
  //             return of(
  //               AuthActions.loginFailure({
  //                 error: 'Token manquant après la connexion',
  //               })
  //             );
  //           }),
  //           catchError((error) => {
  //             console.error('Login error:', error);
  //             const errorMessage =
  //               error.response?.data?.message ||
  //               error.message ||
  //               'Erreur de connexion';
  //             return of(AuthActions.loginFailure({ error: errorMessage }));
  //           })
  //         )
  //       )
  //     )
  //   );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap((action) =>
        from(AuthApi.login(action.login)).pipe(
          mergeMap((response) => {
            const token: Token = response.data?.data;
            if (!token) {
              return of(
                AuthActions.loginFailure({
                  error: 'Token manquant après la connexion',
                })
              );
            }

            localStorage.setItem('auth_token', JSON.stringify(token));
            const decoded: any = jwtDecode(token.access_token);
            const userId = decoded.sub;
            const roles = decoded?.realm_access?.roles || [];

            return from(AuthApi.getUserInfo(userId)).pipe(
              mergeMap((userDetailsResponse) => {
                let user: User = userDetailsResponse.data.data;
                user.roles = roles.filter((role: any): role is UserRole =>
                  Object.values(UserRole).includes(role as UserRole)
                );

                const isAdmin = [UserRole.ADMIN, UserRole.MOUKHADAM].some(
                  (role) => user.roles!.includes(role)
                );

                if (user?.dahiraId) {
                  // ✅ Retourner l'Observable de Dahira correctement
                  return from(DahiraApiService.getDahira(user.dahiraId)).pipe(
                    map((dahiraResponse) => {
                      user = { ...user, dahira: dahiraResponse.data.data };
                      localStorage.setItem('user', JSON.stringify(user));
                      const messageLogin = isAdmin
                        ? "Connexion réussie en tant qu'administrateur"
                        : "Connexion réussie en tant qu'utilisateur";

                      return AuthActions.loginSuccess({
                        token,
                        user,
                        isAdmin,
                        message: messageLogin,
                      });
                    }),
                    catchError((e) => {
                      console.warn('Erreur Dahira, on continue sans :', e);
                      localStorage.setItem('user', JSON.stringify(user));
                      const messageLogin = isAdmin
                        ? "Connexion réussie en tant qu'administrateur"
                        : "Connexion réussie en tant qu'utilisateur";

                      return of(
                        AuthActions.loginSuccess({
                          token,
                          user,
                          isAdmin,
                          message: messageLogin,
                        })
                      );
                    })
                  );
                }

                // ✅ Aucun Dahira, stocker l'utilisateur et continuer
                localStorage.setItem('user', JSON.stringify(user));
                const messageLogin = isAdmin
                  ? "Connexion réussie en tant qu'administrateur"
                  : "Connexion réussie en tant qu'utilisateur";

                return of(
                  AuthActions.loginSuccess({
                    token,
                    user,
                    isAdmin,
                    message: messageLogin,
                  })
                );
              }),
              catchError((error) => {
                console.error('Erreur profil utilisateur :', error);
                const errorMessage =
                  error.response?.data?.message ||
                  'Erreur lors de la récupération des informations utilisateur';
                return of(AuthActions.loginFailure({ error: errorMessage }));
              })
            );
          }),
          catchError((error) => {
            console.error('Erreur de connexion :', error);
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              'Erreur de connexion';
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
            const messageCreate =
              response.data.message || 'Inscription réussie';
            return AuthActions.registerSuccess({
              user: response.data.data,
              message: messageCreate,
            });
          }),
          catchError((error) => {
            console.error('Registration error:', error);
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Erreur lors de l'inscription";
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
        const token: Token = JSON.parse(
          localStorage.getItem('auth_token') || '{}'
        );

        if (!token) {
          return of(
            AuthActions.loadUserFromTokenFailure({
              error: 'Aucun token trouvé',
            })
          );
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
            return of(
              AuthActions.loadUserFromTokenFailure({ error: 'Token expiré' })
            );
          }

          console.log(
            'Chargement des informations utilisateur depuis le token existant...'
          );

          // Récupérer les informations de l'utilisateur
          return from(AuthApi.getUserInfo(userId)).pipe(
            map((userDetailsResponse) => {
              const user = userDetailsResponse.data.data;
              // Stocker is_admin
              user.roles = roles.filter((role: any): role is UserRole =>
                Object.values(UserRole).includes(role as UserRole)
              ); // Ajouter les rôles à l'utilisateur
              const isAdmin: boolean = [
                UserRole.ADMIN,
                UserRole.MOUKHADAM,
              ].some((role) => user.roles!.includes(role));
              console.log(' is Admin?', user.roles);

              const message = isAdmin
                ? "recupération de l'administrateur"
                : "Récupération de l'utilisateur";
              console.log(
                'Informations utilisateur chargées avec succès:',
                user
              );
              return AuthActions.loadUserFromTokenSuccess({
                token,
                isAdmin,
                user,
                message,
              });
            }),
            catchError((error) => {
              console.error(
                'Erreur lors du chargement des informations utilisateur:',
                error
              );
              const errorMessage =
                error.response?.data?.message ||
                'Erreur lors du chargement des informations utilisateur';
              return of(
                AuthActions.loadUserFromTokenFailure({ error: errorMessage })
              );
            })
          );
        } catch (error) {
          console.error('Erreur lors du décodage du token:', error);
          return of(
            AuthActions.loadUserFromTokenFailure({ error: 'Token invalide' })
          );
        }
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUser),
      mergeMap(({ userId, updatedUser }) =>
        from(AuthApi.updateUser(userId, updatedUser)).pipe(
          map((response) => {
            const updatedUser = response.data.data;
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Mise à jour locale
            return AuthActions.updateUserSuccess({
              user: updatedUser,
              message: 'Utilisateur mis à jour avec succès',
            });
          }),
          catchError((error) => {
            const errorMessage =
              error.response?.data?.message || 'Erreur lors de la mise à jour';
            return of(AuthActions.updateUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}