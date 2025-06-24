import axios from 'axios';

export class DiscipleService {

    /**
     * Récupère les disciples d'un Moukhadam
     */
    static async getDisciple() {
        try {
            const response = await axios.get(`mouqadam/disciples/paginated`);
            console.log("getDisciple: ", response);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la récupération des disciples:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de récupération des disciples',
                response: error.response
            };
        }
    }

    /**
     * Récupère le nombre de disciples d'un Moukhadam
     */
    static async countDisciple() {
        try {
            const response = await axios.get(`mouqadam/disciples/count`);
            console.log("coutDisciple: ", response);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la récupération du nombre de disciples:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de récupération du nombre de disciples',
                response: error.response
            };
        }
    }

}

