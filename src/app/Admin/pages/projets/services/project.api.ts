import axios from 'axios';

export class ProjectApiService {

    /**
     * Recupérer toutes les collections de l'utilisateur courant
     * @returns 
     */
    static getProjectByUser() {
        console.log("ProjectApiService");

        return axios.get(`fund-collections/my-collections`);
    }

    /**
     * Récupérer toutes les collectes de fonds
     * @returns 
     */
    static getAllProject() {
        return axios.get(`fund-collections`);
    }

    /**
     * Récupérer toutes les collectes de fonds active
     * @returns 
     */
    static getAllActiveProject() {
        return axios.get(`fund-collections/active`);
    }

    /**
     * Récupère les détails d'un projet de collecte de fonds par son ID
     */
    static async getProjectById(projectId: string) {
        try {
            const response = await axios.get(`fund-collections/${projectId}`);
            console.log("getProjectById: ", response);

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