
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { UnauthorizedPage } from "../modules/auth/pages/UnauthorizedPage";

import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { PermissionGuard } from "../components/common/PermissionGuard";

import { PERMISSIONS } from "../constants/permissions";

import { DashboardPage } from "../modules/dashboard/DashboardPage";

import { ReviewsPage } from "../modules/reviews/ReviewsPage";
import { EmployeesPage } from "../modules/employees/EmployeesPage";
import { ComingSoonPage } from "../components/common/ComingSoonPage";


import IdeasPage from "../modules/ideas/pages/IdeasPage";
import CreateIdeaPage from "../modules/ideas/pages/CreateIdeaPage";
import IdeaDetailsPage from "../modules/ideas/pages/IdeaDetailsPage";

import TasksPage from "../modules/tasks/pages/TasksPage";
import MyTasksPage from "../modules/tasks/pages/MyTasksPage";
import CreateTaskPage from "../modules/tasks/pages/CreateTaskPage";
import TaskDetailsPage from "../modules/tasks/pages/TaskDetailsPage";
import TeamTasksPage from "../modules/team-tasks/pages/TeamTasksPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                        />

                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/ideas" element={<IdeasPage />} />


                        <Route
                            path="/reviews"
                            element={
                                <PermissionGuard permission={PERMISSIONS.REVIEW_VIEW}>
                                    <ReviewsPage />
                                </PermissionGuard>
                            }
                        />

                        <Route
                            path="/employees"
                            element={
                                <PermissionGuard permission={PERMISSIONS.USER_VIEW}>
                                    <EmployeesPage />
                                </PermissionGuard>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <PermissionGuard permission={PERMISSIONS.USER_MANAGE}>
                                    <ComingSoonPage title="Settings" />
                                </PermissionGuard>
                            }
                        />

                        <Route path="ideas" element={<IdeasPage />} />
                        <Route path="ideas/new" element={<CreateIdeaPage />} />
                        <Route path="ideas/:id" element={<IdeaDetailsPage />} />

                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="tasks/new" element={<CreateTaskPage />} />
                        <Route path="tasks/:id" element={<TaskDetailsPage />} />
                        <Route path="my-tasks" element={<MyTasksPage />} />
                        <Route
                            path="team-tasks"
                            element={<TeamTasksPage />}
                        />
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
