import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
})
export class RegisterPage {
   maxDate = new Date().toISOString();
  registerForm: FormGroup;
  selectedGender: string = 'male';
  showPassword = false;
  registerError = "";
  isLoading = false;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.registerForm = this.createForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'login';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,20}$/)]],
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      country: ['', Validators.required],
      region: ['', Validators.required],
      department: [''],
      address: ['']
    });
  }

  register() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError = "";

      const formData = this.prepareFormData();

      this.authService.register(formData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (result) => this.handleRegistrationResult(result),
          error: (error) => this.handleRegistrationError(error)
        });
    } else {
      this.markFormAsTouched();
    }
  }

  private prepareFormData(): any {
    return {
      ...this.registerForm.value,
      location: {
        nationality: this.registerForm.value.nationality,
        country: this.registerForm.value.country,
        region: this.registerForm.value.region,
        department: this.registerForm.value.department,
        address: this.registerForm.value.address
      }
    };
  }

  private handleRegistrationResult(result: any): void {
    if (result.success) {
      this.router.navigate(['/login']);
    } else {
      this.registerError = result.message || "Erreur lors de l'inscription";
    }
  }

  // private autoLoginAfterRegistration(): void {
  //   const { email, password } = this.registerForm.value;
  //   this.authService.login(email, password).subscribe(loginResult => {
  //     const redirectUrl = loginResult.isAdmin ? '/admin/dashboard' : this.returnUrl;
  //     this.router.navigate([redirectUrl]);
  //   });
  // }

  private handleRegistrationError(error: any): void {
    console.error("Erreur d'inscription", error);
    this.registerError = "Une erreur est survenue lors de l'inscription";
  }

  private markFormAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // Méthodes d'interface utilisateur
  selectGender(gender: string): void {
    this.selectedGender = gender;
    this.registerForm.patchValue({ gender });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getInputClass(fieldName: string): string {
    return this.isFieldInvalid(fieldName) 
      ? 'border-b border-red-500' 
      : 'border-b border-white focus:border-light-green';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field?.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['email']) return 'Email invalide';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['pattern']) return 'Format invalide';
    
    return '';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}