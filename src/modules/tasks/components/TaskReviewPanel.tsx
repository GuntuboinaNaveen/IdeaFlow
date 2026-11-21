
import { useState } from "react";
import type { Task } from "../types/task.types";

interface TaskReviewPanelProps {
    task: Task;
    canApprove: boolean;
    canRequestChanges: boolean;
    onReview: (
        decision: "APPROVED" | "CHANGES_REQUESTED",
        comment: string
    ) => void;
}

export default function TaskReviewPanel({
    task,
    canApprove,
    canRequestChanges,
    onReview,
}: TaskReviewPanelProps) {
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    if ((!canApprove && !canRequestChanges) || task.status !== "IN_REVIEW") {
        return null;
    }

    function handleReview(
        decision: "APPROVED" | "CHANGES_REQUESTED"
    ) {
        if (!comment.trim()) {
            setError("Please enter a review comment.");
            return;
        }

        setError("");
        onReview(decision, comment.trim());
        setComment("");
    }

    return (
        <section className="rounded-xl border border-violet-200 bg-white p-6">
            <div>
                <h2 className="font-semibold text-slate-900">Manager Review</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Review the submitted work before completing this task.
                </p>
            </div>

            <div className="mt-4 rounded-lg bg-violet-50 p-3">
                <p className="text-sm font-medium text-violet-800">
                    {task.participants.length} participant(s)
                </p>
                <p className="mt-1 text-xs text-violet-700">
                    All participants have submitted their work.
                </p>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
                Review comment *
            </label>

            <textarea
                rows={4}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Enter approval notes or requested changes..."
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={!canApprove || !comment.trim()}
                    onClick={() => handleReview("APPROVED")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Approve Completion
                </button>

                <button
                    type="button"
                    disabled={!canRequestChanges || !comment.trim()}
                    onClick={() => handleReview("CHANGES_REQUESTED")}
                    className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Request Changes
                </button>
            </div>
        </section>
    );
}
