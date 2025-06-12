// src/app/core/axios-config.ts
import axios, { AxiosRequestConfig } from 'axios';
import { environment } from '../../environments/environment';
import * as AuthActions from '../features/auth/store/auth.actions';
import { selectAuthToken } from '../features/auth/store/auth.selectors';
import { firstValueFrom, take } from 'rxjs';
import { Token } from '../features/auth/models/auth.model';

// Variables globales pour la gestion du refresh
let isRefreshing = false;
let isRedirecting = false;
let refreshPromise: Promise<Token | null> | null = null;
let requestsQueue: Array<{
  resolve: (token: Token | null) => void;
  reject: (error: any) => void;
}> = [];

// Constantes
const TOKEN_EXPIRY_BUFFER = 1 * 60 * 1000; // 5 minutes en millisecondes
const EXCLUDED_ENDPOINTS = ['auth/login', 'users'];
const TOKEN_STORAGE_KEY = 'auth_token';

export function configureAxios(store: any) {
  axios.defaults.baseURL = environment.apiUrl;

  // Intercepteur de requête
  axios.interceptors.request.use(async config => {
    try {
      // Vérifier si l'endpoint est exclu
      if (shouldExcludeEndpoint(config.url || '', config.method || '')) {
        return config;
      }

      // Récupérer le token actuel
      let token = await getCurrentToken(store);
      
      if (!token?.access_token) {
        return config;
      }

      // Vérifier si le token doit être rafraîchi
      if (shouldRefreshToken(token)) {
        token = await handleTokenRefresh(store, token);
      }

      // Ajouter le token à la requête
      if (token?.access_token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token.access_token}`;
      }

      return config;
    } catch (error) {
      console.warn('Erreur dans l\'intercepteur de requête:', error);
      return config;
    }
  });

  // Intercepteur de réponse
  axios.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401 && !isRedirecting) {
        await handleUnauthorizedError(store);
      }
      return Promise.reject(error);
    }
  );
}

/**
 * Vérifie si l'endpoint doit être exclu du système de token
 */
function shouldExcludeEndpoint(url: string, method: string): boolean {
  // Exclure auth/login pour toutes les méthodes
  if (url.includes('auth/login')) {
    return true;
  }
  
  // Exclure POST users spécifiquement
  if (method.toUpperCase() === 'POST' && url.match(/\/users\/?$/)) {
    return true;
  }
  
  return false;
}

/**
 * Récupère le token actuel depuis le store ou localStorage
 */
async function getCurrentToken(store: any): Promise<Token | null> {
  try {
    // Essayer depuis le store Redux
    const storeToken: Token = await firstValueFrom(
      store.select(selectAuthToken).pipe(take(1))
    );
    
    if (storeToken?.access_token) {
      console.log('Token récupéré depuis le store Redux');
      return storeToken;
    }

    // Fallback sur localStorage
    const storageToken = getTokenFromStorage();
    if (storageToken?.access_token) {
      console.log('Token récupéré depuis localStorage');
      return storageToken;
    }

    return null;
  } catch (error) {
    console.warn('Erreur lors de la récupération du token depuis le store:', error);
    return getTokenFromStorage();
  }
}

/**
 * Récupère le token depuis localStorage
 */
function getTokenFromStorage(): Token | null {
  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
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
 * Vérifie si le token doit être rafraîchi (5 minutes avant expiration)
 */
function shouldRefreshToken(token: Token): boolean {
  if (!token.expires_in) return false;
  
  // Calculer le timestamp de création du token depuis le JWT
  const tokenCreationTime = getTokenCreationTime(token.access_token);
  if (!tokenCreationTime) return false;

  const expirationTime = tokenCreationTime + (token.expires_in * 1000);
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;
  
  // Rafraîchir si le token expire dans moins de 5 minutes
  return timeUntilExpiry <= TOKEN_EXPIRY_BUFFER && timeUntilExpiry > 0;
}

/**
 * Vérifie si le token est expiré
 */
function isTokenExpired(token: Token): boolean {
  if (!token.expires_in) return false;
  
  const tokenCreationTime = getTokenCreationTime(token.access_token);
  if (!tokenCreationTime) return true;

  const expirationTime = tokenCreationTime + (token.expires_in * 1000);
  return Date.now() >= expirationTime;
}

/**
 * Extrait le timestamp de création depuis le JWT
 */
function getTokenCreationTime(accessToken: string): number | null {
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
 * Vérifie la validité globale d'un token
 */
function checkTokenValidity(token: Token): boolean {
  return !!(
    token?.access_token &&
    token?.refresh_token &&
    !isTokenExpired(token)
  );
}

/**
 * Sauvegarde le token directement dans localStorage
 */
function saveTokenWithTimestamp(token: Token): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
    console.log('Token sauvegardé dans localStorage');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
  }
}

/**
 * Gère le rafraîchissement du token avec file d'attente
 */
async function handleTokenRefresh(store: any, currentToken: Token): Promise<Token | null> {
  // Si un refresh est déjà en cours, attendre le résultat
  if (isRefreshing && refreshPromise) {
    return new Promise((resolve, reject) => {
      requestsQueue.push({ resolve, reject });
    });
  }

  // Marquer le début du refresh
  isRefreshing = true;
  refreshPromise = performTokenRefresh(store, currentToken);

  try {
    const newToken = await refreshPromise;
    
    // Résoudre toutes les requêtes en attente
    requestsQueue.forEach(({ resolve }) => resolve(newToken));
    requestsQueue = [];
    
    return newToken;
  } catch (error) {
    // Rejeter toutes les requêtes en attente
    requestsQueue.forEach(({ reject }) => reject(error));
    requestsQueue = [];
    
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Effectue le rafraîchissement du token
 */
async function performTokenRefresh(store: any, currentToken: Token): Promise<Token | null> {
  try {
    console.log('🔄 Rafraîchissement du token en cours...');

    // Préparer la requête de refresh selon votre API
    const refresh_token = currentToken.refresh_token;
    console.log("New token: ", refresh_token);

    const response = await axios.post('auth/refresh-token', {refresh_token}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("New token: ", response);

    const newToken: Token = response.data;

    
    // Valider le nouveau token
    if (!newToken.access_token || !newToken.refresh_token) {
      throw new Error('Token rafraîchi invalide - Champs manquants');
    }

    // Vérifier la validité du nouveau token
    if (!checkTokenValidity(newToken)) {
      throw new Error('Token rafraîchi invalide - Token expiré');
    }

    // Sauvegarder le nouveau token
    saveTokenWithTimestamp(newToken);
    
    // Mettre à jour le store Redux
    store.dispatch(AuthActions.setToken({ token: newToken }));
    
    console.log('✅ Token rafraîchi avec succès');
    return newToken;
  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement du token:', error);
    
    // En cas d'erreur, déconnecter l'utilisateur
    await handleRefreshFailure(store);
    return null;
  }
}

/**
 * Gère l'échec du rafraîchissement
 */
async function handleRefreshFailure(store: any): Promise<void> {
  console.log('🚪 Échec du rafraîchissement du token - Déconnexion automatique');
  
  // Nettoyer le stockage
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  
  // Déconnecter via le store Redux
  store.dispatch(AuthActions.logout());
  
  // Optionnel : redirection vers la page de login
  // setTimeout(() => {
  //   window.location.href = '/login';
  // }, 100);
}

/**
 * Gère les erreurs 401 (non autorisé)
 */
async function handleUnauthorizedError(store: any): Promise<void> {
  if (isRedirecting) return;
  
  isRedirecting = true;
  
  try {
    const currentToken = await getCurrentToken(store);
    
    if (currentToken?.refresh_token && !isRefreshing) {
      console.log('🔄 Tentative de récupération avec refresh token...');
      
      // Essayer de rafraîchir le token
      const newToken = await handleTokenRefresh(store, currentToken);
      
      if (!newToken) {
        await handleRefreshFailure(store);
      }
    } else {
      console.log('❌ Pas de refresh token disponible');
      await handleRefreshFailure(store);
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de l\'erreur 401:', error);
    await handleRefreshFailure(store);
  } finally {
    // Réinitialiser le flag après un délai
    setTimeout(() => {
      isRedirecting = false;
    }, 1000);
  }
}

/**
 * Obtient le temps restant avant expiration (en millisecondes)
 */
function getTimeUntilExpiration(token: Token): number {
  if (!token.expires_in) return 0;
  
  const tokenCreationTime = getTokenCreationTime(token.access_token);
  if (!tokenCreationTime) return 0;

  const expirationTime = tokenCreationTime + (token.expires_in * 1000);
  const timeRemaining = expirationTime - Date.now();
  
  return Math.max(0, timeRemaining);
}

// Export des fonctions utilitaires pour usage externe
export {
  saveTokenWithTimestamp,
  checkTokenValidity,
  isTokenExpired,
  shouldRefreshToken,
  getTimeUntilExpiration,
  getTokenCreationTime
};