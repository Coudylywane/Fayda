// src/app/features/auth/services/token.service.ts

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Token } from '../models/auth.model';
import * as AuthActions from '../store/auth.actions';
import { selectAuthToken } from '../store/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenExpirationTimer: any;
  private readonly TOKEN_CHECK_INTERVAL = 60000; // 1 minute
  private readonly TOKEN_STORAGE_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
  
  constructor(private store: Store) {
    this.initializeTokenMonitoring();
  }

  /**
   * Initialise la surveillance automatique du token
   */
  private initializeTokenMonitoring(): void {
    // Vérifier le token toutes les minutes
    timer(0, this.TOKEN_CHECK_INTERVAL).subscribe(() => {
      this.checkAndRefreshToken();
    });
  }

  /**
   * Vérifie et rafraîchit le token si nécessaire
   */
  private async checkAndRefreshToken(): Promise<void> {
    try {
      const token = await this.getCurrentToken();
      
      if (!token) return;

      if (this.shouldRefreshToken(token)) {
        console.log('🔄 Token bientôt expiré, rafraîchissement automatique...');
        this.store.dispatch(AuthActions.refreshToken());
      } else if (this.isTokenExpired(token)) {
        console.log('⏰ Token expiré, déconnexion automatique...');
        this.store.dispatch(AuthActions.tokenExpired());
        this.store.dispatch(AuthActions.logout());
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
    }
  }

  /**
   * Récupère le token actuel depuis le store ou localStorage
   */
  private async getCurrentToken(): Promise<Token | null> {
    try {
      // Essayer depuis le store Redux
      const storeToken = await new Promise<Token | null>((resolve) => {
        this.store.select(selectAuthToken).pipe().subscribe({
          next: (token) => resolve(token),
          error: () => resolve(null)
        });
      });

      if (storeToken?.access_token) {
        return storeToken;
      }

      // Fallback sur localStorage
      return this.getTokenFromStorage();
    } catch (error) {
      console.warn('Erreur lors de la récupération du token:', error);
      return this.getTokenFromStorage();
    }
  }

  /**
   * Récupère le token depuis localStorage
   */
  private getTokenFromStorage(): Token | null {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!storedToken) return null;

      const token: Token = JSON.parse(storedToken);
      
      // Vérifier que c'est bien un objet Token valide
      if (token.access_token && token.refresh_token) {
        return token;
      }
      
      return null;
    } catch (error) {
      console.warn('Erreur lors de la lecture du token depuis localStorage:', error);
      return null;
    }
  }

  /**
   * Extrait le timestamp de création depuis le JWT
   */
  private getTokenCreationTime(accessToken: string): number | null {
    try {
      // Décoder le JWT pour extraire le timestamp 'iat' (issued at)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.iat ? payload.iat * 1000 : null; // Convertir en millisecondes
    } catch (error) {
      console.warn('Impossible de décoder le JWT:', error);
      return null;
    }
  }

  /**
   * Vérifie si le token doit être rafraîchi
   */
  private shouldRefreshToken(token: Token): boolean {
    if (!token.expires_in) return false;
    
    const tokenCreationTime = this.getTokenCreationTime(token.access_token);
    if (!tokenCreationTime) return false;

    const expirationTime = tokenCreationTime + (token.expires_in * 1000);
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Rafraîchir si le token expire dans moins de 5 minutes
    return timeUntilExpiry <= this.TOKEN_EXPIRY_BUFFER && timeUntilExpiry > 0;
  }

  /**
   * Vérifie si le token est expiré
   */
  private isTokenExpired(token: Token): boolean {
    if (!token.expires_in) return false;
    
    const tokenCreationTime = this.getTokenCreationTime(token.access_token);
    if (!tokenCreationTime) return true;

    const expirationTime = tokenCreationTime + (token.expires_in * 1000);
    return Date.now() >= expirationTime;
  }

  /**
   * Sauvegarde le token directement dans localStorage
   */
  saveTokenWithTimestamp(token: Token): void {
    try {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(token));
      console.log('✅ Token sauvegardé dans localStorage');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du token:', error);
    }
  }

  /**
   * Nettoie le token
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    console.log('🗑️ Token nettoyé');
  }

  /**
   * Obtient le temps restant avant expiration (en millisecondes)
   */
  getTimeUntilExpiration(token: Token): number {
    if (!token.expires_in) return 0;
    
    const tokenCreationTime = this.getTokenCreationTime(token.access_token);
    if (!tokenCreationTime) return 0;

    const expirationTime = tokenCreationTime + (token.expires_in * 1000);
    const timeRemaining = expirationTime - Date.now();
    
    return Math.max(0, timeRemaining);
  }

  /**
   * Formate le temps restant en format lisible
   */
  formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Expiré';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Obtient des informations détaillées sur l'état du token
   */
  getTokenInfo(): Observable<{
    isValid: boolean;
    isExpired: boolean;
    shouldRefresh: boolean;
    timeUntilExpiration: number;
    timeUntilExpirationFormatted: string;
    expiresAt: Date | null;
    createdAt: Date | null;
  }> {
    return this.store.select(selectAuthToken).pipe(
      map(token => {
        if (!token) {
          return {
            isValid: false,
            isExpired: true,
            shouldRefresh: false,
            timeUntilExpiration: 0,
            timeUntilExpirationFormatted: 'Aucun token',
            expiresAt: null,
            createdAt: null
          };
        }

        const isExpired = this.isTokenExpired(token);
        const shouldRefresh = this.shouldRefreshToken(token);
        const timeUntilExpiration = this.getTimeUntilExpiration(token);
        const tokenCreationTime = this.getTokenCreationTime(token.access_token);
        
        return {
          isValid: !isExpired && !!token.access_token,
          isExpired,
          shouldRefresh,
          timeUntilExpiration,
          timeUntilExpirationFormatted: this.formatTimeRemaining(timeUntilExpiration),
          expiresAt: tokenCreationTime ? new Date(tokenCreationTime + (token.expires_in * 1000)) : null,
          createdAt: tokenCreationTime ? new Date(tokenCreationTime) : null
        };
      })
    );
  }

  /**
   * Décode et retourne les informations du JWT
   */
  decodeToken(token?: Token): any {
    try {
      const currentToken = token || this.getTokenFromStorage();
      if (!currentToken?.access_token) return null;

      const payload = JSON.parse(atob(currentToken.access_token.split('.')[1]));
      return payload;
    } catch (error) {
      console.warn('Erreur lors du décodage du JWT:', error);
      return null;
    }
  }

  /**
   * Retourne les rôles de l'utilisateur depuis le token
   */
  getUserRoles(token?: Token): string[] {
    try {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.realm_access?.roles || [];
    } catch (error) {
      console.warn('Erreur lors de l\'extraction des rôles:', error);
      return [];
    }
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string, token?: Token): boolean {
    const roles = this.getUserRoles(token);
    return roles.includes(role);
  }

  /**
   * Retourne les informations utilisateur depuis le token
   */
  getUserInfo(token?: Token): {
    sub: string;
    preferred_username: string;
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    email_verified: boolean;
  } | null {
    try {
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) return null;

      return {
        sub: decodedToken.sub,
        preferred_username: decodedToken.preferred_username,
        name: decodedToken.name,
        given_name: decodedToken.given_name,
        family_name: decodedToken.family_name,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified
      };
    } catch (error) {
      console.warn('Erreur lors de l\'extraction des infos utilisateur:', error);
      return null;
    }
  }
}