import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, catchError, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import * as UsersActions from './users.actions';
import { 
  ApiUser, 
  User, 
  ApiResponse, 
  PaginatedResponse,
  UserFormData,
  CreateUserRequest
} from '../../utilisateurs/modals/users.model';

@Injectable()
export class UsersEffects {
  private readonly API_BASE_URL = environment.apiBaseUrl;

  constructor(
    private actions$: Actions,
    private store: Store
  ) {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(({ page = 0, size = 50 }) =>
        from(this.fetchUsers(page, size)).pipe(
          map(response => {
            const users = response.users;
            const totalElements = response.totalElements;
            const totalPages = response.totalPages;
            return UsersActions.loadUsersSuccess({ users, totalElements, totalPages });
          }),
          catchError(error => of(UsersActions.loadUsersFailure({ error })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      switchMap(({ userData, file }) =>
        from(this.createUser(userData, file)).pipe(
          map(user => UsersActions.createUserSuccess({ user })),
          catchError(error => {
            // Créer un utilisateur local en cas d'échec
            const localUser = this.createUserWithFallback(userData);
            this.store.dispatch(UsersActions.addUserLocally({ user: localUser }));
            return of(UsersActions.createUserFailure({ error }));
          })
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ userId, userData }) =>
        from(this.updateUser(userId, userData)).pipe(
          map(user => UsersActions.updateUserSuccess({ user })),
          catchError(error => {
            // Mise à jour locale en cas d'échec
            if (userData) {
              const localUser = { id: userId, ...userData } as User;
              this.store.dispatch(UsersActions.updateUserLocally({ user: localUser }));
            }
            return of(UsersActions.updateUserFailure({ error }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUser),
      switchMap(({ userId }) =>
        from(this.deleteUser(userId)).pipe(
          map(() => UsersActions.deleteUserSuccess({ userId })),
          catchError(error => {
            // Suppression locale en cas d'échec
            this.store.dispatch(UsersActions.removeUserLocally({ userId }));
            return of(UsersActions.deleteUserFailure({ error }));
          })
        )
      )
    )
  );

  toggleUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.toggleUserStatus),
      map(({ userId, active }) => 
        UsersActions.updateUser({ userId, userData: { active } })
      )
    )
  );

  // Recharger les utilisateurs après création/mise à jour/suppression réussie
  reloadAfterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.createUserSuccess,
        UsersActions.updateUserSuccess,
        UsersActions.deleteUserSuccess
      ),
      map(() => UsersActions.loadUsers({}))
    )
  );

  // Méthodes privées pour les appels API
  private async fetchUsers(page: number, size: number): Promise<{ users: User[], totalElements: number, totalPages: number }> {
    const token = this.getToken();
    const response = await axios.get<ApiResponse<PaginatedResponse<ApiUser>>>(
      `${this.API_BASE_URL}/users?page=${page}&size=${size}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );

    if (response.data?.data?.content) {
      const apiUsers = response.data.data.content;
      const users = apiUsers.map(apiUser => this.mapApiUserToDisplayUser(apiUser));
      return {
        users,
        totalElements: response.data.data.totalElements || 0,
        totalPages: response.data.data.totalPages || 0
      };
    }
    return { users: [], totalElements: 0, totalPages: 0 };
  }

  private async createUser(userData: UserFormData, file?: File): Promise<User> {
    const token = this.getToken();
    const createUserData = this.mapFormDataToCreateRequest(userData);

    const formData = new FormData();
    
    // Tous les champs requis
    formData.append('firstName', createUserData.firstName);
    formData.append('lastName', createUserData.lastName);
    formData.append('email', createUserData.email);
    formData.append('username', createUserData.username);
    formData.append('password', createUserData.password);
    formData.append('phoneNumber', createUserData.phoneNumber || '');
    formData.append('gender', createUserData.gender);
    formData.append('userIdKeycloak', createUserData.userIdKeycloak);
    formData.append('dateOfBirth', createUserData.dateOfBirth);
    formData.append('role', createUserData.role);
    formData.append('active', String(createUserData.active));
    
    // Location comme objet JSON
    formData.append('location', JSON.stringify(createUserData.location));
    
    // Image si présente
    if (file) {
      formData.append('image', file, file.name);
    }

    const response = await axios.post<ApiResponse<ApiUser>>(
      `${this.API_BASE_URL}/users`,
      formData,
      {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          // Ne pas spécifier Content-Type, axios le fera automatiquement pour multipart/form-data
        }
      }
    );

    return this.mapApiUserToDisplayUser(response.data.data);
  }

  private async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    const response = await axios.put<ApiResponse<ApiUser>>(
      `${this.API_BASE_URL}/users/${userId}`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );

    return this.mapApiUserToDisplayUser(response.data.data);
  }

  private async deleteUser(userId: string): Promise<void> {
    const token = this.getToken();
    await axios.delete<ApiResponse<any>>(
      `${this.API_BASE_URL}/users/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private mapApiUserToDisplayUser(apiUser: ApiUser): User {
    return {
      id: apiUser.userId,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      email: apiUser.email,
      userIdKeycloak: apiUser.userIdKeycloak,
      phoneNumber: apiUser.phoneNumber,
      gender: apiUser.gender,
      dateOfBirth: apiUser.dateOfBirth,
      location: apiUser.location,
      active: apiUser.active,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt,
      name: `${apiUser.firstName} ${apiUser.lastName}`,
      category: this.determineCategoryFromRole(apiUser.userIdKeycloak),
      image: this.getDefaultImageByGender(apiUser.gender)
    };
  }

  private mapFormDataToCreateRequest(userData: UserFormData): CreateUserRequest {
    let firstName = userData.firstName || '';
    let lastName = userData.lastName || '';
    if (userData.name && !firstName && !lastName) {
      const nameParts = userData.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    return {
      firstName,
      lastName,
      email: userData.email || '',
      username: userData.username || userData.email || '',
      userIdKeycloak: userData.userIdKeycloak || '',
      password: userData.password || 'TempPassword123!',
      phoneNumber: userData.phoneNumber || userData.phone || '',
      gender: userData.gender || 'NON_SPECIFIED',
      dateOfBirth: userData.dateOfBirth || new Date().toISOString().split('T')[0],
      location: {
        locationInfoId: userData.location?.locationInfoId || Date.now().toString(),
        nationality: userData.location?.nationality || 'Sénégalaise',
        country: userData.location?.country || 'Sénégal',
        region: userData.location?.region || 'Dakar',
        department: userData.location?.department || 'Dakar',
        address: userData.location?.address || userData.address || ''
      },
      role: userData.role || 'DISCIPLE',
      active: userData.active !== undefined ? userData.active : true
    };
  }

  private determineCategoryFromRole(userIdKeycloak?: string): string {
    if (!userIdKeycloak) return 'Disciples';
    const id = userIdKeycloak.toLowerCase();
    if (id.includes('mouqadam')) return 'Mouqadam';
    if (id.includes('resp') || id.includes('responsable')) return 'Resp. Dahira';
    if (id.includes('visiteur')) return 'Visiteurs';
    return 'Disciples';
  }

  private getDefaultImageByGender(gender: string): string {
    const genderLower = gender?.toLowerCase() || '';
    if (genderLower.includes('femme') || genderLower.includes('female') || genderLower.includes('f')) {
      return 'assets/images/female-avatar.png';
    }
    return 'assets/images/male-avatar.png';
  }

  private createUserWithFallback(userData: UserFormData): User {
    return {
      id: Date.now().toString(),
      firstName: userData.firstName || userData.name?.split(' ')[0] || '',
      lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
      email: userData.email || '',
      userIdKeycloak: userData.userIdKeycloak || '',
      phoneNumber: userData.phoneNumber || userData.phone || '',
      gender: userData.gender || 'NON_SPECIFIED',
      dateOfBirth: userData.dateOfBirth || new Date().toISOString().split('T')[0],
      location: {
        locationInfoId: userData.location?.locationInfoId || Date.now().toString(),
        nationality: userData.location?.nationality || 'Sénégalaise',
        country: userData.location?.country || 'Sénégal',
        region: userData.location?.region || 'Dakar',
        department: userData.location?.department || 'Dakar',
        address: userData.location?.address || userData.address || ''
      },
      role: userData.role || 'DISCIPLE',
      active: userData.active !== undefined ? userData.active : true,
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      category: userData.category || 'Disciples',
      image: userData.image || this.getDefaultImageByGender(userData.gender || '')
    };
  }
}