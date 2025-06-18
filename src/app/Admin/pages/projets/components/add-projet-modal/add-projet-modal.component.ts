import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CreateProjectDTO, ProjectDTO } from '../../models/projet.model';

@Component({
  selector: 'app-add-projet-modal',
  templateUrl: './add-projet-modal.component.html',
  styleUrls: ['./add-projet-modal.component.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AddProjetModalComponent  implements OnInit {
  projectForm!: FormGroup;
  
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateProjectDTO>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const today = new Date();
    // Par défaut, date d'échéance à un mois plus tard
    const defaultDueDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      targetAmount: [0, [Validators.required, Validators.min(1000)]],
      endDate: [this.formatDateForInput(defaultDueDate), [Validators.required]],
      startDate: [this.formatDateForInput(today), [Validators.required]]
    });
    
    // Mise à jour automatique de la progression en fonction du statut
    // this.projectForm.get('status')?.valueChanges.subscribe(status => {
    //   if (status === 'termine') {
    //     this.projectForm.get('progress')?.setValue(100);
    //   } else if (status === 'en_attente' && this.projectForm.get('progress')?.value === 0) {
    //     this.projectForm.get('progress')?.setValue(25);
    //   }
    // });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      
      const project: CreateProjectDTO = {
        title: formValue.title,
        description: formValue.description,
        endDate: formValue.endDate,
        targetAmount: formValue.targetAmount,
        startDate: formValue.startDate
      };
      
      this.submit.emit(project);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

