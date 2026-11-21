import { Link } from "react-router-dom";
import type { Task } from "../../tasks/types/task.types";
import TeamParticipantProgress from "./TeamParticipantProgress";

const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-slate-100 text-slate-700",
    ASSIGNED: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-amber-50 text-amber-700",
    IN_REVIEW: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
};

export default function TeamTaskCard({ task }: { task: Task }) {
    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-slate-500">{task.id}</p>
                    <h2 className="mt-1 text-base font-semibold text-slate-900">{task.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status] ?? statusStyles.AVAILABLE}`}>
                    {task.status.replaceAll("_", " ")}
                </span>
            </div>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                <div><p className="text-xs text-slate-500">Created by</p><p className="mt-1 text-sm font-medium">{task.createdByName}</p></div>
                <div><p className="text-xs text-slate-500">Priority</p><p className="mt-1 text-sm font-medium">{task.priority}</p></div>
                <div><p className="text-xs text-slate-500">Due date</p><p className="mt-1 text-sm font-medium">{task.dueDate || "Not set"}</p></div>
            </div>
            <div className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Participant progress</h3>
                    <span className="text-xs text-slate-500">{task.participants.length} assigned</span>
                </div>
                <TeamParticipantProgress participants={task.participants} />
            </div>
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Open task details →</Link>
            </div>
        </article>
    );
}
