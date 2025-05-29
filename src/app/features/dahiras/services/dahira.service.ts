import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Dahira} from '../models/dahira.model';
import { Store } from '@ngrx/store';
import * as DahiraActions from '.././store/dahira.actions';

@Injectable({
  providedIn: 'root'
})
export class DahiraService {
  private dahirasSubject = new BehaviorSubject<Dahira[]>([]);
  public dahiras$ = this.dahirasSubject.asObservable();


  constructor(private store: Store) {
    // Initialiser avec les données
  }

  getDahirasPagined(currentPage: number, itemsPerPage: number){
    this.store.dispatch(DahiraActions.loadDahiras({ page: currentPage-1, size: itemsPerPage }));
  }

}