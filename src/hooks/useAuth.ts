
import { useContext } from "react";
import { AuthContext } from "../stores/auth/AuthContext";

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return {
        user: context.state.user,
        isAuthenticated: context.state.isAuthenticated,
        isLoading: context.state.isLoading,
        login: context.login,
        logout: context.logout,
    };
}
