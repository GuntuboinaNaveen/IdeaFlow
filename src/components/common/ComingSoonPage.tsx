import { Badge } from "../ui/Badge";

interface ComingSoonPageProps {
    title: string;
}

export function ComingSoonPage({
    title,
}: ComingSoonPageProps) {
    return (
        <div className="space-y-3">
            <Badge variant="info">Foundation phase</Badge>

            <h1 className="text-2xl font-bold text-slate-900">
                {title}
            </h1>

            <p className="text-sm text-slate-500">
                This module will be implemented in an upcoming development phase.
            </p>
        </div>
    );
}