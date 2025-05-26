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
    on(AuthActions.loginSuccess, (state, { token, user }) => ({
        ...state,
        token,
        user,
        loading: false
    })),
    on(AuthActions.registerSuccess, (state, { user }) => ({
        ...state,
        user,
        loading: false
    })),
    on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.loadUserFromTokenFailure,(state, { error }) => ({
        ...state,
        error,
        loading: false
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
);