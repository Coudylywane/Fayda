import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class EventListComponent {
  @Input() featuredEvent: any;
  @Input() sideEvents: any[] = [];
  @Input() eventItem: any[] = [];

  constructor(private router: Router) { };

  navigateToDetail(eventId: string): void {
    // On navigue vers la page de détails de l'événement
    this.router.navigate(['tabs/infos/detail-infos']);
    // Pour des besoins de debugging
    // console.log(`Navigating to info: ${eventId}`);
  }
  
}

