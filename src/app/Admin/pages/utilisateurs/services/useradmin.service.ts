import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, from, throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { 
  User, 
  ApiUser, 
  CreateUserRequest, 
  UserFormData, 
  ApiResponse, 
  PaginatedResponse,
  LocationInfo 
} from '../modals/users.model';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  private isInitialized = false;

  constructor() {}

  // Initialisation du service
  initialize(): void {
    if (!this.isInitialized) {
      this.loadUsers().subscribe({
        next: users => {
          this.usersSubject.next(users);
          this.isInitialized = true;
        },
        error: error => {
          console.error('Erreur initialisation utilisateurs:', error);
          this.usersSubject.next([]);
        }
      });
    }
  }

  // Mapping des données API vers le modèle d'affichage
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
      
      // Propriétés calculées
      name: `${apiUser.firstName} ${apiUser.lastName}`,
      category: this.determineCategoryFromRole(apiUser.userIdKeycloak),
      image: this.getDefaultImageByGender(apiUser.gender)
    };
  }

  // Mapping des données du formulaire vers CreateUserRequest
  private mapFormDataToCreateRequest(userData: UserFormData): CreateUserRequest {
    // Gestion du nom complet si fourni
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

  // Logique de détermination de catégorie
  private determineCategoryFromRole(userIdKeycloak?: string): string {
    // Logique temporaire - à adapter selon vos besoins
    if (!userIdKeycloak) return 'Disciples';
    
    // Exemple de logique basée sur des patterns dans l'ID Keycloak
    const id = userIdKeycloak.toLowerCase();
    if (id.includes('mouqadam')) return 'Mouqadam';
    if (id.includes('resp') || id.includes('responsable')) return 'Resp. Dahira';
    if (id.includes('visiteur')) return 'Visiteurs';
    
    return 'Disciples';
  }

  // Image par défaut selon le genre
  private getDefaultImageByGender(gender: string): string {
    const genderLower = gender?.toLowerCase() || '';
    if (genderLower.includes('femme') || genderLower.includes('female') || genderLower.includes('f')) {
      return 'assets/images/female-avatar.png';
    }
    return 'assets/images/male-avatar.png';
  }

  // Chargement des utilisateurs avec pagination
  loadUsers(page: number = 0, size: number = 50): Observable<User[]> {
    return from(
      axios.get<ApiResponse<PaginatedResponse<ApiUser>>>(
        `${this.API_BASE_URL}/users?page=${page}&size=${size}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        }
      )
    ).pipe(
      map(response => {
        if (response.data?.data?.content) {
          const apiUsers = response.data.data.content;
          const users = apiUsers.map(apiUser => this.mapApiUserToDisplayUser(apiUser));
          
          // Mise à jour du BehaviorSubject uniquement pour la première page
          if (page === 0) {
            this.usersSubject.next(users);
          }
          
          return users;
        }
        return [];
      }),
      catchError(error => {
        console.error('Erreur chargement utilisateurs:', error.response?.data || error.message);
        if (page === 0) {
          this.usersSubject.next([]);
        }
        return throwError(() => error);
      })
    );
  }

  // Création d'un utilisateur
  createUser(userData: UserFormData): Observable<any> {
    const createUserData = this.mapFormDataToCreateRequest(userData);

    return from(
      axios.post<ApiResponse<ApiUser>>(
        `${this.API_BASE_URL}/users`, 
        createUserData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    ).pipe(
      map(response => {
        // Recharger la liste après création réussie
        setTimeout(() => this.loadUsers().subscribe(), 100);
        return response.data;
      }),
      catchError(error => {
        console.error('Erreur création utilisateur:', error.response?.data || error.message);
        return throwError(() => error.response?.data || error);
      })
    );
  }

  // Mise à jour d'un utilisateur
  updateUser(userId: string, userData: Partial<User>): Observable<any> {
    return from(
      axios.put<ApiResponse<ApiUser>>(
        `${this.API_BASE_URL}/users/${userId}`, 
        userData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    ).pipe(
      map(response => {
        setTimeout(() => this.loadUsers().subscribe(), 100);
        return response.data;
      }),
      catchError(error => {
        console.error('Erreur mise à jour utilisateur:', error.response?.data || error.message);
        return throwError(() => error.response?.data || error);
      })
    );
  }

  // Suppression d'un utilisateur
  deleteUser(userId: string): Observable<any> {
    return from(
      axios.delete<ApiResponse<any>>(
        `${this.API_BASE_URL}/users/${userId}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    ).pipe(
      map(response => {
        setTimeout(() => this.loadUsers().subscribe(), 100);
        return response.data;
      }),
      catchError(error => {
        console.error('Erreur suppression utilisateur:', error.response?.data || error.message);
        return throwError(() => error.response?.data || error);
      })
    );
  }

  // Ajout local d'un utilisateur (fallback)
  addUserLocally(newUser: User): void {
    const currentUsers = this.usersSubject.getValue();
    this.usersSubject.next([newUser, ...currentUsers]);
  }

  // Mise à jour locale d'un utilisateur
  updateUserLocally(updatedUser: User): void {
    const currentUsers = this.usersSubject.getValue();
    const index = currentUsers.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      currentUsers[index] = updatedUser;
      this.usersSubject.next([...currentUsers]);
    }
  }

  // Suppression locale d'un utilisateur
  removeUserLocally(userId: string): void {
    const currentUsers = this.usersSubject.getValue();
    const filteredUsers = currentUsers.filter(user => user.id !== userId);
    this.usersSubject.next(filteredUsers);
  }

  // Création d'un utilisateur avec fallback local
  createUserWithFallback(userData: UserFormData): User {
    const newUser: User = {
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

    return newUser;
  }

  // Obtenir les utilisateurs actuels
  getCurrentUsers(): User[] {
    return this.usersSubject.getValue();
  }

  // Réinitialiser le service
  reset(): void {
    this.usersSubject.next([]);
    this.isInitialized = false;
  }
}
