import { createReducer, on } from '@ngrx/store';
import { UsersState, initialUsersState } from './users.state';
import * as UsersActions from './users.actions';

export const usersReducer = createReducer(
  initialUsersState,
  
  // Load Users
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UsersActions.loadUsersSuccess, (state, { users, totalElements, totalPages }) => ({
    ...state,
    users,
    loading: false,
    error: null,
    pagination: {
      ...state.pagination,
      totalElements,
      totalPages
    }
  })),
  
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create User
  on(UsersActions.createUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UsersActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [user, ...state.users],
    loading: false,
    error: null
  })),
  
  on(UsersActions.createUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update User
  on(UsersActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UsersActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map(u => u.id === user.id ? user : u),
    selectedUser: state.selectedUser?.id === user.id ? user : state.selectedUser,
    loading: false,
    error: null
  })),
  
  on(UsersActions.updateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Delete User
  on(UsersActions.deleteUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(UsersActions.deleteUserSuccess, (state, { userId }) => ({
    ...state,
    users: state.users.filter(u => u.id !== userId),
    selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser,
    loading: false,
    error: null
  })),
  
  on(UsersActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Toggle User Status
  on(UsersActions.toggleUserStatus, (state, { userId, active }) => ({
    ...state,
    users: state.users.map(u => 
      u.id === userId ? { ...u, active } : u
    )
  })),
  
  // Filters
  on(UsersActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    filters: {
      ...state.filters,
      searchTerm
    }
  })),
  
  on(UsersActions.setCategory, (state, { category }) => ({
    ...state,
    filters: {
      ...state.filters,
      category
    }
  })),
  
  on(UsersActions.resetFilters, (state) => ({
    ...state,
    filters: {
      searchTerm: '',
      category: 'Tous'
    }
  })),
  
  // Select User
  on(UsersActions.selectUser, (state, { user }) => ({
    ...state,
    selectedUser: user
  })),
  
  on(UsersActions.clearSelectedUser, (state) => ({
    ...state,
    selectedUser: null
  })),
  
  // Local Actions
  on(UsersActions.addUserLocally, (state, { user }) => ({
    ...state,
    users: [user, ...state.users]
  })),
  
  on(UsersActions.updateUserLocally, (state, { user }) => ({
    ...state,
    users: state.users.map(u => u.id === user.id ? user : u)
  })),
  
  on(UsersActions.removeUserLocally, (state, { userId }) => ({
    ...state,
    users: state.users.filter(u => u.id !== userId)
  }))
);