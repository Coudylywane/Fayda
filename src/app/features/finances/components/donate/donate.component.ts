import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormatNumberDirective } from 'src/app/directives/format-number.directive';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss'],
    imports: [
      IonicModule, 
      CommonModule, 
      ReactiveFormsModule, 
      FormatNumberDirective
    ],
})
export class DonateComponent  implements OnInit {
  donForm!: FormGroup;

  @Input() isloading: boolean = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{amount: number}>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {

    this.donForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(500)]]
    });

  }

  formatDateForInput(date: string): string {
    const ndate = new Date(date.split('/').reverse().join('-'))
    const year = ndate.getFullYear();
    const month = String(ndate.getMonth() + 1).padStart(2, '0');
    const day = String(ndate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.donForm.valid) {
      const formValue = this.donForm.value;

      const don = {
        amount: formValue.amount as number
      };

      console.log("tentative de creation de don: ", don);


      this.submit.emit(don);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.donForm.controls).forEach(key => {
        const control = this.donForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}