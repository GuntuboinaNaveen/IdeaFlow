
import type { TaskStatus } from "../types/task.types";

interface TaskStatusBadgeProps {
    status: TaskStatus;
}

const statusConfig: Record<
    TaskStatus,
    {
        label: string;
        className: string;
    }
> = {
    AVAILABLE: {
        label: "Available",
        className: "bg-slate-100 text-slate-700",
    },
    ASSIGNED: {
        label: "Assigned",
        className: "bg-blue-50 text-blue-700",
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-amber-50 text-amber-700",
    },
    IN_REVIEW: {
        label: "In Review",
        className: "bg-violet-50 text-violet-700",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-green-50 text-green-700",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-50 text-red-700",
    },
};

export default function TaskStatusBadge({
    status,
}: TaskStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
