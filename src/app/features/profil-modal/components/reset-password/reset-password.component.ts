import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { IconButtonComponent } from 'src/app/shared/components/icon-button/icon-button.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { RoleVisibilityDirective } from 'src/app/features/auth/directives/role-visibility.directive';
import { VisiteurOnlyDirective } from 'src/app/features/auth/directives/role-visitor-only.directive';
import { RoleHideDirective } from 'src/app/features/auth/directives/role-hide.directive';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [
      IonicModule,
      CommonModule,
      ReactiveFormsModule,
    ],
})
export class ResetPasswordComponent implements OnInit {
  @Input() email: string = '';
  @Input() phone: string = '';

  resetPasswordForm: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private modalCtrl: ModalController) {
    this.resetPasswordForm = this.fb.group(
      {
        code: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.matchPasswords }
    );
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  matchPasswords(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async submit() {
    if (this.resetPasswordForm.invalid) return;
    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    const { code, newPassword } = this.resetPasswordForm.value;

    try {
      // Appelle ton service ici
      // await this.authService.resetPasswordWithCode({ code, newPassword });
      this.success = 'Mot de passe réinitialisé avec succès';
      setTimeout(() => this.close(), 1500);
    } catch (e) {
      this.error = 'Erreur lors de la réinitialisation.';
    } finally {
      this.isSubmitting = false;
    }
  }

  get maskedEmail() {
    if (!this.email) return '';
    const [name, domain] = this.email.split('@');
    return `${name[0]}***@${domain}`;
  }

  get maskedPhone() {
    if (!this.phone) return '';
    return this.phone.slice(0, 2) + '****' + this.phone.slice(-2);
  }
}
