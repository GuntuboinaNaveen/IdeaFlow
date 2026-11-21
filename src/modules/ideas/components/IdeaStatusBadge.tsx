
import type { IdeaStatus } from "../types/idea.types";

interface IdeaStatusBadgeProps {
    status: IdeaStatus;
}

const statusConfig: Record<
    IdeaStatus,
    { label: string; className: string }
> = {
    SUBMITTED: {
        label: "Submitted",
        className: "bg-blue-50 text-blue-700",
    },
    UNDER_REVIEW: {
        label: "Under Review",
        className: "bg-amber-50 text-amber-700",
    },
    ACCEPTED: {
        label: "Accepted",
        className: "bg-green-50 text-green-700",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-50 text-red-700",
    },
    CONVERTED_TO_TASK: {
        label: "Converted to Task",
        className: "bg-violet-50 text-violet-700",
    },
};

export default function IdeaStatusBadge({
    status,
}: IdeaStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
