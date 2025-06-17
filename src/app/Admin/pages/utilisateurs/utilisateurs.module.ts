import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// NgRx imports
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Store imports
import { usersReducer } from './store/users.reducer';
import { UsersEffects } from './store/users.effects';

// Components
import { UtilisateursPage } from './utilisateurs.page';
import { AddUserModalComponent } from './modals/add-user-modal/add-user-modal.component';
import { FilterUsersModalComponent } from './modals/filter-users-modal/filter-users-modal.component';
import { EditUserModalComponent } from './modals/edit-user-modal/edit-user-modal.component';
import { ViewUserModalComponent } from './modals/view-user-modal/view-user-modal.component';
import { LeftMenuComponent } from '../../components/left-menu/left-menu.component';

// Services
import { UserAdminService } from './services/useradmin.service';

// Shared components
import { IconButtonComponent } from "../../../shared/components/icon-button/icon-button.component";

const routes: Routes = [
  {
    path: '',
    component: UtilisateursPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,// Ajouté pour les formulaires réactifs
    IonicModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    IconButtonComponent, // Component standalone
    
    // NgRx Feature Module
    StoreModule.forFeature('users', usersReducer),
    EffectsModule.forFeature([UsersEffects])
  ],
  declarations: [
    UtilisateursPage,
    AddUserModalComponent,
    FilterUsersModalComponent,
    EditUserModalComponent,
    ViewUserModalComponent, // Ajouté si manquant
    LeftMenuComponent
  ],
  providers: [
    UserAdminService
  ]
})
export class UtilisateursPageModule {}