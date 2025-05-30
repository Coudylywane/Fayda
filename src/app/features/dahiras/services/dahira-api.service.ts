import axios from 'axios';

export class DahiraApiService {

    static getPaginatedDahiras(page: number, size: number) {
        console.log("ap");

        return axios.get(`dahiras?page=${page}&size=${size}`);
    }

    static getDahira(dahiraId: string) {
        return axios.get(`dahiras/${dahiraId}`);
    }

    /**
     * Récupère les détails d'un dahira par son ID
     */
    static async getDahiraById(dahiraId: string) {
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
     * Envoie une demande d'adhésion à un dahira
     */
    static async requestMembership(dahiraId: string) {
        try {
            const response = await axios.post(`request-to-become/join-dahira`,{dahiraId});
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la demande d\'adhésion:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la demande d\'adhésion',
                response: error.response
            };
        }
    }

    /**
     * Vérifie le statut d'adhésion d'un utilisateur pour un dahira
     */
    static async checkMembershipStatus(dahiraId: string, userId: string) {
        try {
            const response = await axios.get(`user-requests/has-requested-dahira/${userId}/${dahiraId}`);
            console.log("checkMembershipStatus api: ", response);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la vérification du statut:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de vérification du statut',
                response: error.response
            };
        }
    }
}