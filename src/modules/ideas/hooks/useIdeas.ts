
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../constants/permissions";

import { ideaService } from "../services/ideaService";

import type {
    Idea,
    CreateIdeaInput,
    UpdateIdeaInput,
} from "../types/idea.types";

export function useIdeas() {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();

    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadIdeas() {
            try {
                const loadedIdeas =
                    await ideaService.initializeStorage();

                if (active) {
                    setIdeas(loadedIdeas);
                }
            } catch (error) {
                console.error("Unable to initialize ideas.", error);

                if (active) {
                    setIdeas(ideaService.getAll());
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadIdeas();

        return () => {
            active = false;
        };
    }, []);

    const refreshIdeas = useCallback(() => {
        setIdeas(ideaService.getAll());
    }, []);

    const createIdea = useCallback(
        (input: CreateIdeaInput) => {
            if (!user) {
                throw new Error("Please log in first.");
            }

            if (!hasPermission(PERMISSIONS.IDEA_CREATE)) {
                throw new Error(
                    "You do not have permission to create ideas."
                );
            }

            const idea = ideaService.create(input, {
                id: user.id,
                name: user.name,
                role: user.role,
            });

            refreshIdeas();
            return idea;
        },
        [user, hasPermission, refreshIdeas]
    );

    const updateIdea = useCallback(
        (id: string, input: UpdateIdeaInput) => {
            if (!user) {
                throw new Error("Please log in first.");
            }

            if (!hasPermission(PERMISSIONS.IDEA_UPDATE)) {
                throw new Error(
                    "You do not have permission to update ideas."
                );
            }

            const existing = ideaService.getById(id);

            if (!existing) {
                throw new Error("Idea not found.");
            }

            if (existing.createdBy !== user.id) {
                throw new Error(
                    "You can only edit your own ideas."
                );
            }

            const updated = ideaService.update(id, input);

            refreshIdeas();
            return updated;
        },
        [user, hasPermission, refreshIdeas]
    );

    const deleteIdea = useCallback(
        (id: string) => {
            if (!user) {
                throw new Error("Please log in first.");
            }

            if (!hasPermission(PERMISSIONS.IDEA_DELETE)) {
                throw new Error(
                    "You do not have permission to delete ideas."
                );
            }

            const existing = ideaService.getById(id);

            if (!existing) {
                throw new Error("Idea not found.");
            }

            if (existing.createdBy !== user.id) {
                throw new Error(
                    "You can only delete your own ideas."
                );
            }

            ideaService.delete(id);
            refreshIdeas();
        },
        [user, hasPermission, refreshIdeas]
    );

    const reviewIdea = useCallback(
        (
            id: string,
            status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED",
            comment: string
        ) => {
            if (!user) {
                throw new Error("Please log in first.");
            }

            if (!hasPermission(PERMISSIONS.IDEA_REVIEW)) {
                throw new Error(
                    "You do not have permission to review ideas."
                );
            }

            const existing = ideaService.getById(id);

            if (!existing) {
                throw new Error("Idea not found.");
            }

            if (
                status === "UNDER_REVIEW" &&
                existing.status !== "SUBMITTED"
            ) {
                throw new Error(
                    "Only submitted ideas can enter review."
                );
            }

            if (
                (status === "ACCEPTED" || status === "REJECTED") &&
                existing.status !== "UNDER_REVIEW"
            ) {
                throw new Error(
                    "Only ideas under review can be decided."
                );
            }

            if (
                (status === "ACCEPTED" || status === "REJECTED") &&
                !comment.trim()
            ) {
                throw new Error(
                    "Please provide a review comment."
                );
            }

            const updated = ideaService.updateStatus(id, status, {
                id: user.id,
                comment: comment.trim(),
            });

            refreshIdeas();
            return updated;
        },
        [user, hasPermission, refreshIdeas]
    );

    const markIdeaConvertedToTask = useCallback(
        (ideaId: string, taskId: string) => {
            const updated = ideaService.markConvertedToTask(
                ideaId,
                taskId
            );

            refreshIdeas();
            return updated;
        },
        [refreshIdeas]
    );

    return {
        ideas,
        isLoading,
        refreshIdeas,
        markIdeaConvertedToTask,
        createIdea,
        updateIdea,
        deleteIdea,
        reviewIdea,
    };
}
