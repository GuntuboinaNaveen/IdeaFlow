
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import TaskStatusBadge from "../components/TaskStatusBadge";
import { useAuth } from "../../../hooks/useAuth";

export default function TasksPage() {
    const { user } = useAuth();
    const { tasks, pickupTask } = useTasks();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [error, setError] = useState("");

    const filteredTasks = useMemo(
        () =>
            tasks.filter((task) => {
                const matchesSearch =
                    task.title.toLowerCase().includes(search.toLowerCase()) ||
                    task.description.toLowerCase().includes(search.toLowerCase()) ||
                    task.createdByName.toLowerCase().includes(search.toLowerCase());

                return matchesSearch &&
                    (status === "ALL" || task.status === status);
            }),
        [tasks, search, status]
    );

    function handlePickup(taskId: string) {
        setError("");
        try {
            pickupTask(taskId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to pick up task.");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Task Management</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View and manage organization-wide tasks.
                    </p>
                </div>
                <Link
                    to="/tasks/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"
                >
                    <Plus size={17} /> Create Task
                </Link>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative min-w-60 flex-1">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search tasks..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm"
                    />
                </div>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
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
            </div>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTasks.map((task) => {
                    const isParticipant = task.participants.some(
                        (participant) => participant.userId === user?.id
                    );

                    return (
                        <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-xs text-slate-500">{task.id}</p>
                                <TaskStatusBadge status={task.status} />
                            </div>
                            <h2 className="mt-3 font-semibold text-slate-900">{task.title}</h2>
                            <p className="mt-2 line-clamp-3 text-sm text-slate-500">{task.description}</p>
                            <div className="mt-4 space-y-1 text-xs text-slate-500">
                                <p>Created by: {task.createdByName}</p>
                                <p>Participants: {task.participants.length}</p>
                                <p>Priority: {task.priority}</p>
                                {task.dueDate && <p>Due: {task.dueDate}</p>}
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                                <Link
                                    to={`/tasks/${task.id}`}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                >
                                    View Details
                                </Link>
                                {task.status === "AVAILABLE" && !isParticipant && (
                                    <button
                                        type="button"
                                        onClick={() => handlePickup(task.id)}
                                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
                                    >
                                        Pick Up
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    No tasks found.
                </div>
            )}
        </div>
    );
}
