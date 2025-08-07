import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';
import { Login, Register, Token } from '../models/auth.model';
import { Dahira } from '../../dahiras/models/dahira.model';

export const login = createAction(
  '[Auth] Login',
  props<{ login: Login }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: Token, user: User, isAdmin: boolean, message: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{ userData: Register }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User, message: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

export const loadUserFromToken = createAction(
  '[Auth] Load User From Token'
);

export const loadUserFromTokenSuccess = createAction(
  '[Auth] Load User From Token Success',
  props<{ token: Token, user: User, isAdmin: boolean, message: string }>()
);

export const loadUserFromTokenFailure = createAction(
  '[Auth] Load User From Token Failure',
  props<{ error: string }>()
);

// actions pour la Dahira
export const getDahira = createAction(
  '[Auth] Get Dahira'
);

export const getDahiraSuccess = createAction(
  '[Auth] Get Dahira Success',
  props<{ dahira: Dahira }>()
);

export const getDahiraFailure = createAction(
  '[Auth] Get Dahira Failure',
  props<{ error: string }>()
);

// actions pour le refresh token
export const refreshToken = createAction(
  '[Auth] Refresh Token'
);

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: Token }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

export const setToken = createAction(
  '[Auth] Set Token',
  props<{ token: Token }>()
);

export const checkTokenExpiration = createAction(
  '[Auth] Check Token Expiration'
);

export const tokenExpired = createAction(
  '[Auth] Token Expired'
);

// Action pour démarrer la mise à jour utilisateur (comme balance)
export const updateUser = createAction(
  '[Auth] Update User',
  props<{ userId: string; updatedUser: Partial<User> }>()
);

// Succès de la mise à jour
export const updateUserSuccess = createAction(
  '[Auth] Update User Success',
  props<{ user: User; message: string }>()
);

// Échec de la mise à jour
export const updateUserFailure = createAction(
  '[Auth] Update User Failure',
  props<{ error: string }>()
);