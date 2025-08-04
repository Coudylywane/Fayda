import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormatNumberDirective } from 'src/app/directives/format-number.directive';

@Component({
  selector: 'app-contribution-goal-modal',
  templateUrl: './contribution-goal-modal.component.html',
  styleUrls: ['./contribution-goal-modal.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FormatNumberDirective,
  ],
})
export class ContributionGoalModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saveGoal = new EventEmitter<number>();
  @Input() isloading: boolean = false;

  goalForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.goalForm = this.fb.group({
      goal: [null, [Validators.required, Validators.min(1000)]],
    });
  }

  onSubmit() {
    if (this.goalForm.valid) {
      this.saveGoal.emit(this.goalForm.value.goal);
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }
}
