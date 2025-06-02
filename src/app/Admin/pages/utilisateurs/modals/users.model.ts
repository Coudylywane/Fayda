export interface LocationInfo {
  locationInfoId?: string;
  nationality?: string;
  country?: string;
  region?: string;
  department?: string;
  address?: string;
}

// Interface principale pour l'affichage
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  userIdKeycloak?: string;
  password?: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  location: LocationInfo;
  role?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Propriétés calculées pour l'affichage
  name?: string;
  category?: string;
  image?: string;
}

// Interface pour les données venant de l'API
export interface ApiUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userIdKeycloak: string;
  gender: string;
  dateOfBirth: string;
  location: LocationInfo;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// Interface pour la création d'utilisateur
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  userIdKeycloak: string;
  password: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  location: LocationInfo;
  role: string;
  active: boolean;
}

// Interface pour les données du formulaire
export interface UserFormData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  username?: string;
  userIdKeycloak?: string;
  phone?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  location?: LocationInfo;
  role?: string;
  category?: string;
  active?: boolean;
  image?: string;
  address?: string; 
  password:string;
  // Pour compatibilité
}

// Interfaces pour les réponses API
export interface ApiResponse<T> {
  status: string;
  statusCodeValue: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  size: number;
  totalPages: number;
  currentPage: number;
  content: T[];
  totalElements: number;
}