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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    FormsModule,
    StoreModule.forRoot({ auth: authReducer, dahira: dahiraReducer, request: requestReducer }),
    IonicStorageModule.forRoot(),
    EffectsModule.forRoot([AuthEffects, DahiraEffects, RequestEffects]),
    ToastComponent
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAppInitializer(axiosInitializer()),
    provideAnimations()
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}