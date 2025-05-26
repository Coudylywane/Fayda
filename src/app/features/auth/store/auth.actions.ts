import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';
import { Login, Register, Token } from '../models/auth.model';

export const login = createAction(
  '[Auth] Login',
  props<{ login: Login }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ token: Token, user: User }>()
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
  props<{ user: User }>()
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
  props<{ token: string, user: User }>()
);

export const loadUserFromTokenFailure = createAction(
  '[Auth] Load User From Token Failure',
  props<{ error: string }>()
);