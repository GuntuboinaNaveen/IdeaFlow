
import {
    Bell,
    Menu,
    Search,

} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useApp } from "../../hooks/useApp";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }
    const { dispatch } = useApp();

    const displayName = user?.name ?? "Demo CEO";
    const displayRole = user?.role ?? "CEO";

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            {/* Left section */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() =>
                        dispatch({ type: "TOGGLE_MOBILE_SIDEBAR" })
                    }
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                    aria-label="Open navigation"
                >
                    <Menu size={21} />
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>
                    <p className="hidden text-xs text-slate-400 sm:block">
                        Internal / {title}
                    </p>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Search */}
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
                    <Search size={16} className="text-slate-400" />

                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400 xl:w-52"
                    />

                    <kbd className="rounded border border-slate-200 bg-white px-1.5 text-[10px] text-slate-400">
                        Ctrl K
                    </kbd>
                </div>

                {/* Notifications */}
                <button
                    className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Notifications"
                >
                    <Bell size={20} />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                </button>

                {/* Profile */}

                <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">
                            {displayName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {displayRole}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Logout"
                        aria-label="Logout"
                        className="ml-2 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

            </div>
        </header>
    );
}
