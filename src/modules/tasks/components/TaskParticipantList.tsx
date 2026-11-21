
import type { TaskParticipant } from "../types/task.types";

interface TaskParticipantListProps {
    participants: TaskParticipant[];
}

const statusStyles: Record<string, string> = {
    ASSIGNED: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-amber-50 text-amber-700",
    SUBMITTED: "bg-violet-50 text-violet-700",
    CHANGES_REQUESTED: "bg-red-50 text-red-700",
    APPROVED: "bg-green-50 text-green-700",
};

export default function TaskParticipantList({
    participants,
}: TaskParticipantListProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Participants</h2>
                <span className="text-xs text-slate-500">
                    {participants.length} assigned
                </span>
            </div>

            {participants.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                    No participants assigned. This task is available for pickup.
                </p>
            ) : (
                <div className="mt-4 divide-y divide-slate-100">
                    {participants.map((participant) => {
                        const total = participant.checklist.length;
                        const completed = participant.checklist.filter(
                            (item) => item.completed
                        ).length;
                        const progress =
                            total === 0 ? 0 : Math.round((completed / total) * 100);

                        return (
                            <div
                                key={participant.userId}
                                className="py-4 first:pt-0 last:pb-0"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {participant.userName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {participant.role}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[participant.status] ??
                                            "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {participant.status.replaceAll("_", " ")}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-3">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-indigo-600"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="w-10 text-right text-xs text-slate-500">
                                        {progress}%
                                    </span>
                                </div>

                                {participant.reviewComment && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Review: {participant.reviewComment}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
