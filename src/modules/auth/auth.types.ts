export interface RegisterReq {
  name: string;
  email: string;
  password: string;
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}
