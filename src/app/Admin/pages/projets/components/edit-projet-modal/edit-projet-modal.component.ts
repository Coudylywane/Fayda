import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateProjectDTO, ProjectDTO } from '../../models/projet.model';

@Component({
  selector: 'app-edit-projet-modal',
  templateUrl: './edit-projet-modal.component.html',
  styleUrls: ['./edit-projet-modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class EditProjetModalComponent implements OnInit {

  @Input() project!: ProjectDTO;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateProjectDTO>();
  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.projectForm = this.fb.group({
      title: [this.project.title, [Validators.required]],
      description: [this.project.description, [Validators.required]],
      targetAmount: [this.project.targetAmount, [Validators.required, Validators.min(1000)]],
      startDate: [this.formatDateForInput(new Date(this.project.startDate)), [Validators.required]],
      endDate: [this.formatDateForInput(new Date(this.project.endDate)), [Validators.required]]
    });

    // Mise à jour automatique de la progression en fonction du statut
    // this.projectForm.get('status')?.valueChanges.subscribe(status => {
    //   if (status === 'termine') {
    //     this.projectForm.get('progress')?.setValue(100);
    //   }
    // });

    // this.projectForm.get('progress')?.valueChanges.subscribe(progress => {
    //   if (progress === 100) {
    //     this.projectForm.get('status')?.setValue('termine');
    //   }
    // })

    // this.projectForm.get('progress')?.valueChanges.subscribe(progress => {
    //   if (progress !== 100) {
    //     this.projectForm.get('status')?.setValue('en_cours');
    //   }
    // })
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const updatedProject: CreateProjectDTO = {
        title: this.projectForm.value.title,
        description: this.projectForm.value.description,
        targetAmount: this.projectForm.value.targetAmount,
        startDate: this.projectForm.value.startDate,
        endDate: this.projectForm.value.endDate
      };

      this.submit.emit(updatedProject);
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
