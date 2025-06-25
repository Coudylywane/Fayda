import { MyMoukhadamService } from './my-moukhadam.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../auth/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-my-moukhadam',
  templateUrl: './my-moukhadam.page.html',
  styleUrls: ['./my-moukhadam.page.scss'],
  standalone: false
})
export class MyMoukhadamPage implements OnInit {
  moukhadamId: string = '';
  moukhadam: User | null = null;
  loading: boolean = false;
  moukhadamNull: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myMoukhadamService: MyMoukhadamService
  ) { }

  ngOnInit(): void {
    this.moukhadamId = this.route.snapshot.paramMap.get('id') || '';

    if (this.moukhadamId && this.moukhadamId !== "undefined") {
      this.loadMoukhadamDetails();
    } else {
      this.moukhadamNull = true;
    }
  }

  loadMoukhadamDetails(): void {
    this.loading = true;
    this.myMoukhadamService.getMoukhadamById(this.moukhadamId).then((response) => {
      console.log(response.data);
      
      if (response.data.statusCodeValue! === 200) {
        this.moukhadam = response.data.data
        console.log("Moukhadam : ", this.moukhadam);
        this.loading = false;
      }
      this.loading = false;
      this.error = response.data.developerMessage;
    }).catch(error => {
      this.loading = false;
      this.error = error.message;
      console.error('Erreur lors du chargement des détails du moukhadam', error);
    });
  }


  refresh(){
    this.loadMoukhadamDetails();
  }

  goBack(): void {
    this.router.navigate(['tabs/home']);
  }
}