import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { ConfettiService } from 'src/app/Admin/services/confetti.service';
import { selectAuthState } from '../store/auth.selectors';
import { Register } from '../models/auth.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { DateSelectorComponent } from "../../../shared/components/date-selector/date-selector.component";
import { PhonenumberInputComponent } from 'src/app/shared/components/phonenumber-input/phonenumber-input.component';
import { passwordMatchValidator } from 'src/app/shared/utils/custom-validators';
import { CountrySelectorComponent } from "../../../shared/components/country-selector/country-selector.component";
import { nationalities } from 'src/app/shared/utils/nationalities';
import { nations } from 'src/app/shared/utils/nations';

interface Step {
  title: string;
  fields: string[];
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    DateSelectorComponent,
    PhonenumberInputComponent,
    CountrySelectorComponent
],
})
export class RegisterPage {
  maxDate = new Date().toISOString();
  registerForm: FormGroup;
  selectedGender: string = 'homme';
  showPassword = false;
  showConfirmPassword = false;
  registerError = "";
  isLoading = false;
  loginAttempted = false;
  returnUrl: string;
  userBirthDate: Date | null = null;
  selectedCountry: any;
  nationationalities = nationalities;
  nations = nations;

  // Propriétés pour la gestion des étapes
  currentStep = 0;
  steps: Step[] = [
    {
      title: 'Informations personnelles',
      fields: ['firstName', 'lastName', 'dateOfBirth']
    },
    {
      title: 'Contact',
      fields: ['email', 'phoneNumber']
    },
    {
      title: 'Compte',
      fields: ['username', 'password']
    },
    {
      title: 'Localisation',
      fields: ['nationality', 'country', 'region']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store<AppState>,
    private confettiService: ConfettiService,
    private toastService: ToastService
  ) {
    this.registerForm = this.createForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'login';

    this.store.select(selectAuthState).subscribe(authState => {
      this.isLoading = authState.loading;
      this.registerError = authState.error ?? '';

      // Gérer la redirection
      if (this.loginAttempted) {
        if (authState.user) {
          // Création réussi
          this.toastService.showSuccess(authState.message!);
          setTimeout(() => {
            this.confettiService.triggerConfetti();
            this.router.navigate([this.returnUrl]);
          }, 750); // 750 ms Délai pour voir le toast et les confettis
          console.log("Redirection vers:", this.returnUrl);
        } else if (!authState.isAuthenticated && authState.error) {
          // Échec
          console.log("Échec de création:", authState.error);

          this.toastService.showError(authState.error || "Erreur de création");
          this.loginAttempted = false;
        }
      }

      // if (authState.user) {
      //   this.startConfetti();
      //   this.router.navigate(['/login']);
      // }
    });
  }

  startConfetti() {
    this.confettiService.triggerConfetti();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Étape 1: Informations personnelles
      firstName: ['dahiraTest', Validators.required],
      lastName: ['dahiraTest', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['homme', Validators.required],

      // Étape 2: Contact
      email: ['dahira@at.sn', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],

      // Étape 3: Compte
      username: ['dahira', [Validators.required, Validators.minLength(3)]],
      password: ['user123', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['user1234', [Validators.required, Validators.minLength(6)]],

      // Étape 4: Localisation
      nationality: ['', Validators.required],
      country: ['Senegal', Validators.required],
      region: ['Dakar', Validators.required],
      department: ['Dakar'], // Optionnel
      address: ['Grand Dakar'] // Optionnel
    }, { validators: passwordMatchValidator() });
  }

  // Méthodes de navigation entre les étapes
  nextStep(): void {
    // Marquer les champs de l'étape actuelle comme touchés pour afficher les erreurs
    this.markCurrentStepAsTouched();

    if (this.canProceed()) {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      } else {
        // Dernière étape, procéder à l'inscription
        this.register();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    const currentStepFields = this.steps[this.currentStep].fields;

    // Si l'étape contient des champs, tous doivent être valides
    const allFieldsValid = currentStepFields.every(fieldName => {
      const control = this.registerForm.get(fieldName);
      return control?.valid ?? false;
    });

    // Si cette étape contient le champ confirmPassword, on vérifie aussi les erreurs de groupe
    const isGroupValid = this.currentStepIncludes(['password', 'confirmPassword'])
      ? !this.registerForm.hasError('passwordMismatch')
      : true;

    return allFieldsValid && isGroupValid;
  }

  //pour savoir si un champ est présent dans l'étape
  private currentStepIncludes(fields: string[]): boolean {
    return fields.some(f => this.steps[this.currentStep].fields.includes(f));
  }

  // Méthodes pour les classes CSS des étapes
  getStepClass(stepIndex: number): string {
    if (stepIndex < this.currentStep) {
      return 'bg-light-green text-dark-green'; // Étape complétée
    } else if (stepIndex === this.currentStep) {
      return 'bg-primary text-dark-green'; // Étape actuelle
    } else {
      return 'bg-white/40 text-white'; // Étape future
    }
  }

  getConnectorClass(stepIndex: number): string {
    if (stepIndex < this.currentStep) {
      return 'bg-light-green'; // Connecteur complété
    } else {
      return 'bg-white/40'; // Connecteur non complété
    }
  }

  register() {
    if (this.registerForm.valid) {
      this.loginAttempted = true;
      const formData = this.prepareFormData();
      console.log("Form data:", formData);

      // Dispatcher l'action sans subscription directe
      this.authService.register(formData);

      // L'état sera mis à jour via le store et la subscription dans le constructor
    } else {
      this.markFormAsTouched();
    }
  }

  private prepareFormData(): Register {
    const { dateOfBirth, email, firstName, gender, lastName, password, phoneNumber, username } = this.registerForm.value as Register;
    return {
      dateOfBirth,
      email,
      firstName,
      gender,
      lastName,
      password,
      phoneNumber,
      username,
      location: {
        nationality: this.registerForm.value.nationality,
        country: this.registerForm.value.country,
        region: this.registerForm.value.region,
        department: this.registerForm.value.department,
        address: this.registerForm.value.address
      }
    };
  }

  private markCurrentStepAsTouched(): void {
    const currentStepFields = this.steps[this.currentStep].fields;
    currentStepFields.forEach(fieldName => {
      this.registerForm.get(fieldName)?.markAsTouched();
    });
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

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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

  onDateSelected(date: string | null): void {
    this.registerForm.patchValue({ dateOfBirth: date });
    console.log('Date sélectionnée:', date);
  }

  // Gestionnaire d'événement pour le changement de pays
  onCountryChange(country: any) {
    this.selectedCountry = country;
    console.log('Pays changé :', country);

    // Vous pouvez aussi mettre à jour la logique de validation ici
    // this.updatePhoneValidation();
  }
  
  // Gestionnaire d'événement pour le changement de pays
  onCountrySelected(country: any) {
    this.registerForm.patchValue({ country });
    console.log('Pays changé :', country);
  }

  // Gestionnaire d'événement pour le changement de pays
  onNationalitySelected(nationality: any) {
    this.registerForm.patchValue({ nationality });
    console.log('Nationalité changé :', nationality);
  }

  onValidationChange(isValid: boolean) {
    console.log('Numéro valide:', isValid);
  }
}
