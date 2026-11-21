
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { usePermissions } from "../../hooks/usePermissions";
import type { Permission } from "../../constants/permissions";

interface PermissionGuardProps {
    permission: Permission;
    children: ReactNode;
}

export function PermissionGuard({
    permission,
    children,
}: PermissionGuardProps) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}
