import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Activity } from '../../model/infos.model';
import { DetailInfosService } from '../../services/detail-infos.service';
import { CommentModalComponent } from '../../components/comment-modal/comment-modal.component';

@Component({
  selector: 'app-detail-infos',
  templateUrl: './detail-infos.page.html',
  styleUrls: ['./detail-infos.page.scss'],
  standalone: false,
})
export class DetailInfosPage implements OnInit {

  pageTitle = 'Gamou Médina Baye Kaolack 2024';
  activities!: Activity[];

  constructor(private modalController: ModalController, private detailInfosService: DetailInfosService) {}

  ngOnInit() {
    this.activities = this.detailInfosService.getActivities();
  }

  async openCommentModal(activity: Activity) {
    const modal = await this.modalController.create({
      component: CommentModalComponent,
      componentProps: {
        activity: activity
      },
      breakpoints: [0, 0.7],
      initialBreakpoint: 0.7,
      cssClass: 'comment-modal'
    });

    return await modal.present();
  }

  goBack() {
    window.history.back();
  }


}
