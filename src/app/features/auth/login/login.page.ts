import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { filter, finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { Login } from '../models/auth.model';
import { selectAuthState } from '../store/auth.selectors';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';
import { SelectorComponent } from "../../../shared/components/selector/selector.component";
import { PhoneInputComponent } from 'src/app/shared/components/phone-input/phone-input.component';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { DateSelectorComponent } from "../../../shared/components/date-selector/date-selector.component";

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule, DateSelectorComponent],
})
export class LoginPage {
  loginForm: FormGroup
  hidePassword = true
  loginError: string = ""
  isLoading = false
  returnUrl: string
  private destroy$ = new Subject<void>();
  private loginAttempted = false;

  selectOptions = [
    {
      value: 'fr',
      label: 'Français',
      flag: 'https://flagcdn.com/w20/fr.png',
      badge: 'Recommandé'
    },
    {
      value: 'en',
      label: 'Anglais',
      icon: 'fas fa-language text-blue-500'
    },
    {
      value: 'es',
      label: 'Espagnol',
      flag: 'https://flagcdn.com/w20/es.png'
    },
    {
      value: 'de',
      label: 'Allemand',
      icon: 'fas fa-star text-yellow-500',
      badge: 'Nouveau'
    }
  ];

  selectedValue: any;
  selectedCountry: any;

  onSelectChange(value: any) {
    this.selectedValue = value;
    console.log('Valeur sélectionnée :', value);
  }

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
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "tabs/home";

    // Rediriger si déjà connecté
    // if (this.authService.isLoggedIn()) {
    //   const redirectUrl = 'tabs/home';
    //   this.router.navigate([redirectUrl]);
    // }
  }

  ngOnInit(): void {

    this.store.select(selectAuthState).pipe(
      takeUntil(this.destroy$),
    ).subscribe(authState => {
      this.isLoading = authState.loading;
    });


    this.store.select(selectAuthState).pipe(
      takeUntil(this.destroy$),
      filter(authState => !authState.loading) // Attendre que le loading soit terminé
    ).subscribe(authState => {
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
          console.log("Redirection vers:", this.returnUrl);
        } else if (!authState.isAuthenticated && authState.error) {
          // Échec de login
          console.log("Échec de connexion:", authState.error);
          
          this.toast.showError(authState.error || "Erreur de connexion");
          this.loginAttempted = false;
        }
      }
    });
  }

  // Gestionnaire d'événement pour le changement de pays
  onCountryChange(country: any) {
    this.selectedCountry = country;
    console.log('Pays changé :', country);

    // Vous pouvez aussi mettre à jour la logique de validation ici
    // this.updatePhoneValidation();
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
    alert("Fonctionnalité de récupération de mot de passe à implémenter")
  }

  goToRegister() {
    this.router.navigate(['/register']);
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