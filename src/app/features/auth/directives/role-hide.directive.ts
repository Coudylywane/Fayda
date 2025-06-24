// DIRECTIVE POUR MASQUER SELON LE RÔLE

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { UserRoleService } from '../services/user-role.service';
import { Subscription } from 'rxjs';
import { UserRole } from '../models/user.model';
@Directive({
  selector: '[appHideForRole]'
})
export class RoleHideDirective implements OnInit, OnDestroy {
  @Input() appHideForRole: UserRole | UserRole[] | string | string[] = UserRole.VISITEUR;
  @Input() hideForPrivilegedUsers: boolean = false; // Cache pour les utilisateurs avec des rôles privilégiés
  
  private subscription!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit() {
    const hiddenRoles = this.normalizeRoles(this.appHideForRole);
    
    if (this.hideForPrivilegedUsers) {
      // Cacher pour tous les utilisateurs ayant des rôles privilégiés
      this.subscription = this.userRoleService.hasPrivilegedRoles().subscribe(hasPrivilegedRoles => {
        this.updateVisibility(!hasPrivilegedRoles);
      });
    } else {
      // Logique normale
      this.subscription = this.userRoleService.hasAnyRole(hiddenRoles).subscribe(hasHiddenRole => {
        this.updateVisibility(!hasHiddenRole);
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateVisibility(shouldShow: boolean) {
    if (shouldShow) {
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