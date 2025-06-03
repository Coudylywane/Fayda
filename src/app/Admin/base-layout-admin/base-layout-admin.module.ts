import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BaseLayoutAdminPageRoutingModule } from './base-layout-admin-routing.module';
import { BaseLayoutAdminPage } from './base-layout-admin.page';
import { ButtonComponent } from "../../shared/components/button/button.component";
import { PrimaryRoleVisibilityDirective } from 'src/app/features/auth/directives/primary-role-visibility.directive';
import { RoleHideDirective } from 'src/app/features/auth/directives/role-hide.directive';
import { RoleVisibilityDirective } from 'src/app/features/auth/directives/role-visibility.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BaseLayoutAdminPageRoutingModule,
    ButtonComponent,
    RoleVisibilityDirective,
    RoleHideDirective,
    PrimaryRoleVisibilityDirective
  ],
  declarations: [BaseLayoutAdminPage]
})
export class BaseLayoutAdminPageModule { }
