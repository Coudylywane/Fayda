import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { delay, tap } from "rxjs/operators"
import { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken())
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()

  constructor() { }

  register(userData: User): Observable<{ success: boolean, message?: string }> {
    return of({
      success: true,
      message: 'Inscription réussie'
    }).pipe(
      delay(1000),
      tap(response => {
        if (response.success) {
          // Simulation de stockage
          console.log('User registered:', userData);
        }
      })
    );
  }

  // Dans auth.service.ts
  login(email: string, password: string): Observable<{ success: boolean, isAdmin?: boolean }> {
    // Simulation d'authentification
    const isAdmin = email === 'admin@at.sn' && password === 'password';
    const isUser = email === 'user@at.sn' && password === 'password';

    return of({
      success: isAdmin || isUser,
      isAdmin: isAdmin
    }).pipe(
      delay(1000),
      tap(result => {
        if (result.success) {
          localStorage.setItem('auth_token', 'fake-jwt-token');
          localStorage.setItem('is_admin', String(result.isAdmin)); // Stocker le statut admin
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem("auth_token")
    this.isAuthenticatedSubject.next(false)
  }

  private hasToken(): boolean {
    return !!localStorage.getItem("auth_token")
  }

  isLoggedIn(): boolean {
    return this.hasToken()
  }

  isAdmin(): boolean {
    return localStorage.getItem('is_admin') === 'true';
  }
}
