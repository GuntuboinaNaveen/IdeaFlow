
import type { AuthAction, AuthState } from "./authTypes";

export const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

export function authReducer(
    state: AuthState,
    action: AuthAction
): AuthState {
    switch (action.type) {
        case "LOGIN":
        case "RESTORE_SESSION":
            return {
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
            };

        case "LOGOUT":
            return {
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };

        case "AUTH_INITIALIZED":
            return {
                ...state,
                isLoading: false,
            };

        default:
            return state;
    }
}
