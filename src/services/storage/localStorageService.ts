
const AUTH_SESSION_KEY = "internal_auth_session";

export const localStorageService = {
    get<T>(key: string): T | null {
        const value = localStorage.getItem(key);

        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    },

    set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key: string): void {
        localStorage.removeItem(key);
    },

    clearAuthSession(): void {
        localStorage.removeItem(AUTH_SESSION_KEY);
    },
};

export { AUTH_SESSION_KEY };
