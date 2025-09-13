export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  token: string;
  birthday?: Date;
  location?: string;
  discordUsername?: string;
}

export interface VerifyRequest {
  email: string;
  password: string;
  token: string;
}

export interface EmailRequest {
  email: string;
}

export interface TokenValidationRequest {
  token: string;
}

