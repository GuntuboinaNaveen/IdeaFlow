import type { TaskParticipant } from "../../tasks/types/task.types";

export default function TeamParticipantProgress({ participants }: { participants: TaskParticipant[] }) {
    if (!participants.length) return <p className="text-sm text-slate-500">No participants assigned yet.</p>;

    return (
        <div className="space-y-3">
            {participants.map((participant) => {
                const total = participant.checklist.length;
                const completed = participant.checklist.filter((item) => item.completed).length;
                const percent = total ? Math.round((completed / total) * 100) : 0;
                return (
                    <div key={participant.userId} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-800">{participant.userName}</p>
                                <p className="text-xs text-slate-500">{participant.role}</p>
                            </div>
                            <span className="text-xs text-slate-600">{participant.status.replaceAll("_", " ")}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs text-slate-500">{percent}%</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
