import { useState } from "react";
import TeamProgressSummary from "../components/TeamProgressSummary";
import TeamTaskCard from "../components/TeamTaskCard";
import { useTeamTasks } from "../hooks/useTeamTasks";

const statuses = ["ALL", "AVAILABLE", "ASSIGNED", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "CANCELLED"];

export default function TeamTasksPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const { tasks, summary, currentUser } = useTeamTasks({ search, status });
    const role = String(currentUser?.role ?? "").toUpperCase();
    const title = role === "CEO" || role === "ADMIN" ? "Organization Tasks" :
        role === "MANAGER" ? "Team Tasks" : "My Team Tasks";

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">Monitor task assignments, participant progress and pending submissions.</p>
            </div>
            <TeamProgressSummary summary={summary} />
            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search task, creator or participant..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
                        {statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : item.replaceAll("_", " ")}</option>)}
                    </select>
                </div>
            </section>
            {tasks.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                    {tasks.map((task) => <TeamTaskCard key={task.id} task={task} />)}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <h2 className="font-semibold text-slate-800">No tasks found</h2>
                    <p className="mt-1 text-sm text-slate-500">Try changing your search or status filter.</p>
                </div>
            )}
            {role === "MANAGER" && (
                <p className="text-xs text-amber-700">
                    Manager-specific team filtering requires a manager-to-employee team mapping. Until that is configured, this page shows the shared organization task pool.
                </p>
            )}
        </div>
    );
}
