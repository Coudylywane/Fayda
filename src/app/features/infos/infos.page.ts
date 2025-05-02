import { Component, OnInit } from '@angular/core';
import { EventListService } from './services/infos.service';
import { FeaturedEvent } from './model/infos.model';

@Component({
  selector: 'app-infos',
  templateUrl: './infos.page.html',
  styleUrls: ['./infos.page.scss'],
  standalone: false,
  // Change this to true if you want to use the component as a standalone component
})
export class InfosPage implements OnInit {
  
  constructor(private eventListService: EventListService) { }

  featuredEvent!: FeaturedEvent;
  sideEvents!: any;
  eventItems!: FeaturedEvent[];
  
  ngOnInit() {
    
    this.featuredEvent = this.eventListService.getFeaturedEvents();
    this.sideEvents = this.eventListService.getSideEvent();
    this.eventItems = this.eventListService.getEventItems();
  }

}

