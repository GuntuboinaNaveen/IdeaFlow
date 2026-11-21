
import usersData from "../../../mock-data/users.json";

import type {
    LoginCredentials,
    MockUser,
    User,
    AuthSession,
} from "../../../modules/auth/types/auth.types";

import {
    localStorageService,
    AUTH_SESSION_KEY,
} from "../../../services/storage/localStorageService";

const users = usersData as MockUser[];

const SESSION_DURATION = 8 * 60 * 60 * 1000;

function toSafeUser(user: MockUser): User {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}

export const authService = {
    async login(
        credentials: LoginCredentials
    ): Promise<User> {
        const email = credentials.email.trim().toLowerCase();

        const user = users.find(
            (item) =>
                item.email.toLowerCase() === email &&
                item.password === credentials.password
        );

        if (!user) {
            throw new Error("Invalid email or password.");
        }

        if (user.status !== "ACTIVE") {
            throw new Error("Your account is inactive.");
        }

        const safeUser = toSafeUser(user);

        const session: AuthSession = {
            user: safeUser,
            expiresAt: Date.now() + SESSION_DURATION,
        };

        localStorageService.set(AUTH_SESSION_KEY, session);

        return safeUser;
    },

    getSession(): AuthSession | null {
        return localStorageService.get<AuthSession>(
            AUTH_SESSION_KEY
        );
    },

    logout(): void {
        localStorageService.clearAuthSession();
    },

    getCurrentSessionUser(): User | null {
        const session = this.getSession();

        if (!session) return null;

        if (session.expiresAt <= Date.now()) {
            this.logout();
            return null;
        }

        return session.user;
    },
};
