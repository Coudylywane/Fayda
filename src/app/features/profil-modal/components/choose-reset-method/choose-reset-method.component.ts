import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-choose-reset-method',
  templateUrl: './choose-reset-method.component.html',
  standalone: true,
  imports: [IonicModule],
})
export class ChooseResetMethodComponent {
  @Input() email: string = '';
  @Input() phone: string = '';

  constructor(private modalCtrl: ModalController) {}

  choose(method: 'email' | 'phone') {
    this.modalCtrl.dismiss({ method });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  get maskedEmail() {
    const [name, domain] = this.email.split('@');
    return `${name[0]}***@${domain}`;
  }

  get maskedPhone() {
    return this.phone?.slice(0, 2) + '****' + this.phone?.slice(-2);
  }
}
