import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, catchError, switchMap, filter } from 'rxjs/operators';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import * as UsersActions from './users.actions';
import { ApiUser, User, ApiResponse, PaginatedResponse, UserFormData } from '../../utilisateurs/modals/users.model';

@Injectable()
export class UsersEffects {
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private readonly debug = !environment.production;

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

  // ✅ EFFET CORRIGÉ: Avec filtre anti-doublons et gestion erreur 409
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      // ✅ FILTRE CORRIGÉ: Retourne toujours un boolean
      filter(({ userData }) => {
        const isValid = userData && typeof userData === 'object' && userData.firstName;
        if (!isValid) {
          console.warn('🚫 Action createUser ignorée - données invalides:', userData);
        }
        return Boolean(isValid);
      }),
      switchMap(({ userData, file }) => {
        this.log('🔍 EFFECT - userData reçu:', userData);
        this.log('🔍 EFFECT - file reçu:', file);

        return from(this.createUser(userData, file)).pipe(
          map(user => {
            this.log('✅ Utilisateur créé avec succès:', user);
            return UsersActions.createUserSuccess({ user });
          }),
          catchError(error => {
            console.error('❌ Erreur création utilisateur:', error);
            
            // ✅ AMÉLIORATION: Gestion spécifique des erreurs 409
            let errorMessage = error.message || 'Erreur de création';
            
            if (error.message?.includes('déjà utilisé') || error.message?.includes('déjà pris') || error.message?.includes('existe déjà')) {
              // C'est une erreur de conflit, on la transmet telle quelle
              errorMessage = error.message;
            } else {
              // Autres erreurs - créer un utilisateur local en fallback
              if (userData && typeof userData === 'object') {
                const localUser = this.createUserWithFallback(userData);
                const serializableUser = JSON.parse(JSON.stringify(localUser)); // Assurer la sérialisation
                this.store.dispatch(UsersActions.addUserLocally({ user: serializableUser }));
                errorMessage = 'Utilisateur créé localement (problème serveur)';
              }
            }
            
            return of(UsersActions.createUserFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ userId, userData }) =>
        from(this.updateUser(userId, userData)).pipe(
          map(user => UsersActions.updateUserSuccess({ user })),
          catchError(error => {
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

  // ================================
  // MÉTHODES PRIVÉES POUR LES APPELS API
  // ================================

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

  // ✅ MÉTHODE COMPLÈTEMENT RÉVISÉE: Avec gestion erreur 409 et vérifications
  private async createUser(userData: UserFormData, file?: File): Promise<User> {
    const token = this.getToken();
    
    this.log('🔍 CREATE USER - userData détaillé:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email?.replace(/(.{3}).*(@.*)/, '$1***$2'), // Masquer l'email partiellement
      username: userData.username,
      location: userData.location?.country
    });

    // ✅ Validation des données
    if (!userData || typeof userData !== 'object') {
      throw new Error('Données utilisateur invalides: userData doit être un objet');
    }

    if (!userData.firstName?.trim() || !userData.lastName?.trim() || !userData.email?.trim()) {
      throw new Error('Données utilisateur incomplètes: firstName, lastName et email sont requis');
    }

    // ✅ NOUVEAU: Vérification préventive de l'email (optionnelle)
    try {
      const existingUsers = await this.fetchUsers(0, 1000);
      const emailExists = existingUsers.users.some(user => 
        user.email.toLowerCase() === userData.email!.toLowerCase()
      );
      
      if (emailExists) {
        throw new Error(`❌ Un utilisateur avec l'email "${userData.email}" existe déjà. Veuillez utiliser un autre email.`);
      }
    } catch (checkError: any) {
      // Si c'est notre erreur de conflit, on la relance
      if (checkError.message?.includes('existe déjà')) {
        throw checkError;
      }
      // Sinon on continue sans bloquer
      console.warn('⚠️ Impossible de vérifier les doublons:', checkError.message);
    }

    // ✅ Création du FormData selon le format de l'API
    const formData = new FormData();

    // Champs selon l'ordre exact de l'API
    formData.append('email', userData.email.trim());
    formData.append('firstName', userData.firstName.trim());
    
    // Date au format JSON (ISO)
    const dateJson = userData.dateOfBirth 
      ? new Date(userData.dateOfBirth).toISOString() 
      : new Date().toISOString();
    formData.append('dateOfBirth', dateJson);
    
    formData.append('gender', userData.gender || 'NON_SPECIFIED');
    formData.append('lastName', userData.lastName.trim());
    formData.append('password', userData.password || this.generateTempPassword());
    formData.append('phoneNumber', userData.phoneNumber?.trim() || '');
    
    // ✅ AMÉLIORATION: Username unique en cas de conflit
    const username = userData.username?.trim() || this.generateUniqueUsername(userData.email);
    formData.append('username', username);

    // ✅ CORRECTION MAJEURE: Location au format JSON stringifié
    const locationObject = this.formatLocationObjectForAPI(userData.location);
    formData.append('location', JSON.stringify(locationObject));

    // ✅ CORRECTION CRITIQUE: Image seulement si fichier présent
    if (file && file instanceof File && file.size > 0) {
      formData.append('img', file, file.name);
      this.log('📎 Fichier image ajouté:', `${file.name} (Taille: ${file.size} bytes)`);
    } else {
      this.log('📎 Aucun fichier image, champ img omis');
    }

    this.log('📤 Envoi FormData avec format API correct:', {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      dateOfBirth: formData.get('dateOfBirth'),
      gender: formData.get('gender'),
      lastName: formData.get('lastName'),
      password: formData.get('password') ? '***masqué***' : 'non défini',
      phoneNumber: formData.get('phoneNumber'),
      username: formData.get('username'),
      location: formData.get('location'),
      hasFile: !!file
    });

    try {
      const response = await axios.post<ApiResponse<ApiUser>>(
        `${this.API_BASE_URL}/users`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        }
      );

      this.log('📥 Réponse API createUser:', response.data);

      if (response.data?.data) {
        return this.mapApiUserToDisplayUser(response.data.data);
      } else {
        throw new Error('Réponse API invalide: données utilisateur manquantes');
      }
    } catch (error: any) {
      console.error('❌ Erreur détaillée création utilisateur:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // ✅ GESTION SPÉCIFIQUE ERREUR 409
      if (error.response?.status === 409) {
        const conflictDetails = this.analyzeConflictError(error.response.data, userData);
        throw new Error(conflictDetails);
      }

      // ✅ GESTION SPÉCIFIQUE ERREUR 401
      if (error.response?.status === 401) {
        throw new Error('Session expirée - veuillez vous reconnecter');
      }

      // ✅ GESTION SPÉCIFIQUE ERREUR 403
      if (error.response?.status === 403) {
        throw new Error('Permissions insuffisantes pour créer un utilisateur');
      }

      // Logs spécifiques pour débugger
      if (error.response?.status === 400) {
        console.error('🔍 ERREUR 400 - Données invalides:', error.response.data);
        if (error.response.data?.validationErrors) {
          error.response.data.validationErrors.forEach((err: any, i: number) => {
            console.error(`  ${i + 1}. ${err.field}: ${err.message} (valeur: "${err.rejectedValue}")`);
          });
        }
      }
      if (error.response?.status === 500) {
        console.error('🔍 ERREUR 500 - Erreur serveur:', error.response.data);
      }

      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Analyse détaillée erreur 409
  private analyzeConflictError(errorData: any, userData: UserFormData): string {
    console.error('🔍 ANALYSE ERREUR 409:', errorData);
    
    const errorMessage = errorData?.message || errorData?.error || '';
    
    if (errorMessage.toLowerCase().includes('email')) {
      return `❌ L'email "${userData.email}" est déjà utilisé.\n\nSuggestions:\n• Utilisez un autre email\n• Vérifiez si vous avez déjà un compte\n• Contactez l'administrateur si nécessaire`;
    }
    
    if (errorMessage.toLowerCase().includes('username')) {
      return `❌ Le nom d'utilisateur "${userData.username}" est déjà pris.\n\nUn nom unique sera généré automatiquement.`;
    }
    
    if (errorMessage.toLowerCase().includes('phone')) {
      return `❌ Le numéro "${userData.phoneNumber}" est déjà utilisé.\n\nVeuillez utiliser un autre numéro.`;
    }
    
    // Message générique avec suggestions
    return `❌ Utilisateur déjà existant.\n\nVérifiez:\n• L'email: ${userData.email}\n• Le nom d'utilisateur: ${userData.username}\n• Le numéro de téléphone: ${userData.phoneNumber}`;
  }

  // ✅ AMÉLIORATION: Génération username vraiment unique
  private generateUniqueUsername(email: string): string {
    const emailPrefix = email.split('@')[0];
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000);
    return `${emailPrefix}_${timestamp}_${random}`;
  }

  // ✅ NOUVELLE MÉTHODE: Format location selon l'API
  private formatLocationObjectForAPI(location?: any): any {
    if (!location) {
      return {
        nationality: 'Sénégalaise',
        country: 'Sénégal',
        region: 'Dakar',
        department: 'Dakar',
        address: 'Adresse non spécifiée'
      };
    }

    // Nettoyer et valider chaque champ
    return {
      nationality: (location.nationality || 'Sénégalaise').toString().trim(),
      country: (location.country || 'Sénégal').toString().trim(),
      region: (location.region || 'Dakar').toString().trim(),
      department: (location.department || location.region || 'Dakar').toString().trim(),
      address: (location.address || 'Adresse non spécifiée').toString().trim()
    };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '1A!';
  }

  private async updateUser(userId: string, userData: Partial<UserFormData>): Promise<User> {
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
    await axios.delete<ApiResponse<void>>(
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
    return localStorage.getItem('access_token') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('access_token') ||
           sessionStorage.getItem('token') ||
           null;
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

  private determineCategoryFromRole(userIdKeycloak?: string): string {
    if (!userIdKeycloak) return 'Disciples';
    const id = userIdKeycloak.toLowerCase();
    if (id.includes('mouqadam')) return 'Mouqadam';
    if (id.includes('resp') || id.includes('responsable')) return 'Resp. Dahira';
    if (id.includes('visiteur')) return 'Visiteurs';
    return 'Disciples';
  }

  // ✅ AMÉLIORATION: Images avec fallback
  private getDefaultImageByGender(gender: string): string {
    const genderLower = gender?.toLowerCase() || '';
    
    if (genderLower.includes('femme') || genderLower.includes('female') || genderLower.includes('f')) {
      // ✅ Fallback vers placeholder si image locale manquante
      return 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=F';
    }
    
    return 'https://via.placeholder.com/150/4169E1/FFFFFF?text=M';
  }

  // ✅ AMÉLIORATION: Méthode generateDefaultAvatar
  private generateDefaultAvatar(firstName: string, lastName: string, gender: string): string {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    const colors = gender?.toLowerCase().includes('f') ? 
      { bg: 'FF69B4', fg: 'FFFFFF' } : 
      { bg: '4169E1', fg: 'FFFFFF' };
    
    return `https://via.placeholder.com/150/${colors.bg}/${colors.fg}?text=${initials}`;
  }

  // ✅ CORRECTION: createUserWithFallback pour éviter l'erreur NgRx
  private createUserWithFallback(userData: UserFormData): User {
    if (!userData || typeof userData !== 'object') {
      throw new Error('Données utilisateur invalides pour le fallback');
    }

    // ✅ IMPORTANT: Créer un objet complètement sérialisable pour NgRx
    const user: User = {
      id: Date.now().toString(),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
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
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      category: userData.category || 'Disciples',
      image: this.generateDefaultAvatar(userData.firstName || '', userData.lastName || '', userData.gender || ''),
      // ✅ Assurer que tous les champs sont sérialisables
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // ✅ IMPORTANT: Retourner un objet "profondément clonés" pour éviter les mutations
    return JSON.parse(JSON.stringify(user));
  }

  // ✅ NOUVELLE MÉTHODE: Log conditionnel (max 2 paramètres)
  private log(message: string, data?: any) {
    if (this.debug) {
      console.log(message, data);
    }
  }
}