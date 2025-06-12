import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth.actions';
import { selectCurrentUser } from "../store/auth.selectors";
import { Login, Register, Token } from "../models/auth.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken())
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()

constructor(private store: Store, ) {
    // Écouter les changements d'état d'authentification
    this.store.select(selectCurrentUser).subscribe(user => {
      this.isAuthenticatedSubject.next(!!user?.active);
    });

    //Charger automatiquement l'utilisateur si un token existe
    // this.initializeAuthState();
  }

  // Initialiser l'état d'authentification
  private initializeAuthState(): void {
    const token: Token = JSON.parse(localStorage.getItem('auth_token') || '{}');
    if (token) {
      console.log('Token trouvé au démarrage, chargement des informations utilisateur...');
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

  register(userData: Register) {
    console.log('register: ', userData);
    
    this.store.dispatch(AuthActions.register({ userData }));
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    this.store.dispatch(AuthActions.logout());
  }

  private hasToken(): boolean {
    return !!JSON.parse(localStorage.getItem("auth_token") || '{}');
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
}
