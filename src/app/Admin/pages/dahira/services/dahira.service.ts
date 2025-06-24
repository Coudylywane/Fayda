import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Dahira, DahiraMember, MemberRole } from '../models/dahira.model';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class DahiraServiceAdmin {
  //   private apiUrl = `${environment.apiUrl}/dahiras`;
  private dahirasSubject = new BehaviorSubject<Dahira[]>([]);
  public dahiras$ = this.dahirasSubject.asObservable();

  // Données mockées pour le développement


  constructor() {
  }

  /**
   * Obtenir les details d'une Dahira par ID
   * @param dahiraId 
   * @returns 
   */
  async getDahiraById(dahiraId: string) {
    try {
      const response = await axios.get(`dahiras/${dahiraId}/members`);
      console.log("getDisciple: ", response);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des disciples:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur de récupération de la Dahira',
        response: error.response
      };
    }
  }

  // Supprimer un Dahira
  deleteDahira(id: string): Observable<boolean> {
    // Pour la démo
    // const index = this.mockDahiras.findIndex(d => d.id === id);
    // if (index !== -1) {
    //   this.mockDahiras.splice(index, 1);
    //   this.dahirasSubject.next([...this.mockDahiras]);
    //   return of(true);
    // }

    // Dans une vraie implémentation :
    // return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    //   map(() => {
    //     const currentDahiras = this.dahirasSubject.value;
    //     this.dahirasSubject.next(currentDahiras.filter(d => d.id !== id));
    //     return true;
    //   })
    // );

    return of(false);
  }

  // Ajouter un membre à un Dahira
  addMemberToDahira(dahiraId: string, userId: string, role: MemberRole): Observable<boolean> {
    // Dans une vraie implémentation :
    // return this.http.post<void>(`${this.apiUrl}/${dahiraId}/members`, { userId, role }).pipe(
    //   map(() => true)
    // );

    return of(true);
  }

  // Retirer un membre d'un Dahira
  removeMemberFromDahira(dahiraId: string, userId: string): Observable<boolean> {
    // Dans une vraie implémentation :
    // return this.http.delete<void>(`${this.apiUrl}/${dahiraId}/members/${userId}`).pipe(
    //   map(() => true)
    // );

    return of(true);
  }
}