import { Component, OnInit  } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit () {
    this.showStatusBar ();
  }
  
  showStatusBar () {
    StatusBar.show ();
  }
}
