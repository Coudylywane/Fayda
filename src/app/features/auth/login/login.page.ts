import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Importez SEULEMENT les classes/interfaces
import { ModalController } from '@ionic/angular';


import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { filter, finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { Login } from '../models/auth.model';
import { selectAuthState } from '../store/auth.selectors';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { PhonenumberInputComponent } from 'src/app/shared/components/phonenumber-input/phonenumber-input.component';
import { ResetPasswordComponent } from '../../profil-modal/components/reset-password/reset-password.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
  ],
})
export class LoginPage {
  loginForm: FormGroup;
  hidePassword = true;
  loginError: string = '';
  isLoading = false;
  returnUrl: string;
  private destroy$ = new Subject<void>();
  private loginAttempted = false;

  selectedCountry: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store<AppState>,
    private confettiService: ConfettiService,
    private toast: ToastService,
    private modalCtrl: ModalController // <--- ajouté ici
  ) {
    this.loginForm = this.fb.group({
      username: ['dolnick', [Validators.required, Validators.minLength(3)]],
      password: ['user1234', [Validators.required, Validators.minLength(4)]],
    });

    // Récupérer l'URL de retour des paramètres de requête ou définir la valeur par défaut
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || 'tabs/home';

    // Rediriger si déjà connecté
    // if (this.authService.isLoggedIn()) {
    //   const redirectUrl = 'tabs/home';
    //   this.router.navigate([redirectUrl]);
    // }
  }

  ngOnInit(): void {
    this.store
      .select(selectAuthState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState) => {
        this.isLoading = authState.loading;
      });

    this.store
      .select(selectAuthState)
      .pipe(
        takeUntil(this.destroy$),
        filter((authState) => !authState.loading) // Attendre que le loading soit terminé
      )
      .subscribe((authState) => {
        this.loginError = authState.error ?? '';

        // Gérer la redirection après une tentative de login
        if (this.loginAttempted) {
          if (authState.isAuthenticated) {
            // Login réussi
            this.toast.showSuccess(authState.message!);
            setTimeout(() => {
              this.confettiService.triggerConfetti();
              this.router.navigate([this.returnUrl]);
            }, 750); // 750 ms Délai pour voir le toast et les confettis
            console.log('Redirection vers:', this.returnUrl);
          } else if (!authState.isAuthenticated && authState.error) {
            // Échec de login
            console.log('Échec de connexion:', authState.error);

            this.toast.showError(authState.error || 'Erreur de connexion');
            this.loginAttempted = false;
          }
        }
      });
  }

  login() {
    if (this.loginForm.valid) {
      this.loginAttempted = true;
      console.log(this.loginForm.value);

      this.authService.login(this.loginForm.value as Login);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormAsTouched();
      this.toast.showWarning(this.loginError);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async forgotPassword() {
    const email = this.loginForm.get('username')?.value || '';

    const modal = await this.modalCtrl.create({
      component: ResetPasswordComponent,
      componentProps: {
        email: email,
        phone: '', // ou récupère le téléphone si tu en as dans le contexte
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.toast.showSuccess('Mot de passe réinitialisé avec succès !');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}