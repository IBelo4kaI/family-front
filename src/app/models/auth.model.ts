export interface Profile {
  id: string;
  email: string;
  name: string;
  color: string;
  familyId: string | null;
  role: string | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface Session extends Tokens {
  user: Profile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  color: string;
  familyName: string;
}

export interface JoinRequest extends LoginRequest {
  code: string;
  name: string;
  color: string;
}
