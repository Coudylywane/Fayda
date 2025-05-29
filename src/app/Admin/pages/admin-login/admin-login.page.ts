import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { Login } from 'src/app/features/auth/models/auth.model';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { selectAuthState } from 'src/app/features/auth/store/auth.selectors';
import { AppState } from 'src/app/store/app.state';
import { ConfettiService } from '../../services/confetti.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
  standalone: false,
})
export class AdminLoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup
  hidePassword = true
  isLoading = false
  loginError: string = ""
  returnUrl: string
  private destroy$ = new Subject<void>();
  private loginAttempted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store<AppState>,
    private confettiService: ConfettiService,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      username: ["dolnick", [Validators.required, Validators.minLength(3)]],
      password: ["user123", [Validators.required, Validators.minLength(4)]],
    })

    // Récupérer l'URL de retour des paramètres de requête ou définir la valeur par défaut
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "admin/dashboard"
  }

  ngOnInit(): void {
    this.store.select(selectAuthState).pipe(
      takeUntil(this.destroy$),
    ).subscribe(authState => {
      this.isLoading = authState.loading;
    });

    // Souscrire aux changements d'état d'authentification
    this.store.select(selectAuthState)
      .pipe(
        takeUntil(this.destroy$),
        filter(authState => !authState.loading) // Attendre que le loading soit terminé
      )
      .subscribe(authState => {
        this.isLoading = authState.loading;
        this.loginError = authState.error ?? '';

        console.log("Auth state:", authState);

        // Gérer la redirection après une tentative de login
        if (this.loginAttempted) {
          if (authState.isAuthenticated && authState.isAdmin) {
            // Login réussi et utilisateur admin
            this.toast.showSuccess(authState.message!);
            this.confettiService.triggerConfetti();
            setTimeout(() => {
              this.router.navigate([this.returnUrl]);
            }, 750); // Délai de 750 ms pour voir le toast et les confettis
            console.log("Redirection vers:", this.returnUrl);
          } else if (authState.isAuthenticated && !authState.isAdmin) {
            // Login réussi mais pas admin
            this.authService.logout();
            this.toast.showError("Accès refusé : Vous n'êtes pas autorisé à accéder à cette page");
            this.loginAttempted = false;
          } else if (!authState.isAuthenticated && authState.error) {
            // Échec de login
            this.toast.showError(authState.error || "Erreur de connexion");
            this.loginAttempted = false;
          }
        }
      });
  }

  login() {
    if (this.loginForm.valid) {
      this.loginAttempted = true;
      this.authService.login(this.loginForm.value as Login);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormAsTouched();
      this.toast.showWarning(this.loginError);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword
  }

  forgotPassword() {
    this.toast.showWarning("Fonctionnalité de récupération de mot de passe à implémenter");
  }

  private markFormAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}