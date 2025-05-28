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
    on(AuthActions.logoutFailure, (state, { error }) => ({
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
    on(AuthActions.refreshToken, state => ({
        ...state,
        isRefreshing: true,
        error: null
    })),

    on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
        ...state,
        token,
        isRefreshing: false,
        isAuthenticated: true,
        error: null
    })),

    on(AuthActions.refreshTokenFailure, (state, { error }) => ({
        ...state,
        isRefreshing: false,
        error,
        isAuthenticated: false,
        token: null,
        user: null
    })),

    // Set token action (utilisée par l'intercepteur)
    on(AuthActions.setToken, (state, { token }) => ({
        ...state,
        token,
        isAuthenticated: true
    })),

    // Token expiration
    on(AuthActions.tokenExpired, state => ({
        ...state,
        isAuthenticated: false,
        token: null,
        user: null
    })),
);