
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Lightbulb } from "lucide-react";
import { useIdeas } from "../hooks/useIdeas";
import type { IdeaStatus } from "../types/idea.types";
import IdeaStatusBadge from "../components/IdeaStatusBadge";

const statusLabels: Record<IdeaStatus, string> = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    CONVERTED_TO_TASK: "Converted to Task",
};

export default function IdeasPage() {
    const { ideas, isLoading } = useIdeas();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    const filteredIdeas = useMemo(() => {
        return ideas.filter((idea) => {
            const matchesSearch =
                idea.title.toLowerCase().includes(search.toLowerCase()) ||
                idea.description.toLowerCase().includes(search.toLowerCase()) ||
                idea.createdByName.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                status === "ALL" || idea.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [ideas, search, status]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Idea Inbox
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Share, discover and track organization ideas.
                    </p>
                </div>

                <Link
                    to="/ideas/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <Plus size={18} />
                    Submit Idea
                </Link>
            </div>
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    Loading ideas...
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-60 flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search ideas..."
                                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="ALL">All statuses</option>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredIdeas.map((idea) => (
                            <Link
                                key={idea.id}
                                to={`/ideas/${idea.id}`}
                                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                        <Lightbulb size={20} />
                                    </div>

                                    <IdeaStatusBadge status={idea.status} />
                                </div>

                                <h2 className="font-semibold text-slate-900">
                                    {idea.title}
                                </h2>

                                <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                                    {idea.description}
                                </p>

                                <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                    <p>Submitted by {idea.createdByName}</p>
                                    <p className="mt-1">
                                        {new Date(idea.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredIdeas.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <Lightbulb className="mx-auto text-slate-400" size={32} />
                            <p className="mt-3 font-medium text-slate-700">
                                No ideas found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your search or filter.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );

}
