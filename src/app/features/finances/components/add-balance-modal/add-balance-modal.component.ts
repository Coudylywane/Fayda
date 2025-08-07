import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormatNumberDirective } from 'src/app/directives/format-number.directive';

@Component({
  selector: 'app-add-balance-modal',
  templateUrl: './add-balance-modal.component.html',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    //FormatNumberDirective,
  ],
})
export class AddBalanceModalComponent {
  @Input() currentBalance = 0;

  form: FormGroup;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1000)]],
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    if (this.form.valid) {
      const amount = this.form.value.amount;
      const newBalance = this.currentBalance + amount;
      this.modalCtrl.dismiss({ newBalance });
    }
  }
}
