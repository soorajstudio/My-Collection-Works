export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  avatarKey?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
