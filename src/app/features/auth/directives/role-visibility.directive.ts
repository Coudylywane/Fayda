// DIRECTIVE POUR MASQUER/AFFICHER SELON LE RÔLE

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { UserRoleService } from '../services/user-role.service';
import { Subscription } from 'rxjs';
import { UserRole } from '../models/user.model';

@Directive({
  selector: '[appShowForRole]'
})
export class RoleVisibilityDirective implements OnInit, OnDestroy {
  @Input() appShowForRole: UserRole | UserRole[] | string | string[] = UserRole.VISITEUR;
  @Input() requireAllRoles: boolean = false; // Si true, l'utilisateur doit avoir TOUS les rôles
  
  private subscription!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit() {
    const allowedRoles = this.normalizeRoles(this.appShowForRole);
    
    const roleCheck$ = this.requireAllRoles 
      ? this.userRoleService.hasAllRoles(allowedRoles)
      : this.userRoleService.hasAnyRole(allowedRoles);

    this.subscription = roleCheck$.subscribe(hasRequiredRoles => {
      this.updateVisibility(hasRequiredRoles);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateVisibility(shouldShow: boolean) {
    if (shouldShow) {
      // Créer la vue seulement si elle n'existe pas déjà
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }

  private normalizeRoles(roles: UserRole | UserRole[] | string | string[]): UserRole[] {
    if (typeof roles === 'string') {
      return [roles as UserRole];
    }
    
    if (Array.isArray(roles)) {
      return roles.map(role => typeof role === 'string' ? role as UserRole : role);
    }
    
    return [roles];
  }
}
