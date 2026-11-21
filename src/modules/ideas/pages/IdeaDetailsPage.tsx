
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Pencil, Trash2, ClipboardList } from "lucide-react";

import { useIdeas } from "../hooks/useIdeas";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../constants/permissions";


import IdeaStatusBadge from "../components/IdeaStatusBadge";

import type {
    IdeaCategory,
    IdeaPriority,
    UpdateIdeaInput,
} from "../types/idea.types";

const categoryLabels: Record<IdeaCategory, string> = {
    PROCESS_IMPROVEMENT: "Process Improvement",
    PRODUCT: "Product",
    TECHNOLOGY: "Technology",
    COST_SAVING: "Cost Saving",
    CUSTOMER_EXPERIENCE: "Customer Experience",
    OTHER: "Other",
};

export default function IdeaDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { hasPermission } = usePermissions();

    const {
        ideas,
        updateIdea,
        deleteIdea,
        reviewIdea,
    } = useIdeas();

    const idea = ideas.find((item) => item.id === id);

    const [isEditing, setIsEditing] = useState(false);
    const [reviewComment, setReviewComment] = useState("");
    const [error, setError] = useState("");

    const [editForm, setEditForm] = useState<UpdateIdeaInput>({
        title: idea?.title ?? "",
        description: idea?.description ?? "",
        category: idea?.category ?? "OTHER",
        priority: idea?.priority ?? "MEDIUM",
    });

    if (!idea) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <h1 className="text-xl font-semibold text-slate-900">
                    Idea not found
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    This idea may have been deleted or the link may be invalid.
                </p>
                <Link
                    to="/ideas"
                    className="mt-4 inline-flex text-sm font-medium text-indigo-600"
                >
                    Back to Ideas
                </Link>
            </div>
        );
    }

    const isCreator = user?.id === idea.createdBy;

    const canEdit =
        isCreator &&
        hasPermission(PERMISSIONS.IDEA_UPDATE) &&
        idea.status !== "REJECTED" &&
        idea.status !== "CONVERTED_TO_TASK";

    const canDelete =
        isCreator &&
        hasPermission(PERMISSIONS.IDEA_DELETE) &&
        idea.status !== "CONVERTED_TO_TASK";

    const canReview =
        hasPermission(PERMISSIONS.IDEA_REVIEW);

    // Only accepted ideas that have not already been converted can become tasks.
    const canCreateTask =
        idea.status === "ACCEPTED" &&
        !idea.convertedTaskId &&
        hasPermission(PERMISSIONS.TASK_CREATE);

    function handleEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            if (!idea) return;
            updateIdea(idea.id, editForm);
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update idea."
            );
        }
    }

    function handleDelete() {
        if (!idea) return;

        if (!window.confirm("Are you sure you want to delete this idea?")) {
            return;
        }

        try {
            deleteIdea(idea.id);
            navigate("/ideas");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to delete idea."
            );
        }
    }

    function handleReview(
        status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED"
    ) {
        if (!idea) return;
        setError("");

        try {
            reviewIdea(idea.id, status, reviewComment);
            setReviewComment("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to review idea."
            );
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Link
                to="/ideas"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
            >
                <ArrowLeft size={16} />
                Back to Ideas
            </Link>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-3">
                            <IdeaStatusBadge status={idea.status} />
                        </div>

                        <h1 className="text-2xl font-semibold text-slate-900">
                            {idea.title}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            {idea.id}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canCreateTask && (
                            <Link
                                to={`/tasks/new?ideaId=${encodeURIComponent(idea.id)}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                <ClipboardList size={15} />
                                Convert to Task
                            </Link>
                        )}

                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditForm({
                                        title: idea.title,
                                        description: idea.description,
                                        category: idea.category,
                                        priority: idea.priority,
                                    });
                                    setIsEditing(!isEditing);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                            >
                                <Pencil size={15} />
                                Edit
                            </button>
                        )}

                        {canDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={15} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-slate-500">Submitted by</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                            {idea.createdByName}
                        </p>
                        <p className="text-xs text-slate-500">
                            {idea.createdByRole}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                            {categoryLabels[idea.category]}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Priority</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                            {idea.priority}
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <h2 className="font-semibold text-slate-900">
                        Description
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {idea.description}
                    </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={15} />
                    Submitted {new Date(idea.createdAt).toLocaleString()}
                </div>

                {idea.status === "CONVERTED_TO_TASK" && idea.convertedTaskId && (
                    <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                        This idea has been converted into a task.{" "}
                        <Link
                            to={`/tasks/${idea.convertedTaskId}`}
                            className="font-semibold underline"
                        >
                            View task
                        </Link>
                    </div>
                )}
            </div>

            {isEditing && (
                <form
                    onSubmit={handleEdit}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="font-semibold text-slate-900">
                        Edit Idea
                    </h2>

                    <input
                        required
                        maxLength={150}
                        value={editForm.title}
                        onChange={(event) =>
                            setEditForm({ ...editForm, title: event.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        placeholder="Idea title"
                    />

                    <textarea
                        required
                        minLength={10}
                        maxLength={3000}
                        rows={5}
                        value={editForm.description}
                        onChange={(event) =>
                            setEditForm({
                                ...editForm,
                                description: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        placeholder="Idea description"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <select
                            value={editForm.category}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    category: event.target.value as IdeaCategory,
                                })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        >
                            {Object.entries(categoryLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={editForm.priority}
                            onChange={(event) =>
                                setEditForm({
                                    ...editForm,
                                    priority: event.target.value as IdeaPriority,
                                })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            )}

            {canReview && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-semibold text-slate-900">
                        Idea Review
                    </h2>

                    {idea.status === "SUBMITTED" && (
                        <>
                            <p className="text-sm text-slate-500">
                                Move this idea into the review queue.
                            </p>
                            <button
                                type="button"
                                onClick={() => handleReview("UNDER_REVIEW")}
                                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                            >
                                Start Review
                            </button>
                        </>
                    )}

                    {idea.status === "UNDER_REVIEW" && (
                        <>
                            <p className="text-sm text-slate-500">
                                Add a review comment before accepting or rejecting this idea.
                            </p>

                            <textarea
                                rows={3}
                                value={reviewComment}
                                onChange={(event) =>
                                    setReviewComment(event.target.value)
                                }
                                placeholder="Enter your review comments..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleReview("ACCEPTED")}
                                    disabled={!reviewComment.trim()}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Accept Idea
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleReview("REJECTED")}
                                    disabled={!reviewComment.trim()}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Reject Idea
                                </button>
                            </div>
                        </>
                    )}

                    {idea.status !== "SUBMITTED" &&
                        idea.status !== "UNDER_REVIEW" && (
                            <p className="text-sm text-slate-500">
                                This idea has already been reviewed.
                            </p>
                        )}
                </div>
            )}

            {(idea.reviewComment || idea.reviewedBy) && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-semibold text-slate-900">
                        Review History
                    </h2>

                    {idea.reviewedBy && (
                        <p className="mt-3 text-sm text-slate-600">
                            Reviewed by: {idea.reviewedBy}
                        </p>
                    )}

                    {idea.reviewedAt && (
                        <p className="mt-1 text-xs text-slate-500">
                            {new Date(idea.reviewedAt).toLocaleString()}
                        </p>
                    )}

                    {idea.reviewComment && (
                        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                            {idea.reviewComment}
                        </p>
                    )}
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
