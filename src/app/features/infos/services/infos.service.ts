import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventListService {
  featuredEvents = {
    image: 'assets/images/1.png',
    title: 'Gamou Medina Baye',
    commentCount: 249
  };

  sideEvent = [
    { image: 'assets/images/1.png', title: 'Gamou 2024 au USA' },
    { image: 'assets/images/1.png', title: 'Ziar Mame Cheikh Khalifa' },
  ];

  eventItems = [
    {
      image: 'assets/images/1.png',
      title: 'Communauté New York',
      subtitle: 'Gamou 2024 - New York',
      time: 'Il y’a 12H',
      count: 17
    },
    {
      image: 'assets/images/1.png',
      title: 'Dahira Faydahtoul Paris',
      subtitle: 'Ziar annuel',
      time: 'Il y’a 12H',
      count: 8
    },
    {
      image: 'assets/images/1.png',
      title: 'Ziar Annuel Baye Mamour Insa',
      subtitle: 'Ziar annuel',
      time: 'Il y’a 20H',
      count: 130
    },
    {
      image: 'assets/images/1.png',
      title: 'Communauté New York',
      subtitle: 'Gamou 2024 - New York',
      time: 'Il y’a 12H',
      count: 17
    },
    {
      image: 'assets/images/1.png',
      title: 'Dahira Faydahtoul Paris',
      subtitle: 'Ziar annuel',
      time: 'Il y’a 12H',
      count: 8
    },
    {
      image: 'assets/images/1.png',
      title: 'Ziar Annuel Baye Mamour Insa',
      subtitle: 'Ziar annuel',
      time: 'Il y’a 20H',
      count: 130
    },
  ];

  getFeaturedEvents() {
    return this.featuredEvents;
  }

  getSideEvent() {
    return this.sideEvent;
  }

  getEventItems() {
    return this.eventItems;
  }
}