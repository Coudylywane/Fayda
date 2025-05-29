import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Dahira} from '../models/dahira.model';

@Injectable({
  providedIn: 'root'
})
export class DahiraService {
  private dahirasSubject = new BehaviorSubject<Dahira[]>([]);
  public dahiras$ = this.dahirasSubject.asObservable();
  
  // Données mockées pour le développement
  private mockDahiras: Dahira[] = Array(25).fill(null).map((_, i) => ({
    dahiraId: `dahira-${i + 1}`,
    dahiraName: `Dahira Mouhamadou Mourtada ${i + 1}`,
    email: `dahira${i + 1}@example.com`, // Ajout d'un email factice
    phoneNumber: `123-456-789${i}`, // Ajout d'un numéro de téléphone factice
    numberOfDisciples: 4*i+13,
    active: !(i%2)
  }));

  constructor() {
    // Initialiser avec les données mockées
    this.dahirasSubject.next(this.mockDahiras);
  }

  // Obtenir tous les Dahiras (paginés)
  getDahiras(page: number = 1, limit: number = 10, search: string = '', filters: any = {}): Observable<{ dahiras: Dahira[], total: number }> {
    // Pour la démo, nous filtrons les données mockées
    let filteredDahiras = [...this.mockDahiras];
    
    // Appliquer la recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDahiras = filteredDahiras.filter(
        d => d.dahiraName.toLowerCase().includes(searchLower)
      );
    }
    
    // Appliquer les filtres (à implémenter selon les besoins)
    
    // Calculer la pagination
    const total = filteredDahiras.length;
    const startIndex = (page - 1) * limit;
    const paginatedDahiras = filteredDahiras.slice(startIndex, startIndex + limit);
    
    return of({ dahiras: paginatedDahiras, total });
    
    // Dans une vraie implémentation, utilisez HTTP :
    // return this.http.get<{ dahiras: Dahira[], total: number }>
    //   (`${this.apiUrl}?page=${page}&limit=${limit}&search=${search}`);
  }

}