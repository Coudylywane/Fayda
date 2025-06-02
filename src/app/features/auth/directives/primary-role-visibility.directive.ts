//DIRECTIVE POUR AFFICHER SELON LE RÔLE PRINCIPAL

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { UserRoleService } from '../services/user-role.service';
import { Subscription } from 'rxjs';
import { UserRole } from '../models/user.model';

@Directive({
  selector: '[appShowForPrimaryRole]'
})
export class PrimaryRoleVisibilityDirective implements OnInit, OnDestroy {
  @Input() appShowForPrimaryRole: UserRole | UserRole[] | string | string[] = UserRole.VISITEUR;
  
  private subscription!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit() {
    const allowedRoles = this.normalizeRoles(this.appShowForPrimaryRole);
    
    this.subscription = this.userRoleService.primaryRole$.subscribe(primaryRole => {
      const shouldShow = primaryRole ? allowedRoles.includes(primaryRole) : false;
      this.updateVisibility(shouldShow);
    });
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
