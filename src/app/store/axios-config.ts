// src/app/core/axios-config.ts
import axios from 'axios';
import { environment } from '../../environments/environment';
import * as AuthActions from '../features/auth/store/auth.actions';
import { selectAuthToken } from '../features/auth/store/auth.selectors';
import { firstValueFrom, take } from 'rxjs';
import { Token } from '../features/auth/models/auth.model';

let isRedirecting = false; // Flag pour éviter les boucles

export function configureAxios(store: any) {
  axios.defaults.baseURL = environment.apiUrl;

  axios.interceptors.request.use(async config => {
    try {
      // Récupérer le token depuis le store
      const token: Token = await firstValueFrom(store.select(selectAuthToken).pipe(take(1)));

      console.log('Token récupéré depuis le store:', token?.access_token);
      
      
      if (token?.access_token) {
        config.headers.Authorization = `Bearer ${token.access_token}`;
      } else {
        // Fallback sur localStorage
        const fallbackToken: Token = await JSON.parse(localStorage.getItem('auth_token') || '{}');
        console.log('Token récupéré depuis localStorage:', fallbackToken?.access_token);

        if (fallbackToken?.access_token) {
          config.headers.Authorization = `Bearer ${fallbackToken.access_token}`;
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token:', error);
      // Fallback sur localStorage en cas d'erreur
      const fallbackToken = await JSON.parse(localStorage.getItem('auth_token') || '{}');
      if (fallbackToken.access_token) {
        config.headers.Authorization = `Bearer ${fallbackToken.access_token}`;
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
        // store.dispatch(AuthActions.logout());
        
        // Réinitialiser le flag après un délai
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
      return Promise.reject(error);
    }
  );
}
