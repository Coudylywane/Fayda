import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthState } from '../store/auth.selectors';
import { map, Observable, take } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    private router = inject(Router);
    private store = inject(Store);

    canActivate(): Observable<boolean> {
        return this.store.select(selectAuthState).pipe(
            take(1),
            map(authState => {
                if (authState.user!.roles?.includes('FAYDA_ROLE_USER')) {
                    // Si l'utilisateur a le rôle 'FAYDA_ROLE_USER', rediriger vers la page d'accueil
                    this.router.navigate(['tabs/home']);
                    return false;
                }
                return true;
            })
        );
    }
}
