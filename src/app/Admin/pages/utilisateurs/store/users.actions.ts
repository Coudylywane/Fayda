import { createAction, props } from '@ngrx/store';
import { User, UserFormData } from '../../utilisateurs/modals/users.model';

// Load Users
export const loadUsers = createAction(
  '[Users] Load Users',
  props<{ page?: number; size?: number }>()
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: User[]; totalElements: number; totalPages: number }>()
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: any }>()
);

// Create User
export const createUser = createAction(
  '[Users] Create User',
  props<{ userData: UserFormData; file?: File }>()
);

export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: User }>()
);

export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: any }>()
);

// Update User
export const updateUser = createAction(
  '[Users] Update User',
  props<{ userId: string; userData: Partial<User> }>()
);

export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: any }>()
);

// Delete User
export const deleteUser = createAction(
  '[Users] Delete User',
  props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ userId: string }>()
);

export const deleteUserFailure = createAction(
  '[Users] Delete User Failure',
  props<{ error: any }>()
);

// Toggle User Status
export const toggleUserStatus = createAction(
  '[Users] Toggle User Status',
  props<{ userId: string; active: boolean }>()
);

// Filter Actions
export const setSearchTerm = createAction(
  '[Users] Set Search Term',
  props<{ searchTerm: string }>()
);

export const setCategory = createAction(
  '[Users] Set Category',
  props<{ category: string }>()
);

export const resetFilters = createAction('[Users] Reset Filters');

// Select User
export const selectUser = createAction(
  '[Users] Select User',
  props<{ user: User }>()
);

export const clearSelectedUser = createAction('[Users] Clear Selected User');

// Local Actions (for offline support)
export const addUserLocally = createAction(
  '[Users] Add User Locally',
  props<{ user: User }>()
);

export const updateUserLocally = createAction(
  '[Users] Update User Locally',
  props<{ user: User }>()
);

export const removeUserLocally = createAction(
  '[Users] Remove User Locally',
  props<{ userId: string }>()
);