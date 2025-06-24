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
  public hasMultipleRoles$: Observable<boolean>;
  public isOnlyVisiteur$: Observable<boolean>;
  public primaryRole$: Observable<UserRole | null>;

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.userRoles$ = this.store.select(selectUserRoles);

    // Observable du rôle principal (le premier rôle ou le plus élevé)
    this.primaryRole$ = this.userRoles$.pipe(
      map(roles => this.getPrimaryRole(roles))
    );

    // Observable pour vérifier si l'utilisateur a plusieurs rôles
    this.hasMultipleRoles$ = this.userRoles$.pipe(
      map(roles => this.hasMultipleNonVisiteurRoles(roles))
    );

    // Observable pour vérifier si l'utilisateur est seulement visiteur
    this.isOnlyVisiteur$ = this.userRoles$.pipe(
      map(roles => this.isUserOnlyVisiteur(roles))
    );
  }

  /**
   * Vérifie si l'utilisateur a plusieurs rôles (excluant VISITEUR)
   */
  private hasMultipleNonVisiteurRoles(roles: string[]): boolean {
    if (!roles || roles.length === 0) return false;

    const nonVisiteurRoles = roles.filter(role => role !== UserRole.VISITEUR);
    return nonVisiteurRoles.length > 1;
  }

  /**
   * Vérifie si l'utilisateur est uniquement visiteur
   */
  private isUserOnlyVisiteur(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;

    // Si l'utilisateur n'a que le rôle VISITEUR ou aucun rôle
    return roles.length === 1 && roles[0] === UserRole.VISITEUR ||
      roles.every(role => role === UserRole.VISITEUR);
  }

  /**
   * Vérifie si l'utilisateur a des rôles privilégiés (autres que VISITEUR)
   */
  hasPrivilegedRoles(): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => {
        if (!roles || roles.length === 0) return false;
        return roles.some(role => role !== UserRole.VISITEUR);
      })
    );
  }

  /**
   * Observable qui indique si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): Observable<boolean> {
    return this.userRoles$.pipe(
      map(roles => roles && roles.includes(role))
    );
  }

  /**
   * Observable qui indique si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: UserRole[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(userRoles => {
        if (!userRoles || userRoles.length === 0) return false;
        return roles.some(role => userRoles.includes(role));
      })
    );
  }

  /**
   * Observable qui indique si l'utilisateur a tous les rôles spécifiés
   */
  hasAllRoles(roles: UserRole[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(userRoles => {
        if (!userRoles || userRoles.length === 0) return false;
        return roles.every(role => userRoles.includes(role));
      })
    );
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux fonctionnalités visiteur
   * (uniquement s'il n'a que le rôle visiteur)
   */
  canAccessVisiteurFeatures(): Observable<boolean> {
    return this.isOnlyVisiteur$;
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

  get isGestionnaire$(): Observable<boolean> {
    return this.hasRole(UserRole.G_DAHIRA);
  }

  get isCollecteFonds$(): Observable<boolean> {
    return this.hasRole(UserRole.COLLECTE_FONDS);
  }

  /**
   * Retourne true seulement si l'utilisateur n'a QUE le rôle visiteur
   */
  get isVisiteurOnly$(): Observable<boolean> {
    return this.isOnlyVisiteur$;
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
      map(roles => currentRoles = roles || [])
    ).subscribe().unsubscribe();
    return currentRoles;
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
      UserRole.G_DAHIRA,
      UserRole.COLLECTE_FONDS,
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
}