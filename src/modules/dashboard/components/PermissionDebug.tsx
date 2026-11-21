
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../constants/permissions";

export function PermissionDebug() {
    const { hasPermission } = usePermissions();

    const checks = [
        {
            label: "Create Task",
            permission: PERMISSIONS.TASK_CREATE,
        },
        {
            label: "Assign Task",
            permission: PERMISSIONS.TASK_ASSIGN,
        },
        {
            label: "Approve Completion",
            permission: PERMISSIONS.REVIEW_APPROVE,
        },
        {
            label: "Manage Users",
            permission: PERMISSIONS.USER_MANAGE,
        },
        {
            label: "View Organization Tasks",
            permission: PERMISSIONS.TASK_VIEW_ALL,
        },
    ];

    return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">
                Permission Testing
            </h2>

            <div className="space-y-3">
                {checks.map((check) => {
                    const allowed = hasPermission(check.permission);

                    return (
                        <div
                            key={check.permission}
                            className="flex items-center justify-between"
                        >
                            <span className="text-sm text-slate-600">
                                {check.label}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${allowed
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                            >
                                {allowed ? "Allowed" : "Restricted"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
