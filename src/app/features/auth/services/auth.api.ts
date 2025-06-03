import axios from 'axios';
import { Login, Register } from '../models/auth.model';

export class AuthApi {
    static login(login: Login) {
        return axios.post('auth/login', { username: login.username, password: login.password });
    }

    static register(userData: Register) {
        return axios.post('users', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static logout() {
        return axios.post('auth/logout');
    }

    static getUserInfo(id: string) {
        return axios.get(`users/keycloak/${id}`);
    }
}
