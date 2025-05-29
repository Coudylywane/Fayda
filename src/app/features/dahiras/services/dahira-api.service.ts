import axios from 'axios';

export class DahiraApiService {

    static getPaginatedDahiras(page: number, size: number){
        console.log("ap");
        
        return axios.get(`dahiras?page=${page}&size=${size}`);
    }

    static getDahira(id: number){
        return axios.get(`dahiras/${id}`);
    }
}