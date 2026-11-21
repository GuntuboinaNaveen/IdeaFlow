
type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, string> = {
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    neutral: "bg-slate-100 text-slate-600",
};

export function Badge({
    children,
    variant = "neutral",
}: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
        >
            {children}
        </span>
    );
}
