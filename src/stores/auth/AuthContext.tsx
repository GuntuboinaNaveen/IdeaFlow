
import { createContext } from "react";
import type { Dispatch } from "react";

import type {
    AuthAction,
    AuthState,
} from "./authTypes";

import type {
    LoginCredentials,
    User,
} from "../../modules/auth/types/auth.types";

export interface AuthContextType {
    state: AuthState;
    dispatch: Dispatch<AuthAction>;
    login: (credentials: LoginCredentials) => Promise<User>;
    logout: () => void;
}

export const AuthContext =
    createContext<AuthContextType | null>(null);
