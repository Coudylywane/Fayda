//users.state.ts
import { User } from '../../utilisateurs/modals/users.model';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: any;
  filters: {
    searchTerm: string;
    category: string;
  };
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export const initialUsersState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  filters: {
    searchTerm: '',
    category: 'Tous'
  },
  pagination: {
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0
  }
};