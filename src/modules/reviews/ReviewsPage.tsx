import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Eye, MessageSquare, Search, RotateCcw } from "lucide-react";

import { useTasks } from "../tasks/hooks/useTasks";
import type { Task } from "../tasks/types/task.types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

type ReviewTab = "PENDING" | "HISTORY" | "COMPLETED";

function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function getProgress(task: Task) {
    const total = task.participants.length;
    const submitted = task.participants.filter(
        (participant) => participant.status === "SUBMITTED" || participant.status === "APPROVED"
    ).length;
    return { total, submitted };
}

export function ReviewsPage() {
    const { tasks, reviewTask } = useTasks();
    const [tab, setTab] = useState<ReviewTab>("PENDING");
    const [search, setSearch] = useState("");
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const pendingTasks = useMemo(
        () => tasks.filter((task) => task.status === "IN_REVIEW"),
        [tasks]
    );
    const reviewedTasks = useMemo(
        () => tasks.filter((task) => Boolean(task.reviewedAt) && task.status !== "IN_REVIEW"),
        [tasks]
    );
    const completedTasks = useMemo(
        () => tasks.filter((task) => task.status === "COMPLETED"),
        [tasks]
    );

    const source = tab === "PENDING" ? pendingTasks : tab === "HISTORY" ? reviewedTasks : completedTasks;
    const filteredTasks = source.filter((task) =>
        `${task.title} ${task.id} ${task.createdByName}`.toLowerCase().includes(search.toLowerCase())
    );

    const submitReview = (task: Task, decision: "APPROVED" | "CHANGES_REQUESTED") => {
        const comment = comments[task.id]?.trim() ?? "";
        setError("");
        setSuccess("");
        try {
            reviewTask(task.id, decision, comment);
            setComments((current) => ({ ...current, [task.id]: "" }));
            setSelectedTaskId(null);
            setSuccess(
                decision === "APPROVED"
                    ? `"${task.title}" was approved and marked completed.`
                    : `Changes were requested for "${task.title}".`
            );
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to submit the review.");
        }
    };

    const metrics = [
        { label: "Pending Reviews", value: pendingTasks.length, icon: Clock3, tone: "text-amber-600 bg-amber-50" },
        { label: "Reviewed", value: reviewedTasks.length, icon: MessageSquare, tone: "text-blue-600 bg-blue-50" },
        { label: "Completed", value: completedTasks.length, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Review submitted task work, approve completion, or request changes.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map(({ label, value, icon: Icon, tone }) => (
                    <Card key={label} className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{label}</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${tone}`}><Icon size={21} /></div>
                        </div>
                    </Card>
                ))}
            </div>

            {success && (
                <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {success}
                </div>
            )}
            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <Card className="overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {([
                            ["PENDING", "Pending Reviews"],
                            ["HISTORY", "Review History"],
                            ["COMPLETED", "Completed"],
                        ] as const).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => { setTab(value); setSelectedTaskId(null); }}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${tab === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {label}
                                {value === "PENDING" && (
                                    <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${tab === value ? "bg-white/20" : "bg-white"}`}>
                                        {pendingTasks.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search task, ID or creator"
                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredTasks.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <CheckCircle2 className="mx-auto text-slate-300" size={34} />
                            <h3 className="mt-3 font-semibold text-slate-800">No tasks in this view</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {tab === "PENDING" ? "Tasks will appear here after all participants submit their work." : "Reviewed tasks will appear here."}
                            </p>
                        </div>
                    ) : filteredTasks.map((task) => {
                        const progress = getProgress(task);
                        const isSelected = selectedTaskId === task.id;
                        return (
                            <div key={task.id} className="p-4 sm:p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">{task.title}</h3>
                                            <Badge>{task.status.replaceAll("_", " ")}</Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-400">{task.id} · Created by {task.createdByName}</p>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                            <span>{progress.submitted}/{progress.total} participants submitted</span>
                                            <span>Due: {formatDate(task.dueDate)}</span>
                                            {task.reviewedAt && <span>Reviewed: {formatDate(task.reviewedAt)}</span>}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                                    >
                                        <Eye size={16} className="mr-2" />
                                        {isSelected ? "Close details" : tab === "PENDING" ? "Review task" : "View details"}
                                    </Button>
                                </div>

                                {isSelected && (
                                    <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Participant submissions</h4>
                                            <div className="mt-3 space-y-3">
                                                {task.participants.map((participant) => (
                                                    <div key={participant.userId} className="rounded-lg border border-slate-200 bg-white p-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">{participant.userName}</p>
                                                                <p className="text-xs text-slate-500">{participant.role} · Submitted {formatDate(participant.submittedAt)}</p>
                                                            </div>
                                                            <Badge>{participant.status.replaceAll("_", " ")}</Badge>
                                                        </div>
                                                        <div className="mt-3 space-y-2">
                                                            {task.checklistTemplate.map((item) => {
                                                                const state = participant.checklist.find((entry) => entry.templateId === item.id);
                                                                return (
                                                                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                                                                        <span className="text-slate-600">{item.title}</span>
                                                                        <span className={state?.completed ? "font-medium text-emerald-700" : "text-slate-400"}>
                                                                            {state?.completed ? "Completed" : "Pending"}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {participant.checklist.some((entry) => entry.isPersonal) && (
                                                            <div className="mt-3 border-t border-slate-100 pt-2">
                                                                <p className="mb-2 text-xs font-semibold text-slate-600">Personal checklist</p>
                                                                {participant.checklist.filter((entry) => entry.isPersonal).map((entry) => (
                                                                    <div key={entry.templateId} className="flex items-center justify-between gap-3 py-1 text-xs">
                                                                        <span className="text-slate-600">{entry.title}</span>
                                                                        <span className={entry.completed ? "font-medium text-emerald-700" : "text-slate-400"}>
                                                                            {entry.completed ? "Completed" : "Pending"}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {participant.reviewComment && (
                                                            <p className="mt-2 text-xs text-slate-500">Previous comment: {participant.reviewComment}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {tab === "PENDING" && (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-slate-700" htmlFor={`review-${task.id}`}>
                                                    Review comment <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    id={`review-${task.id}`}
                                                    rows={3}
                                                    value={comments[task.id] ?? ""}
                                                    onChange={(event) => setComments((current) => ({ ...current, [task.id]: event.target.value }))}
                                                    placeholder="Add feedback or explain the requested changes..."
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                />
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Button type="button" variant="secondary" onClick={() => submitReview(task, "CHANGES_REQUESTED")}>
                                                        <RotateCcw size={15} className="mr-2" /> Request Changes
                                                    </Button>
                                                    <Button type="button" onClick={() => submitReview(task, "APPROVED")}>
                                                        <CheckCircle2 size={15} className="mr-2" /> Approve Completion
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {tab !== "PENDING" && (
                                            <div className="rounded-lg bg-white p-3 text-sm">
                                                <p className="font-medium text-slate-700">Latest review</p>
                                                <p className="mt-1 text-slate-600">{task.reviewComment || "No review comment recorded."}</p>
                                                <p className="mt-2 text-xs text-slate-400">
                                                    {task.reviewerName ? `Reviewed by ${task.reviewerName}` : "Reviewer not recorded"} · {formatDate(task.reviewedAt)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
            <p className="text-xs text-slate-400">
                A task enters Pending Reviews only after all assigned participants have submitted their work.
            </p>
        </div>
    );
}
