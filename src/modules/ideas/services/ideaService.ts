
import type {
    Idea,
    CreateIdeaInput,
    UpdateIdeaInput,
} from "../types/idea.types";

import { mockIdeas } from "../mockIdeas";

const STORAGE_KEY = "internal_ideas";
const API_URL = "/api/ideas";

type IdeaUser = {
    id: string;
    name: string;
    role: string;
};

type IdeaReviewer = {
    id: string;
    comment?: string;
};

type IdeaFileResponse = {
    exists: boolean;
    ideas: Idea[];
};

function normalizeTitle(title: string): string {
    return title
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase();
}

/**
 * Remove duplicate ideas using normalized titles.
 * Keep the most recently updated record.
 */
function removeDuplicateIdeas(ideas: Idea[]): Idea[] {
    const unique = new Map<string, Idea>();

    for (const idea of ideas) {
        const key = normalizeTitle(idea.title);
        const existing = unique.get(key);

        if (!existing) {
            unique.set(key, idea);
            continue;
        }

        const existingDate = new Date(existing.updatedAt).getTime();
        const currentDate = new Date(idea.updatedAt).getTime();

        if (currentDate > existingDate) {
            unique.set(key, idea);
        }
    }

    return Array.from(unique.values());
}

function readIdeas(): Idea[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        const parsed: unknown = JSON.parse(stored);

        if (!Array.isArray(parsed)) return [];

        return parsed as Idea[];
    } catch {
        return [];
    }
}

let fileWriteQueue: Promise<void> = Promise.resolve();

function saveIdeas(ideas: Idea[]): void {
    const uniqueIdeas = removeDuplicateIdeas(ideas);
    const serialized = JSON.stringify(uniqueIdeas, null, 2);

    // Save immediately to browser storage.
    localStorage.setItem(STORAGE_KEY, serialized);

    // Persist to physical data/ideas.json.
    fileWriteQueue = fileWriteQueue
        .then(async () => {
            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: serialized,
            });

            if (!response.ok) {
                throw new Error(
                    `Idea JSON persistence failed (${response.status}).`
                );
            }
        })
        .catch((error: unknown) => {
            console.error(
                "Unable to save ideas to data/ideas.json. Browser storage was updated.",
                error
            );
        });
}

async function initializeIdeaStorage(): Promise<Idea[]> {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(
                `Idea JSON load failed (${response.status}).`
            );
        }

        const result = (await response.json()) as IdeaFileResponse;

        // Physical JSON already exists.
        if (result.exists) {
            const ideas = removeDuplicateIdeas(
                Array.isArray(result.ideas) ? result.ideas : []
            );

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(ideas)
            );

            // Rewrite file if duplicate records were removed.
            if (ideas.length !== result.ideas.length) {
                saveIdeas(ideas);
                await fileWriteQueue;
            }

            return ideas;
        }

        // JSON does not exist: migrate existing browser data first.
        const browserIdeas = readIdeas();

        const initialIdeas = removeDuplicateIdeas(
            browserIdeas.length > 0 ? browserIdeas : mockIdeas
        );

        saveIdeas(initialIdeas);
        await fileWriteQueue;

        return initialIdeas;
    } catch (error) {
        console.error(
            "Could not connect to the ideas JSON API. Using localStorage fallback.",
            error
        );

        const browserIdeas = readIdeas();

        if (browserIdeas.length > 0) {
            return removeDuplicateIdeas(browserIdeas);
        }

        return removeDuplicateIdeas(mockIdeas);
    }
}

function generateIdeaId(): string {
    return `IDEA-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;
}

function ensureUniqueTitle(
    ideas: Idea[],
    title: string,
    excludeId?: string
): void {
    const normalized = normalizeTitle(title);

    if (!normalized) {
        throw new Error("Idea title is required.");
    }

    const duplicate = ideas.find(
        (idea) =>
            idea.id !== excludeId &&
            normalizeTitle(idea.title) === normalized
    );

    if (duplicate) {
        throw new Error(
            `An idea named "${duplicate.title}" already exists. Please use the existing idea instead of creating a duplicate.`
        );
    }
}

function getIdeaOrThrow(ideas: Idea[], id: string): Idea {
    const idea = ideas.find((item) => item.id === id);

    if (!idea) {
        throw new Error("Idea not found.");
    }

    return idea;
}

export const ideaService = {
    initializeStorage: initializeIdeaStorage,

    getAll(): Idea[] {
        return removeDuplicateIdeas(readIdeas()).sort(
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
        user: IdeaUser
    ): Idea {
        const ideas = readIdeas();

        ensureUniqueTitle(ideas, input.title);

        const now = new Date().toISOString();

        const newIdea: Idea = {
            id: generateIdeaId(),
            ...input,
            title: input.title.trim(),
            description: input.description.trim(),
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
        const existing = getIdeaOrThrow(ideas, id);

        if (
            existing.status === "CONVERTED_TO_TASK" ||
            existing.status === "REJECTED"
        ) {
            throw new Error("This idea can no longer be edited.");
        }

        ensureUniqueTitle(ideas, input.title, id);

        const updated: Idea = {
            ...existing,
            ...input,
            title: input.title.trim(),
            description: input.description.trim(),
            updatedAt: new Date().toISOString(),
        };

        const updatedIdeas = ideas.map((idea) =>
            idea.id === id ? updated : idea
        );

        saveIdeas(updatedIdeas);

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
            throw new Error("A task ID is required.");
        }

        const ideas = readIdeas();
        const existing = getIdeaOrThrow(ideas, id);

        if (existing.status !== "ACCEPTED") {
            throw new Error(
                "Only accepted ideas can be converted into tasks."
            );
        }

        if (existing.convertedTaskId) {
            throw new Error(
                "This idea has already been converted into a task."
            );
        }

        const updated: Idea = {
            ...existing,
            status: "CONVERTED_TO_TASK",
            convertedTaskId: taskId,
            updatedAt: new Date().toISOString(),
        };

        saveIdeas(
            ideas.map((idea) =>
                idea.id === id ? updated : idea
            )
        );

        return updated;
    },

    updateStatus(
        id: string,
        status: Idea["status"],
        reviewer?: IdeaReviewer
    ): Idea {
        const ideas = readIdeas();
        const existing = getIdeaOrThrow(ideas, id);

        const allowedTransitions: Record<
            Idea["status"],
            Idea["status"][]
        > = {
            SUBMITTED: ["UNDER_REVIEW"],
            UNDER_REVIEW: ["ACCEPTED", "REJECTED"],
            ACCEPTED: [],
            REJECTED: [],
            CONVERTED_TO_TASK: [],
        };

        if (!allowedTransitions[existing.status].includes(status)) {
            throw new Error(
                `Cannot change idea status from ${existing.status} to ${status}.`
            );
        }

        if (!reviewer) {
            throw new Error("Reviewer information is required.");
        }

        if (
            (status === "ACCEPTED" || status === "REJECTED") &&
            !reviewer.comment?.trim()
        ) {
            throw new Error("A review comment is required.");
        }

        const now = new Date().toISOString();

        const updated: Idea = {
            ...existing,
            status,
            updatedAt: now,
            reviewedBy: reviewer.id,
            reviewedAt: now,
            reviewComment: reviewer.comment?.trim(),
        };

        saveIdeas(
            ideas.map((idea) =>
                idea.id === id ? updated : idea
            )
        );

        return updated;
    },
};
