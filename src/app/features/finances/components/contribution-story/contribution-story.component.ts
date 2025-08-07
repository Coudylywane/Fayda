import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonContent, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-contribution-story',
  templateUrl: './contribution-story.component.html',
  styleUrls: ['./contribution-story.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class ContributionStoryComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
