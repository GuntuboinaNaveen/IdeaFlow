
import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { permissionService } from "../services/permissions/permissionService";
import type { Permission } from "../constants/permissions";

export function usePermissions() {
    const { user } = useAuth();

    // Extract the role so useMemo depends on a stable primitive value.
    const role = user?.role;

    const permissions = useMemo(() => {
        if (!role) return [];
        return permissionService.getPermissions(role);
    }, [role]);

    function hasPermission(permission: Permission): boolean {
        return permissions.includes(permission);
    }

    function hasAnyPermission(required: Permission[]): boolean {
        return required.some((permission) => permissions.includes(permission));
    }

    function hasAllPermissions(required: Permission[]): boolean {
        return required.every((permission) => permissions.includes(permission));
    }

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
