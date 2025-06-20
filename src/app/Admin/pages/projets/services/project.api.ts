import axios from 'axios';
import { CreateProjectDTO } from '../models/projet.model';
import { ɵɵInheritDefinitionFeature } from '@angular/core';

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
            console.error('Erreur lors de la récupération de collecte de fonds:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de récupération de collecte de fonds',
                response: error.response
            };
        }
    }

    /**
     * Récupère les détails d'un projet de collecte de fonds par son ID
     */
    static async donate(collectId: string, amount: number) {
        try {
            const formData = new FormData();
            formData.append('amount', amount.toString());
            formData.append('collectId', collectId);

            const response = await axios.post(`fund-collections/${collectId}/donate`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("donate: ", response);

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la contribution de collecte de fonds:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de la contribution de collecte de fonds',
                response: error.response
            };
        }
    }

    /**
    * Faire la demande d'une collecte de fonds
    */
    static async createProject(data: CreateProjectDTO) {
        console.log("data:", data);

        try {
            const response = await axios.post(`fund-collections`, {
                ...data
            });
            console.log("CreateProject: ", response);

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la création de collecte de fonds', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de création de collecte de fonds',
                response: error.response
            };
        }
    }

}