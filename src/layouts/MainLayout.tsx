
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { useApp } from "../hooks/useApp";
import { PageContainer } from "./components/PageContainer";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/ideas": "Idea Inbox",
    "/tasks": "Task Management",
    "/my-tasks": "My Tasks",
    "/team-tasks": "Team Tasks",
    "/reviews": "Reviews",
    "/employees": "Employees",
    "/reports": "Reports",
    "/settings": "Settings",
};

export function MainLayout() {
    const location = useLocation();

    const { state, dispatch } = useApp();

    const title =
        pageTitles[location.pathname] ?? "Internal";

    useEffect(() => {
        dispatch({ type: "CLOSE_MOBILE_SIDEBAR" });
    }, [location.pathname, dispatch]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar collapsed={state.sidebarCollapsed} />
            </div>

            {/* Mobile Sidebar */}
            {state.mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">

                    <div
                        className="absolute inset-0 bg-slate-900/40"
                        onClick={() =>
                            dispatch({ type: "CLOSE_MOBILE_SIDEBAR" })
                        }
                    />

                    <div className="relative h-full w-[280px]">
                        <Sidebar
                            collapsed={false}
                            mobile
                            onNavigate={() =>
                                dispatch({ type: "CLOSE_MOBILE_SIDEBAR" })
                            }
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex min-w-0 flex-1 flex-col">

                <Header title={title} />

                <PageContainer />

                {/* <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-[1600px]">
                        <Outlet />
                    </div>
                </main> */}

            </div>
        </div>
    );
}
