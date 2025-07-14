import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth.actions';
import { selectCurrentUser } from "../store/auth.selectors";
import { Login, Register, Token } from "../models/auth.model";
import { AuthApi } from './auth.api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private store: Store) {
    // Écouter les changements d'état d'authentification
    this.store.select(selectCurrentUser).subscribe((user) => {
      this.isAuthenticatedSubject.next(!!user?.active);
    });

    //Charger automatiquement l'utilisateur si un token existe
    // this.initializeAuthState();
  }

  // Initialiser l'état d'authentification
  private initializeAuthState(): void {
    const token: Token = JSON.parse(localStorage.getItem('auth_token') || '{}');
    if (token) {
      console.log(
        'Token trouvé au démarrage, chargement des informations utilisateur...'
      );
      this.store.dispatch(AuthActions.loadUserFromToken());
    }
  }

  setAuthenticatedState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  // Les méthodes suivantes déclenchent les actions NgRx
  login(login: Login) {
    this.store.dispatch(AuthActions.login({ login }));
  }

  // register(userData: Register) {
  //   console.log('register: ', userData);

  //   this.store.dispatch(AuthActions.register({ userData }));
  // }

    register(userData: Register) {
    try {
      const response = this.store.dispatch(AuthActions.register({ userData })); // Ajustez l'URL selon votre API
      console.log('register: ', response);
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      const errorResponse = error.response?.data || {};
      let errorMessage =
        errorResponse.developerMessage ||
        errorResponse.message ||
        "Erreur lors de l'inscription";
      let validationErrors: { field: string; message: string }[] = [];

      // Gérer les erreurs de violation d'unicité
      if (
        error.response?.status === 500 &&
        errorMessage.includes('duplicate key value violates unique constraint')
      ) {
        if (errorMessage.includes('phone_number')) {
          errorMessage = 'Ce numéro de téléphone existe déjà.';
          validationErrors = [{ field: 'phoneNumber', message: errorMessage }];
        } else if (errorMessage.includes('email')) {
          errorMessage = 'Cet email existe déjà.';
          validationErrors = [{ field: 'email', message: errorMessage }];
        }
      }

      throw {
        success: false,
        message: errorMessage,
        statusCode: error.response?.status,
        validationErrors,
      };
    }
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    this.store.dispatch(AuthActions.logout());
  }

  private hasToken(): boolean {
    return !!JSON.parse(localStorage.getItem('auth_token') || '{}');
  }

  isLoggedIn(): boolean {
    if (!this.hasToken()) {
      this.isAuthenticatedSubject.next(false);
      return false;
    }

    return this.hasToken();
  }

  isAdmin(): boolean {
    return localStorage.getItem('is_admin') === 'true';
  }

  async resetPassword(payload: { newPassword: string }) {
    return AuthApi.resetPassword(payload);
  }
}
