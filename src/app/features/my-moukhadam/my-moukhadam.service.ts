import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
    providedIn: 'root'
})
export class MyMoukhadamService {
    /**
     * Obtenir les details d'un Moukhadam par ID
     * @param moukhadamId 
     * @returns 
     */
    async getMoukhadamById(moukhadamId: string) {
        try {
            const response = await axios.get(`users/${moukhadamId}`);
            console.log("getMoukhadamById: ", response);

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Erreur lors de la récupération du Moukhadam:', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Erreur de récupération du Moukhadam',
                response: error.response
            };
        }
    }
}