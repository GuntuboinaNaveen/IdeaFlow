
import { useState } from "react";
import type { FormEvent } from "react";
import type { MockUser } from "../../auth/types/auth.types";
import type { CreateTaskInput, TaskPriority } from "../types/task.types";


interface TaskFormProps {
    users: MockUser[];
    initialValues?: Partial<CreateTaskInput>;
    submitLabel?: string;
    onSubmit: (input: CreateTaskInput) => void;
    onCancel?: () => void;
}

export default function TaskForm({
    users,
    initialValues,
    submitLabel = "Create Task",
    onSubmit,
    onCancel,
}: TaskFormProps) {
    const [title, setTitle] = useState(initialValues?.title ?? "");
    const [description, setDescription] = useState(
        initialValues?.description ?? ""
    );
    const [priority, setPriority] = useState<TaskPriority>(
        initialValues?.priority ?? "MEDIUM"
    );
    const [participantIds, setParticipantIds] = useState<string[]>(
        initialValues?.participantIds ?? []
    );
    const [startDate, setStartDate] = useState(
        initialValues?.startDate ?? ""
    );
    const [dueDate, setDueDate] = useState(
        initialValues?.dueDate ?? ""
    );
    const [checklist, setChecklist] = useState<
        Array<{ title: string; required: boolean }>
    >(
        initialValues?.checklistTemplate?.map((item) => ({
            title: item.title,
            required: item.required,
        })) ?? [{ title: "", required: true }]
    );
    const [error, setError] = useState("");

    function toggleParticipant(userId: string) {
        setParticipantIds((current) =>
            current.includes(userId)
                ? current.filter((id) => id !== userId)
                : [...current, userId]
        );
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (dueDate && startDate && dueDate < startDate) {
            setError("Due date cannot be earlier than start date.");
            return;
        }

        const validChecklist = checklist.filter(
            (item) => item.title.trim()
        );

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            priority,
            participantIds,
            checklistTemplate: validChecklist.map((item) => ({
                title: item.title.trim(),
                required: item.required,
            })),
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            sourceIdeaId: initialValues?.sourceIdeaId,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
        >
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Task title *
                </label>
                <input
                    required
                    maxLength={150}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="Enter task title"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description *
                </label>
                <textarea
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    placeholder="Describe the task and expected outcome"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Priority
                    </label>
                    <select
                        value={priority}
                        onChange={(event) =>
                            setPriority(event.target.value as TaskPriority)
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Start date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Due date
                    </label>
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
                <h2 className="mb-3 text-sm font-semibold text-slate-800">
                    Assign participants
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                    {users
                        .filter((item) => item.status === "ACTIVE")
                        .map((item) => (
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
                                <span className="text-xs text-slate-500">
                                    {item.role}
                                </span>
                            </label>
                        ))}
                </div>
            </div>

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">
                        Checklist template
                    </h2>
                    <button
                        type="button"
                        onClick={() =>
                            setChecklist((current) => [
                                ...current,
                                { title: "", required: true },
                            ])
                        }
                        className="text-sm font-medium text-indigo-600"
                    >
                        + Add item
                    </button>
                </div>

                <div className="space-y-2">
                    {checklist.map((item, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                value={item.title}
                                onChange={(event) =>
                                    setChecklist((current) =>
                                        current.map((entry, entryIndex) =>
                                            entryIndex === index
                                                ? { ...entry, title: event.target.value }
                                                : entry
                                        )
                                    )
                                }
                                placeholder={`Checklist item ${index + 1}`}
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />

                            <label className="flex items-center gap-1 text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={item.required}
                                    onChange={(event) =>
                                        setChecklist((current) =>
                                            current.map((entry, entryIndex) =>
                                                entryIndex === index
                                                    ? { ...entry, required: event.target.checked }
                                                    : entry
                                            )
                                        )
                                    }
                                />
                                Required
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    setChecklist((current) =>
                                        current.filter((_, entryIndex) => entryIndex !== index)
                                    )
                                }
                                className="px-2 text-sm text-red-600"
                                aria-label={`Remove checklist item ${index + 1}`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
