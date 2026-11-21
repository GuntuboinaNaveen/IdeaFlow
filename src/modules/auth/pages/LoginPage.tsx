
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lightbulb, ListChecks, Users } from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { LoginForm } from "../components/LoginForm";

import type { LoginCredentials } from "../types/auth.types";

export function LoginPage() {
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname ?? "/dashboard";

    if (isLoading) {
        return <div className="min-h-screen bg-white" />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    async function handleLogin(credentials: LoginCredentials) {
        await login(credentials);
        navigate(from, { replace: true });
    }

    return (
        <div className="grid min-h-screen bg-white lg:grid-cols-2">

            <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
                <div className="mx-auto w-full max-w-md">

                    <div className="mb-12 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
                            I
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">INTERNAL</h1>
                            <p className="text-xs tracking-widest text-slate-400">WORKSPACE</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900">
                        Welcome back
                    </h2>

                    <p className="mt-2 mb-8 text-sm text-slate-500">
                        Sign in to manage ideas, tasks and team progress.
                    </p>

                    <LoginForm onSubmit={handleLogin} />

                    <p className="mt-8 text-center text-xs text-slate-400">
                        Internal Workspace · Development Environment
                    </p>
                </div>
            </section>

            <section className="relative hidden flex-col justify-center overflow-hidden bg-slate-950 px-12 text-white lg:flex lg:px-20">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

                <div className="relative max-w-lg">
                    <span className="text-sm font-semibold tracking-widest text-indigo-300">
                        ONE WORKSPACE. SHARED PROGRESS.
                    </span>

                    <h2 className="mt-6 text-5xl font-bold leading-tight">
                        Turn ideas into meaningful work.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-slate-300">
                        Capture ideas, collaborate with your team,
                        manage execution and keep everyone moving forward.
                    </p>

                    <div className="mt-12 space-y-7">
                        <div className="flex items-center gap-4">
                            <Lightbulb className="text-indigo-300" size={25} />
                            <span>Capture and organize ideas</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <ListChecks className="text-indigo-300" size={25} />
                            <span>Track tasks and individual progress</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Users className="text-indigo-300" size={25} />
                            <span>Collaborate across the organization</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
