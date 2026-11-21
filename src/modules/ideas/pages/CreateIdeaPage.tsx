
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIdeas } from "../hooks/useIdeas";
import type {
    CreateIdeaInput,
    IdeaCategory,
    IdeaPriority,
} from "../types/idea.types";

export default function CreateIdeaPage() {
    const navigate = useNavigate();
    const { createIdea } = useIdeas();

    const [form, setForm] = useState<CreateIdeaInput>({
        title: "",
        description: "",
        category: "OTHER",
        priority: "MEDIUM",
    });

    const [error, setError] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            const idea = createIdea(form);
            navigate(`/ideas/${idea.id}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to submit idea."
            );
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link
                to="/ideas"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
            >
                <ArrowLeft size={16} />
                Back to Ideas
            </Link>

            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Submit an Idea
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Describe your idea and how it could help the organization.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
            >
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Idea Title *
                    </label>
                    <input
                        required
                        maxLength={150}
                        value={form.title}
                        onChange={(event) =>
                            setForm({ ...form, title: event.target.value })
                        }
                        placeholder="Enter a clear title"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Description *
                    </label>
                    <textarea
                        required
                        minLength={10}
                        rows={5}
                        maxLength={3000}
                        value={form.description}
                        onChange={(event) =>
                            setForm({ ...form, description: event.target.value })
                        }
                        placeholder="Explain the problem, your proposed solution and expected benefit..."
                        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    category: event.target.value as IdeaCategory,
                                })
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        >
                            <option value="PROCESS_IMPROVEMENT">Process Improvement</option>
                            <option value="PRODUCT">Product</option>
                            <option value="TECHNOLOGY">Technology</option>
                            <option value="COST_SAVING">Cost Saving</option>
                            <option value="CUSTOMER_EXPERIENCE">Customer Experience</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Priority
                        </label>
                        <select
                            value={form.priority}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    priority: event.target.value as IdeaPriority,
                                })
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <Link
                        to="/ideas"
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Submit Idea
                    </button>
                </div>
            </form>
        </div>
    );
}
