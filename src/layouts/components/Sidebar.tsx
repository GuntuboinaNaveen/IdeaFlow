
import {
    LayoutDashboard,
    Lightbulb,
    Layers,
    ListTodo,
    Users,
    ClipboardCheck,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useApp } from "../../hooks/useApp";

import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS, type Permission } from "../../constants/permissions";



const navigation: {
    title: string;
    items: {
        label: string;
        path: string;
        icon: typeof LayoutDashboard;
        permissions: Permission[];
    }[];
}[] = [
        {
            title: "WORKSPACE",
            items: [
                {
                    label: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    permissions: [
                        PERMISSIONS.DASHBOARD_VIEW_ORGANIZATION,
                        PERMISSIONS.DASHBOARD_VIEW_TEAM,
                        PERMISSIONS.DASHBOARD_VIEW_PERSONAL,
                    ],
                },
                {
                    label: "Idea Inbox",
                    path: "/ideas",
                    icon: Lightbulb,
                    permissions: [PERMISSIONS.IDEA_VIEW],
                },
                {
                    label: "Task Management",
                    path: "/tasks",
                    icon: Layers,
                    permissions: [PERMISSIONS.TASK_VIEW_ALL],
                },
                {
                    label: "My Tasks",
                    path: "/my-tasks",
                    icon: ListTodo,
                    permissions: [PERMISSIONS.TASK_VIEW_ALL],
                },
                {
                    label: "Team Tasks",
                    path: "/team-tasks",
                    icon: Users,
                    permissions: [PERMISSIONS.DASHBOARD_VIEW_TEAM],
                },
            ],
        },
        {
            title: "MANAGEMENT",
            items: [
                {
                    label: "Reviews",
                    path: "/reviews",
                    icon: ClipboardCheck,
                    permissions: [PERMISSIONS.REVIEW_VIEW],
                },
                {
                    label: "Employees",
                    path: "/employees",
                    icon: Users,
                    permissions: [PERMISSIONS.USER_VIEW],
                },
                {
                    label: "Reports",
                    path: "/reports",
                    icon: BarChart3,
                    permissions: [PERMISSIONS.REPORT_VIEW],
                },
            ],
        },
    ];

interface SidebarProps {
    collapsed: boolean;
    onNavigate?: () => void;
    mobile?: boolean;
}

export function Sidebar({
    collapsed,
    onNavigate,
    mobile = false,
}: SidebarProps) {
    const { hasAnyPermission } = usePermissions();
    const { dispatch } = useApp();

    const isCollapsed = mobile ? false : collapsed;

    return (
        <aside
            className={`flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ${isCollapsed ? "w-[76px]" : "w-[260px]"
                }`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        I
                    </div>

                    {!isCollapsed && (
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                INTERNAL
                            </h1>
                            <p className="text-[10px] font-medium tracking-wider text-slate-400">
                                WORKSPACE
                            </p>
                        </div>
                    )}
                </div>

                {mobile ? (
                    <button
                        onClick={onNavigate}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close navigation"
                    >
                        <X size={19} />
                    </button>
                ) : (
                    <button
                        onClick={() =>
                            dispatch({ type: "TOGGLE_SIDEBAR" })
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={17} />
                        ) : (
                            <ChevronLeft size={17} />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                {navigation.map((group) => {
                    const visibleItems = group.items.filter((item) =>
                        hasAnyPermission(item.permissions)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.title}>
                            {!isCollapsed && (
                                <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                    {group.title}
                                </p>
                            )}

                            <div className="space-y-1">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={onNavigate}
                                            title={isCollapsed ? item.label : undefined}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                                    ? "bg-indigo-50 text-indigo-700"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                } ${isCollapsed ? "justify-center" : ""}`
                                            }
                                        >
                                            <Icon size={19} className="shrink-0" />

                                            {!isCollapsed && <span>{item.label}</span>}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <div>
                    {!isCollapsed && (
                        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.12em] text-slate-400">
                            PREFERENCES
                        </p>
                    )}

                    <NavLink
                        to="/settings"
                        onClick={onNavigate}
                        title={isCollapsed ? "Settings" : undefined}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-50"
                            } ${isCollapsed ? "justify-center" : ""}`
                        }
                    >
                        <Settings size={19} />
                        {!isCollapsed && <span>Settings</span>}
                    </NavLink>
                </div>
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="border-t border-slate-100 p-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700">
                            Internal Workspace
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}
