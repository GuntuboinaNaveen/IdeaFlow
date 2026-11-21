interface Props {
    summary: { total: number; inProgress: number; pendingSubmission: number; awaitingReview: number; completed: number };
}
const metrics = [
    ["total", "Total Tasks"],
    ["inProgress", "In Progress"],
    ["pendingSubmission", "Pending Submission"],
    ["awaitingReview", "Awaiting Review"],
    ["completed", "Completed"],
] as const;

export default function TeamProgressSummary({ summary }: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map(([key, label]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{summary[key]}</p>
                </div>
            ))}
        </div>
    );
}
