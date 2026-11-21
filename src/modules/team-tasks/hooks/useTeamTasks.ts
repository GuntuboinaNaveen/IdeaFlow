import { useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTasks } from "../../tasks/hooks/useTasks";
import type { Task } from "../../tasks/types/task.types";

export interface TeamTaskFilters {
    search: string;
    status: string;
}

export function useTeamTasks(filters: TeamTaskFilters = { search: "", status: "ALL" }) {
    const { user } = useAuth();
    const { tasks } = useTasks();

    const visibleTasks = useMemo(() => {
        if (!user) return [];

        const role = String(user.role).toUpperCase();
        const scopedTasks = role === "CEO" || role === "ADMIN" || role === "MANAGER"
            ? tasks
            : tasks.filter((task: Task) =>
                task.createdBy === user.id ||
                task.participants.some((participant) => participant.userId === user.id)
            );

        const search = filters.search.trim().toLowerCase();
        return scopedTasks.filter((task: Task) => {
            const matchesSearch = !search ||
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search) ||
                task.createdByName.toLowerCase().includes(search) ||
                task.participants.some((p) => p.userName.toLowerCase().includes(search));
            const matchesStatus = filters.status === "ALL" || task.status === filters.status;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, user, filters.search, filters.status]);

    const summary = useMemo(() => ({
        total: visibleTasks.length,
        inProgress: visibleTasks.filter((t) => t.status === "IN_PROGRESS").length,
        pendingSubmission: visibleTasks.filter((t) =>
            t.participants.some((p) => p.status === "ASSIGNED" || p.status === "IN_PROGRESS")
        ).length,
        awaitingReview: visibleTasks.filter((t) => t.status === "IN_REVIEW").length,
        completed: visibleTasks.filter((t) => t.status === "COMPLETED").length,
    }), [visibleTasks]);

    return { tasks: visibleTasks, summary, currentUser: user };
}
