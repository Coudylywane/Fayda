import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserRoleService } from '../services/user-role.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private userRoleService: UserRoleService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];
    const requireAllRoles = route.data['requireAllRoles'] as boolean || false;
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return this.userRoleService.currentUser$.pipe(
        map(user => !!user)
      );
    }

    const roleCheck$ = requireAllRoles 
      ? this.userRoleService.hasAllRoles(requiredRoles)
      : this.userRoleService.hasAnyRole(requiredRoles);

    return roleCheck$.pipe(
      map(hasRequiredRoles => {
        if (!hasRequiredRoles) {
          this.router.navigate(['tabs/home']);
          return false;
        }
        return true;
      })
    );
  }
}
