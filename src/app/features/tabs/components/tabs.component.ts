import { Component, OnInit } from '@angular/core';
import { TabsService } from '../services/tabs.service';
import { IonIcon } from "@ionic/angular/standalone";  
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonicModule, RouterModule]
})
export class TabsComponent  implements OnInit {

  activeTab: string = 'home';

  constructor(private navigationService: TabsService) {}

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
  }

  navigate(tab: string) {
    this.navigationService.setActiveTab(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}