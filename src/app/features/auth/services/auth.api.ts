import axios from 'axios';
import { Login, Register } from '../models/auth.model';

export class AuthApi {
    static login(login: Login) {
        return axios.post('auth/login', { username: login.username, password: login.password });
    }

    static register(userData: Register) {
        console.log("api register:", userData);
        const formData = new FormData();
        const { dateOfBirth, email, firstName, gender, location, lastName, password, phoneNumber, username } = userData;
        formData.append('email', email);
        formData.append('firstName', firstName);
        formData.append('dateOfBirth', dateOfBirth);
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

        formData.append("location.nationality", userData.location.nationality);
        formData.append("location.country", userData.location.country!);
        formData.append("location.region", userData.location.region!);
        formData.append("location.department", userData.location.department!);
        formData.append("location.address", userData.location.address!);

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
}
