// src/app/core/axios-config.ts
import axios from 'axios';
import { environment } from '../../environments/environment';
import * as AuthActions from '../features/auth/store/auth.actions';
import { selectAuthToken } from '../features/auth/store/auth.selectors';
import { take } from 'rxjs';
import { Token } from '../features/auth/models/auth.model';

let isRedirecting = false; // Flag pour éviter les boucles

export function configureAxios(store: any) {
  axios.defaults.baseURL = environment.apiUrl;

  axios.interceptors.request.use(async config => {
    try {
      // Récupérer le token depuis le store
      const token: Token = await store.select(selectAuthToken).pipe(take(1)).toPromise();

      console.log('Token récupéré depuis le store:', token?.access_token);
      
      
      if (token) {
        config.headers.Authorization = `Bearer ${token.access_token}`;
      } else {
        // Fallback sur localStorage
        const fallbackToken = localStorage.getItem('auth_token');
        if (fallbackToken) {
          config.headers.Authorization = `Bearer ${fallbackToken}`;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token:', error);
      // Fallback sur localStorage en cas d'erreur
      const fallbackToken = localStorage.getItem('auth_token');
      if (fallbackToken) {
        config.headers.Authorization = `Bearer ${fallbackToken}`;
      }
    }
    
    return config;
  });

  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_admin');
        store.dispatch(AuthActions.logout());
        
        // Réinitialiser le flag après un délai
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
      return Promise.reject(error);
    }
  );
}
