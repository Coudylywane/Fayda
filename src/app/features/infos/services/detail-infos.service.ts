import { Injectable } from '@angular/core';
import { Activity } from '../model/infos.model';

@Injectable({
  providedIn: 'root'
})
export class DetailInfosService {
    activities: Activity[] = [
        {
          id: 1,
          image: 'assets/images/1.png',
          title: 'Cérémonie officielle',
          commentCount: 249,
          time: '2 heures'
        },
        {
          id: 2,
          image: 'assets/images/1.png',
          title: 'Conférence de presse',
          commentCount: 178,
          time: '5 heures'
        },
        {
          id: 3,
          image: 'assets/images/1.png',
          title: 'Rassemblement des fidèles',
          commentCount: 412,
          time: '1 jour'
        },
        {
          id: 4,
          image: 'assets/images/1.png',
          title: 'Prière du vendredi',
          commentCount: 156,
          time: '12 heures'
        }
      ];

      getActivities(): Activity[] {
        return this.activities;
      }
}