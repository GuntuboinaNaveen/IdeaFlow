
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { Button } from "../../../components/ui/Button";

import type { LoginCredentials } from "../types/auth.types";

interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    const [email, setEmail] = useState("ceo@internal.com");
    const [password, setPassword] = useState("CEO@123");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await onSubmit({ email, password });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to login."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 focus-within:border-indigo-500">
                    <Mail size={18} className="text-slate-400" />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@internal.com"
                        required
                        autoComplete="username"
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 focus-within:border-indigo-500">
                    <LockKeyhole size={18} className="text-slate-400" />

                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="w-full bg-transparent text-sm outline-none"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="text-slate-400"
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "Signing in..." : "Sign in to Internal"}
            </Button>
        </form>
    );
}
