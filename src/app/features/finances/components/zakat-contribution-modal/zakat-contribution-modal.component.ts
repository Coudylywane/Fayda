import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormatNumberDirective } from 'src/app/directives/format-number.directive';

@Component({
  selector: 'app-zakat-contribution-modal',
  templateUrl: './zakat-contribution-modal.component.html',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FormatNumberDirective,
  ],
})
export class ZakatContributionModalComponent {
  form: FormGroup;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.form.valid) {
      this.modalCtrl.dismiss(this.form.value.amount);
    }
  }
}
