
import type {
    Idea,
    CreateIdeaInput,
    UpdateIdeaInput,
} from "../types/idea.types";
import { mockIdeas } from "../mockIdeas";
const STORAGE_KEY = "internal_ideas";

function readIdeas(): Idea[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        const parsed: unknown = JSON.parse(stored);

        return Array.isArray(parsed) ? (parsed as Idea[]) : [];
    } catch {
        return [];
    }
}

function saveIdeas(ideas: Idea[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function generateIdeaId(): string {
    return `IDEA-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;
}

export const ideaService = {
    initialize(): void {
        if (localStorage.getItem(STORAGE_KEY) === null) {
            saveIdeas(mockIdeas);
        }
    },
    getAll(): Idea[] {
        return readIdeas().sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    },

    getById(id: string): Idea | undefined {
        return readIdeas().find((idea) => idea.id === id);
    },

    create(
        input: CreateIdeaInput,
        user: { id: string; name: string; role: string }
    ): Idea {
        const ideas = readIdeas();
        const now = new Date().toISOString();

        const newIdea: Idea = {
            id: generateIdeaId(),
            ...input,
            status: "SUBMITTED",
            createdBy: user.id,
            createdByName: user.name,
            createdByRole: user.role,
            createdAt: now,
            updatedAt: now,
        };

        saveIdeas([...ideas, newIdea]);

        return newIdea;
    },

    update(id: string, input: UpdateIdeaInput): Idea {
        const ideas = readIdeas();
        const index = ideas.findIndex((idea) => idea.id === id);

        if (index === -1) {
            throw new Error("Idea not found.");
        }

        const existing = ideas[index];

        if (!existing) {
            throw new Error("Idea not found.");
        }

        if (
            existing.status === "CONVERTED_TO_TASK" ||
            existing.status === "REJECTED"
        ) {
            throw new Error("This idea can no longer be edited.");
        }

        const updated: Idea = {
            ...existing,
            ...input,
            updatedAt: new Date().toISOString(),
        };

        ideas[index] = updated;
        saveIdeas(ideas);

        return updated;
    },

    delete(id: string): void {
        const ideas = readIdeas();
        const filtered = ideas.filter((idea) => idea.id !== id);

        if (filtered.length === ideas.length) {
            throw new Error("Idea not found.");
        }

        saveIdeas(filtered);
    },


    markConvertedToTask(id: string, taskId: string): Idea {
        if (!taskId.trim()) {
            throw new Error("A task ID is required to convert an idea.");
        }

        const ideas = readIdeas();
        const index = ideas.findIndex((idea) => idea.id === id);

        if (index === -1) {
            throw new Error("Idea not found.");
        }

        const existing = ideas[index];

        if (!existing) {
            throw new Error("Idea not found.");
        }

        if (existing.status !== "ACCEPTED") {
            throw new Error("Only accepted ideas can be converted into tasks.");
        }

        if (existing.convertedTaskId) {
            throw new Error("This idea has already been converted into a task.");
        }

        const updated: Idea = {
            ...existing,
            status: "CONVERTED_TO_TASK",
            convertedTaskId: taskId,
            updatedAt: new Date().toISOString(),
        };

        ideas[index] = updated;
        saveIdeas(ideas);

        return updated;
    },

    updateStatus(
        id: string,
        status: Idea["status"],
        reviewer?: { id: string; comment?: string }
    ): Idea {
        const ideas = readIdeas();
        const index = ideas.findIndex((idea) => idea.id === id);

        if (index === -1) {
            throw new Error("Idea not found.");
        }

        const existing = ideas[index];

        if (!existing) {
            throw new Error("Idea not found.");
        }

        const allowedTransitions: Record<Idea["status"], Idea["status"][]> = {
            SUBMITTED: ["UNDER_REVIEW"],
            UNDER_REVIEW: ["ACCEPTED", "REJECTED"],
            // Conversion is handled by markConvertedToTask so the task ID is stored.
            ACCEPTED: [],
            REJECTED: [],
            CONVERTED_TO_TASK: [],
        };

        if (!allowedTransitions[existing.status].includes(status)) {
            throw new Error(
                `Cannot change idea status from ${existing.status} to ${status}.`
            );
        }

        if (
            (status === "UNDER_REVIEW" ||
                status === "ACCEPTED" ||
                status === "REJECTED") &&
            !reviewer
        ) {
            throw new Error("Reviewer information is required.");
        }

        const now = new Date().toISOString();

        const updated: Idea = {
            ...existing,
            status,
            updatedAt: now,
            ...(reviewer
                ? {
                    reviewedBy: reviewer.id,
                    reviewedAt: now,
                    reviewComment: reviewer.comment,
                }
                : {}),
        };

        ideas[index] = updated;
        saveIdeas(ideas);

        return updated;
    },

};
