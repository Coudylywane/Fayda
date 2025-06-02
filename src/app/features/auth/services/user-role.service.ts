import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { selectCurrentUser, selectUserRoles } from '../store/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  
  public currentUser$: Observable<User | null>;
  public userRoles$: Observable<string[]>;
  public primaryRole$: Observable<UserRole | null>;

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.userRoles$ = this.store.select(selectUserRoles);
    
    // Observable du rôle principal (le premier rôle ou le plus élevé)
    this.primaryRole$ = this.userRoles$.pipe(
      map(roles => this.getPrimaryRole(roles))
    );
  }

  /**
   * Détermine le rôle principal basé sur la hiérarchie
   */
  private getPrimaryRole(roles: string[]): UserRole | null {
    if (!roles || roles.length === 0) {
      return UserRole.VISITEUR;
    }

    // Ordre de priorité des rôles (du plus élevé au plus bas)
    const roleHierarchy = [
      UserRole.ADMIN,
      UserRole.MOUKHADAM,
      UserRole.DISCIPLE,
      UserRole.VISITEUR
    ];

    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return UserRole.VISITEUR;
  }

  /**
   * Observable qui indique si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => roles.includes(role))
    );
  }

  /**
   * Observable qui indique si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: UserRole[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(userRoles => roles.some(role => userRoles.includes(role)))
    );
  }

  /**
   * Observable qui indique si l'utilisateur a tous les rôles spécifiés
   */
  hasAllRoles(roles: UserRole[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(userRoles => roles.every(role => userRoles.includes(role)))
    );
  }

  /**
   * Observables pour les rôles spécifiques
   */
  get isAdmin$(): Observable<boolean> {
    return this.hasRole(UserRole.ADMIN);
  }

  get isMoukhadam$(): Observable<boolean> {
    return this.hasRole(UserRole.MOUKHADAM);
  }

  get isDisciple$(): Observable<boolean> {
    return this.hasRole(UserRole.DISCIPLE);
  }

  get isVisiteur$(): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => !roles || roles.length === 0 || roles.includes(UserRole.VISITEUR))
    );
  }

  /**
   * Méthodes synchrones (à utiliser avec précaution)
   */
  getCurrentUserSync(): User | null {
    let currentUser: User | null = null;
    this.currentUser$.pipe(
      map(user => currentUser = user)
    ).subscribe().unsubscribe();
    return currentUser;
  }

  getCurrentRolesSync(): string[] {
    let currentRoles: string[] = [];
    this.userRoles$.pipe(
      map(roles => currentRoles = roles)
    ).subscribe().unsubscribe();
    return currentRoles;
  }
}