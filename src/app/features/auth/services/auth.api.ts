import axios from 'axios';
import { Login, Register } from '../models/auth.model';
import { User } from '../models/user.model';

export class AuthApi {
  static login(login: Login) {
    return axios.post('auth/login', {
      username: login.username,
      password: login.password,
    });
  }

  static register(userData: Register) {
    const formData = new FormData();
    const {
      dateOfBirth,
      email,
      firstName,
      gender,
      location,
      lastName,
      password,
      phoneNumber,
      username,
    } = userData;
    const dateJson = new Date(
      dateOfBirth.split('/').reverse().join('-')
    ).toJSON();
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('dateOfBirth', dateJson);
    formData.append('gender', gender);
    formData.append('lastName', lastName);
    formData.append('password', password);
    formData.append('phoneNumber', phoneNumber);
    formData.append('username', username);

    formData.append(
      'location',
      JSON.stringify({
        nationality: location.nationality,
        country: location.country,
        region: location.region,
        department: location.department,
        address: location.address,
      })
    );

    return axios.post('users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async refreshToken(payload: { refreshToken: string }) {
    try {
      const response = await axios.post('auth/refresh-token', payload);
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorResponse = error.response?.data || {};
      const errorMessage =
        errorResponse.developerMessage ||
        errorResponse.message ||
        'Erreur lors du rafraîchissement du token';
      throw {
        success: false,
        message: errorMessage,
        statusCode: error.response?.status,
        validationErrors: errorResponse.validationErrors || [],
      };
    }
  }

  static logout() {
    return axios.post('auth/logout');
  }

  static getUserInfo(id: string) {
    return axios.get(`users/keycloak/${id}`);
  }

  static resetPassword(payload: { newPassword: string }) {
    return axios.post('auth/reset-password', payload);
  }

  static updateUser(userId: string, updatedUser: Partial<User>) {
    return axios.put(
      `/users/${userId}`,
      updatedUser
    );
  }
}
