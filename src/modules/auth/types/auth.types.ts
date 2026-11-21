
export type UserRole =
    | "CEO"
    | "ADMIN"
    | "MANAGER"
    | "EMPLOYEE";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: "ACTIVE" | "INACTIVE";
}

export interface MockUser extends User {
    password: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthSession {
    user: User;
    expiresAt: number;
}
