import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ProfilModalService {

  constructor() { }

  becomeMoukhadam() {
    console.log("become");

    return axios.post(`request-to-become/mouqadam`);
  }

}
