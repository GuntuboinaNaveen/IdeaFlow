
import { Link } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import type { Task } from "../types/task.types";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskCardProps {
    task: Task;
    currentUserId?: string;
    onPickup?: (taskId: string) => void;
}

export default function TaskCard({
    task,
    currentUserId,
    onPickup,
}: TaskCardProps) {
    const isParticipant = task.participants.some(
        (participant) => participant.userId === currentUserId
    );

    const canPickup =
        task.status === "AVAILABLE" &&
        Boolean(currentUserId) &&
        !isParticipant &&
        Boolean(onPickup);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <span className="text-xs text-slate-500">{task.id}</span>
                <TaskStatusBadge status={task.status} />
            </div>

            <h2 className="mt-3 font-semibold text-slate-900">
                {task.title}
            </h2>

            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {task.description}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p>Created by: {task.createdByName}</p>

                <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{task.participants.length} participants</span>
                </div>

                {task.dueDate && (
                    <div className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        <span>Due: {task.dueDate}</span>
                    </div>
                )}

                <p>Priority: {task.priority}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link
                    to={`/tasks/${task.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    View Details
                </Link>

                {canPickup && (
                    <button
                        type="button"
                        onClick={() => onPickup?.(task.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Pick Up
                    </button>
                )}
            </div>
        </article>
    );
}
