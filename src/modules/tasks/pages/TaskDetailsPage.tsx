
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../constants/permissions";
import { useTasks } from "../hooks/useTasks";
import TaskStatusBadge from "../components/TaskStatusBadge";
import TaskChecklist from "../components/TaskChecklist";
import TaskParticipantList from "../components/TaskParticipantList";
import TaskReviewPanel from "../components/TaskReviewPanel";

export default function TaskDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { hasPermission } = usePermissions();
    const {
        tasks,
        updateChecklistItem,
        addPersonalChecklistItem,
        addSharedChecklistItem,
        joinAsCreator,
        requestToJoinTask,
        reviewJoinRequest,
        submitMyWork,
        reviewTask,
        cancelTask,
        reactivateTask,
    } = useTasks();

    const task = tasks.find((item) => item.id === id);
    const [error, setError] = useState("");
    const [sharedChecklistTitle, setSharedChecklistTitle] = useState("");
    const [sharedChecklistRequired, setSharedChecklistRequired] = useState(true);

    if (!task) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <h1 className="font-semibold text-slate-900">Task not found</h1>
                <Link to="/tasks" className="mt-3 inline-block text-sm text-indigo-600">
                    Back to Tasks
                </Link>
            </div>
        );
    }

    const participant = task.participants.find(
        (item) => item.userId === user?.id
    );

    const isCreator = task.createdBy === user?.id;
    const canManageJoinRequests = Boolean(user && (isCreator || user.role === "CEO"));
    const myJoinRequest = task.joinRequests?.find((request) => request.userId === user?.id);
    const pendingJoinRequests = (task.joinRequests ?? []).filter((request) => request.status === "PENDING");
    const canRequestToJoin = Boolean(user) && !participant &&
        (task.status === "ASSIGNED" || task.status === "IN_PROGRESS");
    const canApprove = hasPermission(PERMISSIONS.REVIEW_APPROVE);
    const canRequestChanges = hasPermission(PERMISSIONS.REVIEW_REQUEST_CHANGES);
    const canWork =
        Boolean(participant) &&
        participant?.status !== "SUBMITTED" &&
        participant?.status !== "APPROVED" &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED" &&
        task.status !== "IN_REVIEW";

    function runAction(action: () => void) {
        setError("");
        try {
            action();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed.");
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Link to="/tasks" className="text-sm text-slate-500 hover:text-indigo-600">
                ← Back to Tasks
            </Link>

            <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-500">{task.id}</p>
                        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                            {task.title}
                        </h1>
                    </div>
                    <TaskStatusBadge status={task.status} />
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {task.description}
                </p>

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-500">Created by</p>
                        <p className="mt-1 text-sm font-medium">{task.createdByName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Priority</p>
                        <p className="mt-1 text-sm font-medium">{task.priority}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Due date</p>
                        <p className="mt-1 text-sm font-medium">{task.dueDate || "Not set"}</p>
                    </div>
                </div>

                {task.sourceIdeaId && (
                    <p className="mt-4 text-sm">
                        Created from idea:{" "}
                        <Link
                            to={`/ideas/${task.sourceIdeaId}`}
                            className="font-medium text-indigo-600"
                        >
                            {task.sourceIdeaId}
                        </Link>
                    </p>
                )}
            </section>

            <TaskParticipantList participants={task.participants} />

            {isCreator && !["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status) && (
                <section className="rounded-xl border border-indigo-200 bg-white p-6">
                    <h2 className="font-semibold text-slate-900">Shared Task Checklist</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Add task-level checklist items here. Every participant will see each item in their own checklist and track their own completion.
                    </p>
                    <form
                        className="mt-4 flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            runAction(() => {
                                addSharedChecklistItem(task.id, sharedChecklistTitle, sharedChecklistRequired);
                                setSharedChecklistTitle("");
                            });
                        }}
                    >
                        <input
                            value={sharedChecklistTitle}
                            onChange={(event) => setSharedChecklistTitle(event.target.value)}
                            maxLength={200}
                            placeholder="Add a task checklist item visible to everyone"
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={sharedChecklistRequired}
                                onChange={(event) => setSharedChecklistRequired(event.target.checked)}
                            />
                            Required
                        </label>
                        <button
                            type="submit"
                            disabled={!sharedChecklistTitle.trim()}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            Add shared item
                        </button>
                    </form>
                    <p className="mt-3 text-xs text-slate-500">
                        {task.checklistTemplate.length} shared checklist item(s). Completion is tracked separately for each participant.
                    </p>
                </section>
            )}

            {isCreator && !participant && !["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status) && (
                <section className="rounded-xl border border-indigo-200 bg-white p-5">
                    <h2 className="font-semibold text-slate-900">Join your task</h2>
                    <p className="mt-1 text-sm text-slate-500">
Join the task to become a participant and receive your own checklist. Your request is approved automatically.
                    </p>
                    <button
                        type="button"
                        onClick={() => runAction(() => joinAsCreator(task.id))}
                        className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Join this task
                    </button>
                </section>
            )}

            {canRequestToJoin && !isCreator && (
                <section className="rounded-xl border border-indigo-200 bg-white p-5">
                    <h2 className="font-semibold text-slate-900">Join this task</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Request to join the task. The task creator or CEO must approve your request before you become a participant.
                    </p>
                    {myJoinRequest?.status === "PENDING" ? (
                        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Your request is waiting for approval.</p>
                    ) : myJoinRequest?.status === "APPROVED" ? (
                        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Your request was approved. Refresh the page if you do not yet see your participant checklist.</p>
                    ) : myJoinRequest?.status === "REJECTED" ? (
                        <div className="mt-3">
                            <p className="text-sm text-red-700">Your previous request was not approved.</p>
                            <button
                                type="button"
                                onClick={() => runAction(() => requestToJoinTask(task.id))}
                                className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                            >
                                Request to Join Again
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => runAction(() => requestToJoinTask(task.id))}
                            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                        >
                            Request to Join
                        </button>
                    )}
                </section>
            )}

            {canManageJoinRequests && pendingJoinRequests.length > 0 && (
                <section className="rounded-xl border border-amber-200 bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-semibold text-slate-900">Join Requests</h2>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            {pendingJoinRequests.length} pending
                        </span>
                    </div>
                    <div className="mt-4 divide-y divide-slate-100">
                        {pendingJoinRequests.map((request) => (
                            <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{request.userName}</p>
                                    <p className="text-xs text-slate-500">{request.role} · Requested {new Date(request.requestedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => runAction(() => reviewJoinRequest(task.id, request.id, "REJECTED"))}
                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => runAction(() => reviewJoinRequest(task.id, request.id, "APPROVED"))}
                                        className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                                    >
                                        Approve & Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {participant && (
                <TaskChecklist
                    templates={task.checklistTemplate}
                    checklist={participant.checklist}
                    disabled={!canWork}
                    onToggle={(templateId, completed) =>
                        runAction(() =>
                            updateChecklistItem(task.id, templateId, completed)
                        )
                    }
                    onAddPersonalItem={(title) =>
                        runAction(() => addPersonalChecklistItem(task.id, title))
                    }
                    onSubmit={
                        canWork
                            ? () => runAction(() => submitMyWork(task.id))
                            : undefined
                    }
                />
            )}

            {(isCreator || user?.role === "CEO") && task.participants
                .filter((item) => item.userId !== user?.id)
                .map((item) => (
                    <TaskChecklist
                        key={item.userId}
                        title={`${item.userName}'s Checklist`}
                        templates={task.checklistTemplate}
                        checklist={item.checklist}
                        disabled
                        readOnlyNote="Read-only progress view. Only this participant can change these checklist items."
                        onToggle={() => undefined}
                        onAddPersonalItem={() => undefined}
                    />
                ))}

            <TaskReviewPanel
                task={task}
                canApprove={canApprove}
                canRequestChanges={canRequestChanges}
                onReview={(decision, reviewComment) =>
                    runAction(() => reviewTask(task.id, decision, reviewComment))
                }
            />

            {task.reviewComment && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-semibold text-slate-900">Latest Review</h2>
                    <p className="mt-2 text-sm text-slate-600">{task.reviewComment}</p>
                    <p className="mt-2 text-xs text-slate-500">
                        Reviewed by {task.reviewerName || "Manager"}
                    </p>
                </section>
            )}

            {isCreator && hasPermission(PERMISSIONS.TASK_CANCEL) &&
                task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                    <button
                        type="button"
                        onClick={() => {
                            const confirmed = window.confirm(
                                "Cancel this task? Participants will not be able to continue until it is reactivated."
                            );
                            if (confirmed) runAction(() => cancelTask(task.id));
                        }}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"
                    >
                        Cancel Task
                    </button>
                )}

            {isCreator && hasPermission(PERMISSIONS.TASK_CANCEL) &&
                task.status === "CANCELLED" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm text-amber-800">
                            This task is cancelled. Reactivating it will restore its previous status and keep participant checklist progress.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const confirmed = window.confirm(
                                    "Reactivate this task and restore its previous status?"
                                );
                                if (confirmed) runAction(() => reactivateTask(task.id));
                            }}
                            className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            Reactivate Task
                        </button>
                    </div>
                )}

            {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}
