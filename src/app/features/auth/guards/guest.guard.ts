import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthService } from '../services/auth.service';
import { selectAuthState } from '../store/auth.selectors';

// Le guard GuestGuard permet de protéger les routes qui ne doivent pas être accessibles aux utilisateurs connectés
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private router = inject(Router);
  private store = inject(Store);

  canActivate(): Observable<boolean> {
    return this.store.select(selectAuthState).pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && authState.user) {
          // Si l'utilisateur est authentifié, rediriger vers la page d'accueil
          this.router.navigate(['tabs/home']);
          return false;
        }
        return true;
      })
    );
  }
}