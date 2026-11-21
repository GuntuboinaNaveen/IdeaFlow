import type {
    TaskPriority,
    TaskStatus,
} from "../../tasks/types/task.types";

export interface TeamTaskFilterValues {
    search: string;
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
}

interface TeamTaskFiltersProps {
    filters: TeamTaskFilterValues;
    onChange: (filters: TeamTaskFilterValues) => void;
}

export function TeamTaskFilters({
    filters,
    onChange,
}: TeamTaskFiltersProps) {
    return (
        <div className="flex flex-wrap gap-3">
            <input
                value={filters.search}
                onChange={(event) =>
                    onChange({ ...filters, search: event.target.value })
                }
                placeholder="Search team tasks..."
                aria-label="Search team tasks"
                className="min-w-60 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            <select
                value={filters.status}
                onChange={(event) =>
                    onChange({
                        ...filters,
                        status: event.target.value as TaskStatus | "ALL",
                    })
                }
                aria-label="Filter by status"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
                <option value="ALL">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
            </select>

            <select
                value={filters.priority}
                onChange={(event) =>
                    onChange({
                        ...filters,
                        priority: event.target.value as TaskPriority | "ALL",
                    })
                }
                aria-label="Filter by priority"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
                <option value="ALL">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>
        </div>
    );
}
