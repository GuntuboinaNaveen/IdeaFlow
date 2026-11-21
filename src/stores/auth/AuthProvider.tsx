
import {
    useReducer,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

import { AuthContext } from "./AuthContext";
import { authReducer, initialAuthState } from "./authReducer";

import { authService } from "../../modules/auth/services/authService";
import type { LoginCredentials } from "../../modules/auth/types/auth.types";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [state, dispatch] = useReducer(
        authReducer,
        initialAuthState
    );

    useEffect(() => {
        const user = authService.getCurrentSessionUser();

        if (user) {
            dispatch({
                type: "RESTORE_SESSION",
                payload: user,
            });
        } else {
            dispatch({ type: "AUTH_INITIALIZED" });
        }
    }, []);

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            const user = await authService.login(credentials);

            dispatch({
                type: "LOGIN",
                payload: user,
            });

            return user;
        },
        []
    );

    const logout = useCallback(() => {
        authService.logout();
        dispatch({ type: "LOGOUT" });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                state,
                dispatch,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
