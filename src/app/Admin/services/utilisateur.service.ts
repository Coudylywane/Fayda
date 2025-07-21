import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import axios from 'axios';
import { User } from '../models/utilisateur.model';
  import { environment } from '../../../environments/environment';


interface ApiResponse {
  status: string;
  statusCodeValue: number;
  code: string;
  message: string;
  developerMessage: string;
  data: User[];
  timestamp: string;
  traceId: string;
  validationErrors: { field: string; rejectedValue: string; message: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private filtersSubject = new BehaviorSubject<any>({});
  public filters$ = this.filtersSubject.asObservable();

  // Assurez-vous que Environment est correctement importé
  
  private baseUrl = environment.apiUrl;

  constructor() {}

  // Récupérer les utilisateurs depuis l'API
  getAllUsers(page: number = 0, size: number = 10): Observable<User[]> {
    return new Observable<User[]>((observer) => {
      axios
        .get(`${this.baseUrl}/users`, {
          params: { page, size },
        })
        .then((response) => {
          const apiResponse: ApiResponse = response.data;
          if (apiResponse.status === 'SUCCESS') {
            this.usersSubject.next(apiResponse.data);
            observer.next(apiResponse.data);
            observer.complete();
          } else {
            observer.error(
              new Error(
                apiResponse.message ||
                  'Erreur lors de la récupération des utilisateurs'
              )
            );
          }
        })
        .catch((error) => {
          const errorResponse = error.response?.data || {};
          const errorMessage =
            errorResponse.message ||
            'Erreur lors de la récupération des utilisateurs';
          observer.error(new Error(errorMessage));
        });
    });
  }

  // Appliquer des filtres aux utilisateurs
  applyFilters(filters: any) {
    this.filtersSubject.next(filters);
  }

  // Obtenir les utilisateurs filtrés (localement pour l'instant)
  getFilteredUsers(): Observable<User[]> {
    return new Observable<User[]>((observer) => {
      const usersSub = this.users$.subscribe((users) => {
        const filtersSub = this.filters$.subscribe((filters) => {
          let filteredUsers = [...users];

          if (filters.role) {
            filteredUsers = filteredUsers.filter(
              (user) => user.role === filters.role
            );
          }

          if (filters.sexe) {
            filteredUsers = filteredUsers.filter(
              (user) => user.sexe === filters.sexe
            );
          }

          if (filters.dahira) {
            filteredUsers = filteredUsers.filter(
              (user) => user.dahira === filters.dahira
            );
          }

          if (filters.ageMin !== undefined) {
            filteredUsers = filteredUsers.filter(
              (user) => user.age >= filters.ageMin
            );
          }

          if (filters.ageMax !== undefined) {
            filteredUsers = filteredUsers.filter(
              (user) => user.age <= filters.ageMax
            );
          }

          observer.next(filteredUsers);
        });

        return () => {
          filtersSub.unsubscribe();
        };
      });

      return () => {
        usersSub.unsubscribe();
      };
    });
  }
}
