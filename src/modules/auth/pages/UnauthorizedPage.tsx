
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export function UnauthorizedPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <ShieldAlert size={52} className="text-amber-500" />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
                Access Restricted
            </h1>

            <p className="mt-2 max-w-md text-sm text-slate-500">
                You don't have permission to access this section.
                Contact your administrator if you believe this is incorrect.
            </p>

            <Link
                to="/dashboard"
                className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
