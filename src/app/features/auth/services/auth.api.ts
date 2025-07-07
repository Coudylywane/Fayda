import axios from 'axios';
import { Login, Register } from '../models/auth.model';

export class AuthApi {
    static login(login: Login) {
        return axios.post('auth/login', { username: login.username, password: login.password });
    }

    static register(userData: Register) {
        const formData = new FormData();
        const { dateOfBirth, email, firstName, gender, location, lastName, password, phoneNumber, username } = userData;
        const dateJson = new Date(dateOfBirth.split('/').reverse().join('-')).toJSON();
        formData.append('email', email);
        formData.append('firstName', firstName);
        formData.append('dateOfBirth', dateJson);
        formData.append('gender', gender);
        formData.append('lastName', lastName);
        formData.append('password', password);
        formData.append('phoneNumber', phoneNumber);
        formData.append('username', username);

        formData.append("location", JSON.stringify({
            nationality: location.nationality,
            country: location.country,
            region: location.region,
            department: location.department,
            address: location.address,
        }));
        
        return axios.post('users', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static refreshToken(refreshToken: string) {
        return axios.post('users', { refreshToken });
    }

    static logout() {
        return axios.post('auth/logout');
    }

    static getUserInfo(id: string) {
        return axios.get(`users/keycloak/${id}`);
    }

    static resetPassword(payload: {newPassword: string }) {
        return axios.post('auth/reset-password', payload);
    }
}
