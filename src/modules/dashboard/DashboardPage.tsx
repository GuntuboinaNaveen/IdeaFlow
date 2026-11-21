import { PermissionDebug } from "./components/PermissionDebug";

export function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900">
                Dashboard
            </h1>

            <PermissionDebug />
        </div>
    );
}