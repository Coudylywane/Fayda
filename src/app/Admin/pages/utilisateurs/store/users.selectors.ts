import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.state';
import { User } from '../../utilisateurs/modals/users.model';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectAllUsers = createSelector(
  selectUsersState,
  (state: UsersState) => state.users
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  (state: UsersState) => state.loading
);

export const selectUsersError = createSelector(
  selectUsersState,
  (state: UsersState) => state.error
);

export const selectSelectedUser = createSelector(
  selectUsersState,
  (state: UsersState) => state.selectedUser
);

export const selectFilters = createSelector(
  selectUsersState,
  (state: UsersState) => state.filters
);

export const selectSearchTerm = createSelector(
  selectFilters,
  (filters) => filters.searchTerm
);

export const selectCategory = createSelector(
  selectFilters,
  (filters) => filters.category
);

export const selectPagination = createSelector(
  selectUsersState,
  (state: UsersState) => state.pagination
);

// Sélecteur pour les utilisateurs filtrés
export const selectFilteredUsers = createSelector(
  selectAllUsers,
  selectFilters,
  (users: User[], filters) => {
    let filtered = [...users];
    
    // Filtrage par catégorie
    if (filters.category !== 'Tous') {
      filtered = filtered.filter(user => user.category === filters.category);
    }
    
    // Filtrage par terme de recherche
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.category?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }
);

// Sélecteur pour le nombre d'utilisateurs
export const selectUsersCount = createSelector(
  selectAllUsers,
  (users: User[]) => users.length
);

// Sélecteur pour le nombre d'utilisateurs filtrés
export const selectFilteredUsersCount = createSelector(
  selectFilteredUsers,
  (users: User[]) => users.length
);

// Sélecteur pour les utilisateurs par catégorie
export const selectUsersByCategory = (category: string) => createSelector(
  selectAllUsers,
  (users: User[]) => users.filter(user => user.category === category)
);

// Sélecteur pour l'utilisateur par ID
export const selectUserById = (userId: string) => createSelector(
  selectAllUsers,
  (users: User[]) => users.find(user => user.id === userId)
);

// Sélecteur pour vérifier si des utilisateurs existent
export const selectHasUsers = createSelector(
  selectUsersCount,
  (count: number) => count > 0
);

// Sélecteur pour vérifier si des résultats filtrés existent
export const selectHasFilteredResults = createSelector(
  selectFilteredUsersCount,
  (count: number) => count > 0
);