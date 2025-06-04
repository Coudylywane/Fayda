import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Dahira } from '../models/dahira.model';
import { Store } from '@ngrx/store';
import * as DahiraActions from '.././store/dahira.actions';
import { CreateDahira } from 'src/app/Admin/pages/dahira/models/dahira.model';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class DahiraService {
  private dahirasSubject = new BehaviorSubject<Dahira[]>([]);
  public dahiras$ = this.dahirasSubject.asObservable();


  constructor(private store: Store) {
    // Initialiser avec les données
  }

  getDahirasPagined(currentPage: number, itemsPerPage: number) {
    this.store.dispatch(DahiraActions.loadDahiras({ page: currentPage - 1, size: itemsPerPage }));
  }

  /**
 * Récupère les détails d'un dahira par son ID
 */
  async getDahiraById(dahiraId: string) {
    try {
      const response = await axios.get(`dahiras/${dahiraId}`);
      console.log("getDahiraById: ", response);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du dahira:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur de récupération du dahira',
        response: error.response
      };
    }
  }

  /**
  * Faire la demande d'une Dahira
  */
  async createDahira(data: CreateDahira) {
    try {
      const { address, country, department, region } = data.location
      const { createdByUserId, email, dahiraName, numberOfDisciples, phoneNumber } = data

      const response = await axios.post(`dahiras`, {
        ...data
      });
      console.log("createDahira: ", response);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du dahira:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur de création du dahira',
        response: error.response
      };
    }
  }

  /**
  * Suppression d'une Dahira
  */
  async deleteDahira(dahiraId: string) {
    try {

      const response = await axios.delete(`dahiras/${dahiraId}`);
      console.log("deletDahira: ", response);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur lors de la supréssion du dahira:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur dans la suppression du dahira',
        response: error.response
      };
    }
  }

  /**
  * Modification d'une Dahira
  */
  async updateDahira(dahiraId: string, data: CreateDahira) {
    try {
      const { address, country, department, region } = data.location
      const { createdByUserId, email, dahiraName, numberOfDisciples, phoneNumber } = data

      const response = await axios.put(`dahiras/${dahiraId}`, {
        createdByUserId,
        email,
        dahiraName,
        numberOfDisciples,
        phoneNumber,
        location: {
          address,
          country,
          department,
          region
        }
      });

      console.log("updateDahira: ", response);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur lors de la modification du dahira:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur de la modification du dahira',
        response: error.response
      };
    }
  }
}