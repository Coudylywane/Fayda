import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { Login } from '../models/auth.model';
import { selectAuthState } from '../store/auth.selectors';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ReactiveFormsModule],
})
export class LoginPage {
  loginForm: FormGroup
  hidePassword = true
  loginError = ""
  isLoading = false
  returnUrl: string

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store<AppState>,
    private confettiService: ConfettiService,
  ) {
    this.loginForm = this.fb.group({
      username: ["Epl", [Validators.required, Validators.minLength(3)]],
      password: ["password", [Validators.required, Validators.minLength(6)]],
    })

    // Récupérer l'URL de retour des paramètres de requête ou définir la valeur par défaut
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "register"

    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      const redirectUrl = this.authService.isAdmin()
        ? '/admin/dashboard'
        : 'tabs/home';
      this.router.navigate([redirectUrl]);
    }
    this.store.select(selectAuthState).subscribe(authState => {
          this.isLoading = authState.loading;
          this.loginError = authState.error ?? '';
          console.log("Auth state:", authState);
          
          if (authState.token?.access_token) {
            this.confettiService.triggerConfetti();
            this.router.navigate(['tabs/home']);
          }
        });
  }

  login() {
    if (this.loginForm.valid) {
      console.log("Login form value:", this.loginForm.value);
      // const { username, password } = this.loginForm.value
      this.authService.login(this.loginForm.value as Login);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormAsTouched();
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
}