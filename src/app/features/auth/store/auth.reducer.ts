import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialState } from './auth.state';

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, AuthActions.loadUserFromToken, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { token, user, isAdmin, message }) => ({
    ...state,
    token,
    isAuthenticated: true,
    user,
    loading: false,
    isAdmin,
    message
  })),
  on(AuthActions.registerSuccess, (state, { user, message }) => ({
    ...state,
    user,
    loading: false,
    message
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.loadUserFromTokenFailure, (state, { error }) => ({
    ...state,
    error,
    isAuthenticated: false,
    loading: false,
    message: null
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialState // Réinitialise complètement l'état
  })),
  on(AuthActions.logoutFailure, AuthActions.getDahiraFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(AuthActions.loadUserFromTokenSuccess, (state, { token, user }) => ({
    ...state,
    // token,
    user,
    loading: false,
    error: null
  })),
  // Set Token (utilisé par l'intercepteur)
  on(AuthActions.setToken, (state, { token }) => ({
    ...state,
    token,
    isAuthenticated: !!token?.access_token,
    lastTokenRefresh: Date.now()
  })),

  // Refresh Token actions
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    refreshing: true,
    error: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    isAuthenticated: true,
    refreshing: false,
    error: null,
    lastTokenRefresh: Date.now()
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    refreshing: false,
    error,
    // Ne pas déconnecter automatiquement ici, laisser l'intercepteur gérer
  })),

  // Token expiration
  on(AuthActions.tokenExpired, (state) => ({
    ...state,
    isAuthenticated: false,
    error: 'Token expiré'
  })),

  on(AuthActions.getDahira, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.getDahiraSuccess, (state, { dahira }) => ({
    ...state,
    user: state.user ? { ...state.user, dahira } : state.user,
    loading: false,
  })),
);