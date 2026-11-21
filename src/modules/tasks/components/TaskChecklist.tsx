import { useState } from "react";
import type {
    TaskChecklistTemplate,
    ParticipantChecklistItem,
} from "../types/task.types";

interface TaskChecklistProps {
    templates: TaskChecklistTemplate[];
    checklist: ParticipantChecklistItem[];
    disabled?: boolean;
    onToggle: (templateId: string, completed: boolean) => void;
    onAddPersonalItem: (title: string) => void;
    onSubmit?: () => void;
    title?: string;
    readOnlyNote?: string;
}

export default function TaskChecklist({
    templates,
    checklist,
    disabled = false,
    onToggle,
    onAddPersonalItem,
    onSubmit,
    title = "My Checklist",
    readOnlyNote,
}: TaskChecklistProps) {
    const [newItemTitle, setNewItemTitle] = useState("");

    const completedCount = checklist.filter((item) => item.completed).length;
    const totalCount = checklist.length;
    const progress = totalCount === 0
        ? 0
        : Math.round((completedCount / totalCount) * 100);

    const requiredTemplateItemsComplete = templates
        .filter((template) => template.required)
        .every((template) => checklist.some(
            (item) => item.templateId === template.id && item.completed
        ));
    const requiredPersonalItemsComplete = checklist
        .filter((item) => item.isPersonal && item.required !== false)
        .every((item) => item.completed);
    const requiredComplete = requiredTemplateItemsComplete && requiredPersonalItemsComplete;

    function addPersonalItem() {
        const title = newItemTitle.trim();
        if (!title || disabled) return;
        onAddPersonalItem(title);
        setNewItemTitle("");
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        {completedCount} of {totalCount} items completed
                    </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-5 space-y-3">
                {templates.map((template) => {
                    const item = checklist.find((entry) => entry.templateId === template.id);
                    return (
                        <label key={template.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                            <input
                                type="checkbox"
                                checked={item?.completed ?? false}
                                disabled={disabled}
                                onChange={(event) => onToggle(template.id, event.target.checked)}
                                className="mt-1"
                            />
                            <span className="min-w-0 flex-1">
                                <span className={`block text-sm font-medium ${item?.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                    {template.title}
                                </span>
                                {template.description && <span className="mt-1 block text-xs text-slate-500">{template.description}</span>}
                                <span className="mt-1 block text-xs text-slate-400">{template.required ? "Required" : "Optional"}</span>
                            </span>
                        </label>
                    );
                })}

                {checklist.filter((item) => item.isPersonal).map((item) => (
                    <label key={item.templateId} className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
                        <input
                            type="checkbox"
                            checked={item.completed}
                            disabled={disabled}
                            onChange={(event) => onToggle(item.templateId, event.target.checked)}
                            className="mt-1"
                        />
                        <span className="min-w-0 flex-1">
                            <span className={`block text-sm font-medium ${item.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                {item.title}
                            </span>
                            <span className="mt-1 block text-xs text-indigo-700">My additional item · Required</span>
                        </span>
                    </label>
                ))}
            </div>

            {!disabled && (
            <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm font-medium text-slate-800">Add your own checklist item</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        value={newItemTitle}
                        onChange={(event) => setNewItemTitle(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                addPersonalItem();
                            }
                        }}
                        maxLength={200}
                        disabled={disabled}
                        placeholder="e.g. Prepare the supporting document"
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
                    />
                    <button
                        type="button"
                        onClick={addPersonalItem}
                        disabled={disabled || !newItemTitle.trim()}
                        className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Add item
                    </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">These items belong only to your personal checklist and do not change other participants' checklists.</p>
            </div>
            )}
            {disabled && readOnlyNote && (
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{readOnlyNote}</p>
            )}

            {onSubmit && (
                <button
                    type="button"
                    disabled={disabled || !requiredComplete}
                    onClick={onSubmit}
                    className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Submit My Work
                </button>
            )}

            {!requiredComplete && (
                <p className="mt-2 text-xs text-slate-500">Complete all required items before submitting.</p>
            )}
        </section>
    );
}
