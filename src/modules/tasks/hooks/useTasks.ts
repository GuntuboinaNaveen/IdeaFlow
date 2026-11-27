
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../constants/permissions";

import usersData from "../../../mock-data/users.json";

import { taskService } from "../services/taskService";
import { ideaService } from "../../ideas/services/ideaService";

import type { MockUser } from "../../auth/types/auth.types";
import type {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
} from "../types/task.types";

const mockUsers = usersData as MockUser[];

function getParticipantProfiles(userIds: string[]) {
    return userIds.map((id) => {
        const user = mockUsers.find((item) => item.id === id);

        if (!user || user.status !== "ACTIVE") {
            throw new Error(`Active user not found: ${id}`);
        }

        return {
            id: user.id,
            name: user.name,
            role: user.role,
        };
    });
}

export function useTasks() {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();

    const [tasks, setTasks] = useState<Task[]>(() =>
        taskService.getAll()
    );

    // Load data/tasks.json on module startup. localStorage remains a fast
    // browser cache/fallback, while the physical JSON file is the dev source.
    useEffect(() => {
        let active = true;

        void taskService.initializeStorage().then((loadedTasks) => {
            if (active) setTasks(loadedTasks);
        });

        return () => {
            active = false;
        };
    }, []);

    const refreshTasks = useCallback(() => {
        setTasks(taskService.getAll());
    }, []);

    const createTask = useCallback(
        (input: CreateTaskInput) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.TASK_CREATE)) {
                throw new Error("You do not have permission to create tasks.");
            }

            if (!input.title.trim() || !input.description.trim()) {
                throw new Error("Task title and description are required.");
            }

            if (input.title.trim().length > 150) {
                throw new Error("Task title cannot exceed 150 characters.");
            }

            if (input.description.trim().length < 10 ||
                input.description.trim().length > 3000) {
                throw new Error("Task description must be between 10 and 3000 characters.");
            }

            if (input.dueDate && input.startDate &&
                input.dueDate < input.startDate) {
                throw new Error("Due date cannot be earlier than start date.");
            }

            if (input.sourceIdeaId) {
                const sourceIdea = ideaService.getById(input.sourceIdeaId);

                if (!sourceIdea) {
                    throw new Error("The source idea could not be found.");
                }

                if (sourceIdea.status !== "ACCEPTED") {
                    throw new Error("Only accepted ideas can be converted into tasks.");
                }

                if (sourceIdea.convertedTaskId) {
                    throw new Error("This idea has already been converted into a task.");
                }
            }

            const profiles = getParticipantProfiles([...new Set(input.participantIds)]);

            const task = taskService.create(
                input,
                { id: user.id, name: user.name, role: user.role },
                profiles
            );

            if (input.sourceIdeaId) {
                try {
                    ideaService.markConvertedToTask(input.sourceIdeaId, task.id);
                } catch (error) {
                    // Roll back the newly created task if the idea cannot be marked
                    // as converted, preventing an orphaned duplicate task.
                    taskService.removeUnstartedTask(task.id, user.id);
                    throw error;
                }
            }

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const updateTask = useCallback(
        (id: string, input: UpdateTaskInput) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.TASK_UPDATE)) {
                throw new Error("You do not have permission to update tasks.");
            }

            const existing = taskService.getById(id);

            if (!existing) throw new Error("Task not found.");

            const isCreator = existing.createdBy === user.id;
            const isParticipant = existing.participants.some(
                (item) => item.userId === user.id
            );

            if (!isCreator && !isParticipant) {
                throw new Error("You cannot edit this task.");
            }

            if (isParticipant && !isCreator) {
                throw new Error("Only the task creator can change task assignments and details.");
            }

            const profiles = getParticipantProfiles(input.participantIds);
            const task = taskService.update(id, input, profiles);

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const pickupTask = useCallback(
        (id: string) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.TASK_PICKUP)) {
                throw new Error("You do not have permission to pick up tasks.");
            }

            const task = taskService.pickup(id, {
                id: user.id,
                name: user.name,
                role: user.role,
            });

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const addSharedChecklistItem = useCallback(
        (id: string, title: string, required = true) => {
            if (!user) throw new Error("Please log in first.");
            const existing = taskService.getById(id);
            if (!existing) throw new Error("Task not found.");
            const canManageSharedChecklist =
                existing.createdBy === user.id ||
                hasPermission(PERMISSIONS.TASK_REACTIVATE);
            if (!canManageSharedChecklist) {
                throw new Error("You do not have permission to add shared checklist items.");
            }
            if (existing.status === "COMPLETED" && !hasPermission(PERMISSIONS.TASK_REACTIVATE)) {
                throw new Error("You do not have permission to reopen completed tasks.");
            }
            const task = taskService.addSharedChecklistItem(
                id,
                { id: user.id, name: user.name, role: user.role },
                title,
                required
            );
            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const addPersonalChecklistItem = useCallback(
        (id: string, title: string) => {
            if (!user) throw new Error("Please log in first.");
            if (!hasPermission(PERMISSIONS.CHECKLIST_UPDATE)) {
                throw new Error("You cannot add checklist items.");
            }
            const task = taskService.addPersonalChecklistItem(id, user.id, title);
            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const joinAsCreator = useCallback(
        (id: string) => {
            if (!user) throw new Error("Please log in first.");
            const existing = taskService.getById(id);
            if (!existing) throw new Error("Task not found.");
            if (existing.createdBy !== user.id) {
                throw new Error("Only the task creator can join automatically.");
            }
            const task = taskService.joinAsCreator(id, {
                id: user.id,
                name: user.name,
                role: user.role,
            });
            refreshTasks();
            return task;
        },
        [user, refreshTasks]
    );

    const requestToJoinTask = useCallback(
        (id: string) => {
            if (!user) throw new Error("Please log in first.");
            if (!hasPermission(PERMISSIONS.TASK_PICKUP)) {
                throw new Error("You do not have permission to request joining tasks.");
            }
            const task = taskService.requestToJoin(id, {
                id: user.id,
                name: user.name,
                role: user.role,
            });
            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const reviewJoinRequest = useCallback(
        (taskId: string, requestId: string, decision: "APPROVED" | "REJECTED", comment = "") => {
            if (!user) throw new Error("Please log in first.");
            const existing = taskService.getById(taskId);
            if (!existing) throw new Error("Task not found.");
            if (existing.createdBy !== user.id && user.role !== "CEO") {
                throw new Error("Only the task creator or CEO can review join requests.");
            }
            const task = taskService.reviewJoinRequest(
                taskId,
                requestId,
                { id: user.id, name: user.name, role: user.role },
                decision,
                comment
            );
            refreshTasks();
            return task;
        },
        [user, refreshTasks]
    );

    const updateChecklistItem = useCallback(
        (id: string, templateId: string, completed: boolean) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.CHECKLIST_UPDATE)) {
                throw new Error("You cannot update checklist items.");
            }

            const task = taskService.updateChecklistItem(
                id,
                user.id,
                templateId,
                completed
            );

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const submitMyWork = useCallback(
        (id: string) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.CHECKLIST_COMPLETE)) {
                throw new Error("You cannot submit checklist work.");
            }

            const task = taskService.submitParticipantWork(id, user.id);

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const reviewTask = useCallback(
        (id: string, decision: "APPROVED" | "CHANGES_REQUESTED", comment: string) => {
            if (!user) throw new Error("Please log in first.");

            const permission =
                decision === "APPROVED"
                    ? PERMISSIONS.REVIEW_APPROVE
                    : PERMISSIONS.REVIEW_REQUEST_CHANGES;

            if (!hasPermission(permission)) {
                throw new Error("You do not have permission to review tasks.");
            }

            const task = taskService.review(
                id,
                { id: user.id, name: user.name, role: user.role },
                decision,
                comment
            );

            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const cancelTask = useCallback(
        (id: string) => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.TASK_CANCEL)) {
                throw new Error("You do not have permission to cancel tasks.");
            }

            const existing = taskService.getById(id);

            if (!existing) throw new Error("Task not found.");

            if (existing.createdBy !== user.id) {
                throw new Error("Only the task creator can cancel this task.");
            }

            const task = taskService.cancel(id);
            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    const reactivateTask = useCallback(
        (id: string, reason = "Task reopened for additional work.") => {
            if (!user) throw new Error("Please log in first.");

            if (!hasPermission(PERMISSIONS.TASK_REACTIVATE)) {
                throw new Error("You do not have permission to reactivate tasks.");
            }

            const existing = taskService.getById(id);
            if (!existing) throw new Error("Task not found.");

            const task = taskService.reactivate(
                id,
                { id: user.id, name: user.name, role: user.role },
                reason
            );
            refreshTasks();
            return task;
        },
        [user, hasPermission, refreshTasks]
    );

    return {
        tasks,
        refreshTasks,
        createTask,
        updateTask,
        pickupTask,
        updateChecklistItem,
        addPersonalChecklistItem,
        addSharedChecklistItem,
        joinAsCreator,
        requestToJoinTask,
        reviewJoinRequest,
        submitMyWork,
        reviewTask,
        cancelTask,
        reactivateTask,
    };
}
