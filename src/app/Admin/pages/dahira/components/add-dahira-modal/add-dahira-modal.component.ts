import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateDahira } from '../../models/dahira.model';
import { IonIcon } from "@ionic/angular/standalone";
import { CountrySelector2Component } from "../../../../../shared/components/country-selector2/country-selector2.component";
import { nations } from 'src/app/shared/utils/nations';
import { PhoneInputComponent } from 'src/app/shared/components/phone-input/phone-input.component';

@Component({
  selector: 'app-add-dahira-modal',
  templateUrl: './add-dahira-modal.component.html',
  styleUrls: ['./add-dahira-modal.component.scss'],
  imports: [
    IonIcon,
    CommonModule,
    ReactiveFormsModule,
    CountrySelector2Component,
    PhoneInputComponent]
})
export class AddDahiraModalComponent implements OnInit {
  @Input() isloading: boolean = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  dahiraForm: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  nations = nations;

  constructor(private fb: FormBuilder) {
    this.dahiraForm = this.fb.group({
      // Étape 1: Informations générales
      dahiraName: ['Dahira Mbaye', [Validators.required, Validators.minLength(3)]],

      // Étape 2: Contact
      email: ['d1@atcreative.sn', [Validators.required, Validators.email]],
      phoneNumber: ['+242069422665', [Validators.required]],

      // Étape 3: Localisation
      country: ['Senegal', [Validators.required]],
      region: ['Dakar', [Validators.required]],
      department: ['Dakar', [Validators.required]],
      address: ['Grand Yoff', [Validators.required]]
    });
  }

  ngOnInit(): void { }

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
    const step1Fields = ['dahiraName'];
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
    const step1Fields = ['dahiraName'];
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
      console.log("save");

      this.save.emit(dahiraData);
    } else {
      console.log("else");

      this.dahiraForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
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

  onCountrySelected(country: any) {
    this.dahiraForm.patchValue({ country });
    console.log('Pays changé :', country);
  }
}