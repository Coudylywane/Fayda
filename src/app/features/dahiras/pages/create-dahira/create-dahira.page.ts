import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CreateDahira } from 'src/app/Admin/pages/dahira/models/dahira.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { DahiraService } from '../../services/dahira.service';
import { selectCurrentUser } from 'src/app/features/auth/store/auth.selectors';
import { Subject, takeUntil } from 'rxjs';
import { nations } from 'src/app/shared/utils/nations';

@Component({
  selector: 'app-create-dahira',
  templateUrl: './create-dahira.page.html',
  styleUrls: ['./create-dahira.page.scss'],
  standalone: false,
})
export class CreateDahiraPage implements OnInit {
  isloading: boolean = false;

  dahiraForm: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  private destroy$ = new Subject<void>();
  userId: string = "";
  nations = nations;

  constructor(
    private fb: FormBuilder,
    private dahiraService: DahiraService,
    private router: Router,
    private store: Store,
    private toastService: ToastService
  ) {

    this.dahiraForm = this.fb.group({
      // Étape 1: Informations générales
      dahiraName: ['Dahira Mbaye', [Validators.required, Validators.minLength(3)]],
      numberOfDisciples: [1, [Validators.required, Validators.min(1)]],

      // Étape 2: Contact
      email: ['d1@atcreative.sn', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],

      // Étape 3: Localisation
      country: ['', [Validators.required]],
      region: ['Dakar', [Validators.required]],
      department: ['Dakar', [Validators.required]],
      address: ['Grand Yoff', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // S'abonner aux changements d'état du store
    this.store.select(selectCurrentUser).pipe(
      takeUntil(this.destroy$)
    ).subscribe(currentUser => {
      this.userId = currentUser?.userId!;

    });
  }

  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    const step1Fields = ['dahiraName', 'numberOfDisciples'];
    const step2Fields = ['email', 'phoneNumber'];
    const step3Fields = ['country', 'region', 'department', 'address'];

    let fieldsToCheck: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToCheck = step1Fields;
        break;
      case 2:
        fieldsToCheck = step2Fields;
        break;
      case 3:
        fieldsToCheck = step3Fields;
        break;
    }

    return fieldsToCheck.every(field => this.dahiraForm.get(field)?.valid);
  }

  markCurrentStepAsTouched(): void {
    const step1Fields = ['dahiraName', 'numberOfDisciples'];
    const step2Fields = ['email', 'phoneNumber'];
    const step3Fields = ['country', 'region', 'department', 'address'];

    let fieldsToMark: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToMark = step1Fields;
        break;
      case 2:
        fieldsToMark = step2Fields;
        break;
      case 3:
        fieldsToMark = step3Fields;
        break;
    }

    fieldsToMark.forEach(field => {
      this.dahiraForm.get(field)?.markAsTouched();
    });
  }

  onSubmit(): void {
    this.isloading = true;
    if (this.dahiraForm.valid) {
      const formValue = this.dahiraForm.value;
      const dahiraData: CreateDahira = {
        dahiraName: formValue.dahiraName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        location: {
          country: formValue.country,
          region: formValue.region,
          department: formValue.department,
          address: formValue.address
        }
      };

      console.log('Tentative de création dahira:', dahiraData);
      // dahiraData.createdByUserId = this.userId;
      dahiraData.location.nationality = dahiraData.location.country;
      this.dahiraService.createDahira(dahiraData)
        .then(response => {
          this.isloading = false;
          console.log('Succès création dahira:', response);
          if (response.success) {
            this.toastService.showSuccess(response.data.message || "Votre demande a été envoyé");
            this.goHome()
          }
          // this.loadAllDahiras();
        }).catch(error => {
          this.isloading = false;
          console.error('Erreur création dahira:', error);
          this.toastService.showError(error.message)
        });
      console.log("save: ", dahiraData);

    } else {
      console.log("else");

      this.dahiraForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.goHome();
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Informations générales';
      case 2:
        return 'Informations de contact';
      case 3:
        return 'Localisation';
      default:
        return '';
    }
  }

  goHome() {
    this.router.navigate(['tabs/home'])
  }

  onCountrySelected(country: any) {
    this.dahiraForm.patchValue({ country });
    console.log('Pays changé :', country);
  }
}