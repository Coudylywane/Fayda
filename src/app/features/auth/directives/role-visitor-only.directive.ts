// DIRECTIVE POUR AFFICHER UNIQUEMENT POUR LES VISITEURS EXCLUSIFS
import { Directive, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from "@angular/core";
import { Subscription } from "rxjs";
import { UserRoleService } from "../services/user-role.service";

@Directive({
  selector: '[appShowForVisiteurOnly]'
})
export class VisiteurOnlyDirective implements OnInit, OnDestroy {
  private subscription!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit() {
    this.subscription = this.userRoleService.canAccessVisiteurFeatures().subscribe(canAccess => {
      this.updateVisibility(canAccess);
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