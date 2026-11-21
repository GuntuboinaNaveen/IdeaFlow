
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import TaskStatusBadge from "../components/TaskStatusBadge";

export default function MyTasksPage() {
    const { user } = useAuth();
    const { tasks } = useTasks();

    const myTasks = tasks.filter(
        (task) =>
            task.createdBy === user?.id ||
            task.participants.some(
                (participant) => participant.userId === user?.id
            )
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Tasks you created or are assigned to.
                </p>
            </div>

            <div className="space-y-3">
                {myTasks.map((task) => (
                    <Link
                        key={task.id}
                        to={`/tasks/${task.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300"
                    >
                        <div>
                            <h2 className="font-medium text-slate-900">{task.title}</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {task.id} · {task.priority} · {task.participants.length} participants
                            </p>
                        </div>
                        <TaskStatusBadge status={task.status} />
                    </Link>
                ))}

                {myTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                        You have no tasks yet.
                    </div>
                )}
            </div>
        </div>
    );
}
