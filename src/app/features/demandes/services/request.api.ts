import axios from 'axios';
import { ApprovalDto } from '../models/request.model';

export class RequestApiService {
  static getRequest(userId: string) {
    console.log('RequestApiService');

    return axios.get(`user-requests/requester/${userId}`);
  }

  // static approval(data: ApprovalDto) {
  //     console.log("data: ",data);

  //     return axios.post(`approval`, data);
  // }

  static async approval(data: ApprovalDto) {
    try {
      const response = await axios.post('approval', data);
      console.log('approval: ', response);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Erreur lors de l'application de la décision:", error);
      const errorResponse = error.response?.data || {};
      let errorMessage =
        errorResponse.developerMessage ||
        errorResponse.message ||
        "Erreur lors de l'application de la décision";

      // Gérer l'erreur 404
      if (
        error.response?.status === 404 &&
        errorMessage.includes('introuvable')
      ) {
        errorMessage = "L'utilisateur ou la demande est introuvable.";
      }
      throw {
        success: false,
        message: errorMessage,
        statusCode: error.response?.status,
        validationErrors: errorResponse.validationErrors || [],
      };
    }
  }

  static getRequestByTargetUser(dahiraId: string) {
    console.log('RequestApiService');
    // user-requests/dahira/{dahiraId}

    return axios.get(`user-requests/dahira/${dahiraId}`);
  }

  static getAllRequest() {
    return axios.get(`user-requests`);
  }

  /**
   * Récupère les détails d'un dahira par son ID
   */
  static async deleteRequestById(dahiraId: string) {
    try {
      const response = await axios.get(`dahiras/${dahiraId}`);
      console.log('getRequestById: ', response);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du dahira:', error);
      throw {
        success: false,
        message:
          error.response?.data?.message || 'Erreur de récupération du dahira',
        response: error.response,
      };
    }
  }

  static async getRequestDetail(id: string) {
    try {
      const response = await axios.get(`/user-requests/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erreur chargement',
        statusCode: error.response?.status,
      };
    }
  }
}