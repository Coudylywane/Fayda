// DIRECTIVE POUR AFFICHER POUR LES UTILISATEURS PRIVILÉGIÉS
import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";
import { UserRoleService } from "../services/user-role.service";

@Directive({
  selector: '[appShowForPrivileged]'
})
export class PrivilegedUserDirective implements OnInit, OnDestroy {
  private subscription!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit() {
    this.subscription = this.userRoleService.hasPrivilegedRoles().subscribe(hasPrivilegedRoles => {
      this.updateVisibility(hasPrivilegedRoles);
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
}