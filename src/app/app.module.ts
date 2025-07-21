/**
* @author Dr_EPL
* @summary "dolnickenzanza@gmail.com"
* @copyright 2025
*/

import { provideAppInitializer, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { authReducer } from './features/auth/store/auth.reducer';
import { AuthEffects } from './features/auth/store/auth.effects';
import { axiosInitializer } from './store/axios-initializer';
import { ToastComponent } from './shared/components/toast/toast.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DahiraEffects } from './features/dahiras/store/dahira.effects';
import { dahiraReducer } from './features/dahiras/store/dahira.reducers';
import { requestReducer } from './features/demandes/store/request.reducers';
import { RequestEffects } from './features/demandes/store/request.effects';
import { adminRequestReducer } from './Admin/pages/demandes/store/demande.reducers';
import { AdminRequestEffects } from './Admin/pages/demandes/store/demande.effects';
import { projectReducer } from './Admin/pages/projets/store/project.reducer';
import { ProjectEffects } from './Admin/pages/projets/store/project.effects';
import {  HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './features/auth/store/auth.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    FormsModule,
    StoreModule.forRoot({
      auth: authReducer,
      dahira: dahiraReducer,
      request: requestReducer,
      adminRequest: adminRequestReducer,
      project: projectReducer,
    }),
    IonicStorageModule.forRoot(),
    EffectsModule.forRoot([
      AuthEffects,
      DahiraEffects,
      RequestEffects,
      AdminRequestEffects,
      ProjectEffects,
    ]),
    ToastComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAppInitializer(axiosInitializer()),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}