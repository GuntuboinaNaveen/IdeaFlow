
export type UserRole = "CEO" | "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}


export type AuthAction =
    | { type: "LOGIN"; payload: User }
    | { type: "LOGOUT" }
    | { type: "RESTORE_SESSION"; payload: User }
    | { type: "AUTH_INITIALIZED" };