
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import usersData from "../../../mock-data/users.json";
import type { MockUser } from "../../auth/types/auth.types";
import { ideaService } from "../../ideas/services/ideaService";
import { useTasks } from "../hooks/useTasks";
import type { CreateTaskInput } from "../types/task.types";

const users = usersData as MockUser[];

export default function CreateTaskPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sourceIdeaId = searchParams.get("ideaId") ?? undefined;

    const sourceIdea = sourceIdeaId
        ? ideaService.getById(sourceIdeaId)
        : undefined;

    const { createTask } = useTasks();

    const [title, setTitle] = useState(sourceIdea?.title ?? "");
    const [description, setDescription] = useState(
        sourceIdea?.description ?? ""
    );
    const [priority, setPriority] =
        useState<CreateTaskInput["priority"]>("MEDIUM");
    const [participantIds, setParticipantIds] = useState<string[]>([]);
    const [checklist, setChecklist] = useState<
        Array<{ title: string; required: boolean }>
    >([{ title: "", required: true }]);
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");

    if (sourceIdeaId && !sourceIdea) {
        return <p className="text-sm text-red-600">Source idea not found.</p>;
    }

    if (
        sourceIdea &&
        sourceIdea.status !== "ACCEPTED"
    ) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="font-medium text-slate-800">
                    Only accepted ideas can be converted into tasks.
                </p>
                <Link to={`/ideas/${sourceIdea.id}`} className="mt-3 inline-block text-indigo-600">
                    Return to idea
                </Link>
            </div>
        );
    }

    function toggleParticipant(id: string) {
        setParticipantIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    }

    function updateChecklist(
        index: number,
        value: string
    ) {
        setChecklist((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, title: value } : item
            )
        );
    }

    function updateChecklistRequired(index: number, required: boolean) {
        setChecklist((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, required } : item
            )
        );
    }

    function addChecklistItem() {
        setChecklist((current) => [
            ...current,
            { title: "", required: true },
        ]);
    }

    function removeChecklistItem(index: number) {
        setChecklist((current) =>
            current.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            if (sourceIdea && sourceIdea.status !== "ACCEPTED") {
                throw new Error("This idea is no longer available for conversion.");
            }

            const validChecklist = checklist.filter(
                (item) => item.title.trim()
            );

            const input: CreateTaskInput = {
                title,
                description,
                priority,
                participantIds,
                checklistTemplate: validChecklist.map((item) => ({
                    title: item.title.trim(),
                    required: item.required,
                })),
                startDate: startDate || undefined,
                dueDate: dueDate || undefined,
                sourceIdeaId,
            };

            const task = createTask(input);
            navigate(`/tasks/${task.id}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create task."
            );
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link to="/tasks" className="text-sm text-slate-500 hover:text-indigo-600">
                ← Back to Tasks
            </Link>

            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    {sourceIdea ? "Convert Idea to Task" : "Create Task"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Define the task, participants and expected checklist.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
            >
                <div>
                    <label className="mb-2 block text-sm font-medium">Task title *</label>
                    <input
                        required
                        maxLength={150}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">Description *</label>
                    <textarea
                        required
                        minLength={10}
                        maxLength={3000}
                        rows={4}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">Priority</label>
                    <select
                        value={priority}
                        onChange={(event) =>
                            setPriority(event.target.value as CreateTaskInput["priority"])
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Start date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Due date</label>
                        <input
                            type="date"
                            min={startDate || undefined}
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="mb-3 font-semibold text-slate-900">
                        Assign participants
                    </h2>
                    <div className="space-y-2">
                        {users.filter((item) => item.status === "ACTIVE").map((item) => (
                            <label
                                key={item.id}
                                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={participantIds.includes(item.id)}
                                    onChange={() => toggleParticipant(item.id)}
                                />
                                <span className="flex-1">{item.name}</span>
                                <span className="text-xs text-slate-500">{item.role}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">
                            Checklist template
                        </h2>
                        <button
                            type="button"
                            onClick={addChecklistItem}
                            className="text-sm font-medium text-indigo-600"
                        >
                            + Add item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {checklist.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    value={item.title}
                                    onChange={(event) =>
                                        updateChecklist(index, event.target.value)
                                    }
                                    placeholder={`Checklist item ${index + 1}`}
                                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <label className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={item.required}
                                        onChange={(event) =>
                                            updateChecklistRequired(index, event.target.checked)
                                        }
                                    />
                                    Required
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeChecklistItem(index)}
                                    className="px-2 text-sm text-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Each participant receives their own checklist. Required items
                        must be completed before submitting work.
                    </p>
                </div>

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <Link to="/tasks" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white"
                    >
                        {sourceIdea ? "Create Task from Idea" : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
}
