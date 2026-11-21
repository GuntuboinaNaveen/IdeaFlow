
import { Outlet } from "react-router-dom";

export function PageContainer() {
    return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
                <Outlet />
            </div>
        </main>
    );
}
