import axios from 'axios';

export class RequestApiService {

    static getRequest(userId: string) {
        console.log("RequestApiService");
        
        return axios.get(`user-requests/requester/${userId}`);
    }

    /**
     * Récupère les détails d'un dahira par son ID
     */
    static async deleteRequestById(dahiraId: string) {
        try {
            const response = await axios.get(`dahiras/${dahiraId}`);
            console.log("getRequestById: ", response);
            
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

}