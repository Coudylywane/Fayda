import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateProjectDTO } from 'src/app/Admin/pages/projets/models/projet.model';
import { ProjectService } from 'src/app/Admin/pages/projets/services/project.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';

@Component({
  selector: 'app-create-collect',
  templateUrl: './create-collect.page.html',
  styleUrls: ['./create-collect.page.scss'],
  standalone: false,
})
export class CreateCollectPage implements OnInit {

  projectForm!: FormGroup;

  isloading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectService: ProjectService,
    private toastService: ToastService
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
      endDate: ["", [Validators.required]],
      startDate: ["", [Validators.required]]
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
    this.isloading = true;
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;

      const project: CreateProjectDTO = {
        title: formValue.title,
        description: formValue.description,
        endDate: this.formatDateForInput(formValue.endDate),
        targetAmount: formValue.targetAmount,
        startDate: this.formatDateForInput(formValue.startDate)
      };

      console.log("tentative de creation de collecte: ", project);
      this.projectService.addProject(project)
      .then(response => {
        this.isloading = false;
        console.log('Succès création collecte de fonds:', response);
        if (response.success) {
          this.goHome();
          this.toastService.showSuccess(response.data.message || "Votre demande a été envoyé");
        }
      }).catch(error => {
        this.isloading = false;
        console.error('Erreur création collecte de fonds:', error);
        this.toastService.showError(error.message)
      });
      
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.goHome();
  }

  goHome() {
    this.router.navigate(['tabs/home'])
  }

  /**
   * Pour modifier la date de fin dans le formulaire
   */
  onEndDateSelected(date: string | null): void {
    this.projectForm.patchValue({ endDate: date });
    console.log('Date fin sélectionnée:', date);
  }

  /**
 * Pour modifier la date de début dans le formulaire
 */
  onStartDateSelected(date: string | null): void {
    this.projectForm.patchValue({ startDate: date });
    console.log('Date début sélectionnée:', date);
  }
}
