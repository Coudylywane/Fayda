import { Component, Input, OnInit } from '@angular/core';
import { BaseLayoutAdminService } from './base-layout-admin.service';

@Component({
  selector: 'app-base-layout-admin',
  templateUrl: './base-layout-admin.page.html',
  styleUrls: ['./base-layout-admin.page.scss'],
  standalone: false
})
export class BaseLayoutAdminPage implements OnInit {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = 'Tableau de bord';

  activeTab: string = 'dashboard';

  constructor(private navigationService: BaseLayoutAdminService) {}

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
    console.log('tabs', this.activeTab);
    
  }

  navigate(tab: string) {
    this.navigationService.setActiveNav(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

}
