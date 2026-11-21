
import type {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    TaskParticipant,
    TaskJoinRequest,
} from "../types/task.types";

const STORAGE_KEY = "internal_tasks";

interface ParticipantProfile {
    id: string;
    name: string;
    role: string;
}

function readTasks(): Task[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed: unknown = JSON.parse(stored);
        return Array.isArray(parsed) ? (parsed as Task[]) : [];
    } catch {
        return [];
    }
}

let fileWriteQueue: Promise<void> = Promise.resolve();

/**
 * Saves immediately to localStorage for responsive UI, then persists the same
 * JSON document to the physical data/tasks.json file through the Vite dev API.
 * The queue preserves write order when several changes happen quickly.
 */
function saveTasks(tasks: Task[]): void {
    const serialized = JSON.stringify(tasks, null, 2);
    localStorage.setItem(STORAGE_KEY, serialized);

    fileWriteQueue = fileWriteQueue
        .then(async () => {
            const response = await fetch("/api/tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: serialized,
            });

            if (!response.ok) {
                throw new Error(`Task JSON persistence failed (${response.status}).`);
            }
        })
        .catch((error: unknown) => {
            console.error(
                "Unable to save tasks to data/tasks.json. Local browser storage was updated.",
                error
            );
        });
}

/**
 * Loads the physical JSON file when the task module starts.
 * If the file does not exist yet, the current browser data is migrated into it.
 */
async function initializeTaskStorage(): Promise<Task[]> {
    try {
        const response = await fetch("/api/tasks", { method: "GET" });
        if (!response.ok) {
            throw new Error(`Task JSON load failed (${response.status}).`);
        }

        const result = await response.json() as {
            exists: boolean;
            tasks: Task[];
        };

        if (result.exists) {
            const tasks = Array.isArray(result.tasks) ? result.tasks : [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            return tasks;
        }

        const existingBrowserTasks = readTasks();
        saveTasks(existingBrowserTasks);
        await fileWriteQueue;
        return existingBrowserTasks;
    } catch (error) {
        console.error(
            "Could not connect to the local task.json API. Continuing with localStorage.",
            error
        );
        return readTasks();
    }
}

function generateTaskId(): string {
    return `TASK-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;
}

function createParticipants(
    profiles: ParticipantProfile[],
    checklistTemplate: Task["checklistTemplate"]
): TaskParticipant[] {
    const now = new Date().toISOString();

    return profiles.map((profile) => ({
        userId: profile.id,
        userName: profile.name,
        role: profile.role,
        status: "ASSIGNED",
        assignedAt: now,
        checklist: checklistTemplate.map((item) => ({
            templateId: item.id,
            completed: false,
        })),
    }));
}

function getTaskOrThrow(tasks: Task[], id: string): Task {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
        throw new Error("Task not found.");
    }

    return task;
}

export const taskService = {
    initializeStorage: initializeTaskStorage,

    getAll(): Task[] {
        return readTasks().sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    },

    getById(id: string): Task | undefined {
        return readTasks().find((task) => task.id === id);
    },

    create(
        input: CreateTaskInput,
        creator: ParticipantProfile,
        participantProfiles: ParticipantProfile[]
    ): Task {
        const tasks = readTasks();

        const checklistTemplate = input.checklistTemplate.map(
            (item, index) => ({
                id: `CHK-${Date.now()}-${index + 1}`,
                ...item,
            })
        );

        // The creator is not joined automatically. They can join later from
        // the task details page using the explicit "Join this task" action.
        const uniqueProfiles = [
            ...new Map(
                participantProfiles.map((profile) => [profile.id, profile])
            ).values(),
        ];

        const participants = createParticipants(
            uniqueProfiles,
            checklistTemplate
        );

        const now = new Date().toISOString();

        const task: Task = {
            id: generateTaskId(),
            title: input.title.trim(),
            description: input.description.trim(),
            priority: input.priority,
            status: participants.length > 0 ? "ASSIGNED" : "AVAILABLE",
            createdBy: creator.id,
            createdByName: creator.name,
            sourceIdeaId: input.sourceIdeaId,
            participants,
            joinRequests: [],
            checklistTemplate,
            startDate: input.startDate,
            dueDate: input.dueDate,
            createdAt: now,
            updatedAt: now,
        };

        saveTasks([...tasks, task]);

        return task;
    },

    removeUnstartedTask(id: string, creatorId: string): void {
        const tasks = readTasks();
        const task = tasks.find((item) => item.id === id);

        if (!task) return;

        if (task.createdBy !== creatorId) {
            throw new Error("You cannot remove this task.");
        }

        const hasStarted = task.status !== "AVAILABLE" &&
            task.status !== "ASSIGNED" ||
            task.participants.some((participant) =>
                participant.status !== "ASSIGNED" ||
                participant.checklist.some((item) => item.completed)
            );

        if (hasStarted) {
            throw new Error("A task with participant progress cannot be rolled back.");
        }

        saveTasks(tasks.filter((item) => item.id !== id));
    },

    update(
        id: string,
        input: UpdateTaskInput,
        participantProfiles: ParticipantProfile[]
    ): Task {
        const tasks = readTasks();
        const index = tasks.findIndex((task) => task.id === id);

        if (index === -1) {
            throw new Error("Task not found.");
        }

        const existing = tasks[index];

        if (!existing) {
            throw new Error("Task not found.");
        }

        if (
            existing.status === "COMPLETED" ||
            existing.status === "CANCELLED" ||
            existing.status === "IN_REVIEW"
        ) {
            throw new Error("This task cannot be edited in its current status.");
        }

        const uniqueProfiles = [
            ...new Map(
                participantProfiles.map((profile) => [profile.id, profile])
            ).values(),
        ];

        const selectedIds = uniqueProfiles.map((profile) => profile.id).sort();
        const currentIds = existing.participants
            .map((participant) => participant.userId)
            .sort();

        const assignmentsChanged =
            JSON.stringify(selectedIds) !== JSON.stringify(currentIds);

        const hasParticipantProgress = existing.participants.some(
            (participant) =>
                participant.status !== "ASSIGNED" ||
                participant.checklist.some((item) => item.completed)
        );

        const templatesChanged =
            JSON.stringify(
                input.checklistTemplate.map(({ id: templateId, title, description, required }) => ({
                    id: templateId,
                    title,
                    description,
                    required,
                }))
            ) !==
            JSON.stringify(
                existing.checklistTemplate.map(({ id: templateId, title, description, required }) => ({
                    id: templateId,
                    title,
                    description,
                    required,
                }))
            );

        if (hasParticipantProgress && (assignmentsChanged || templatesChanged)) {
            throw new Error(
                "Participants and checklist cannot be changed after work has started."
            );
        }

        const now = new Date().toISOString();
        const existingById = new Map(
            existing.participants.map((participant) => [
                participant.userId,
                participant,
            ])
        );

        const participants: TaskParticipant[] = uniqueProfiles.map((profile) => {
            const oldParticipant = existingById.get(profile.id);

            if (!oldParticipant) {
                return {
                    userId: profile.id,
                    userName: profile.name,
                    role: profile.role,
                    status: "ASSIGNED" as const,
                    checklist: input.checklistTemplate.map((template) => ({
                        templateId: template.id,
                        completed: false,
                    })),
                    assignedAt: now,
                };
            }

            const oldChecklistByTemplateId = new Map(
                oldParticipant.checklist.map((item) => [item.templateId, item])
            );

            return {
                ...oldParticipant,
                userName: profile.name,
                role: profile.role,
                checklist: input.checklistTemplate.map((template) => {
                    const oldItem = oldChecklistByTemplateId.get(template.id);
                    return oldItem ?? {
                        templateId: template.id,
                        completed: false,
                    };
                }),
            };
        });

        const updated: Task = {
            ...existing,
            title: input.title.trim(),
            description: input.description.trim(),
            priority: input.priority,
            participants,
            checklistTemplate: input.checklistTemplate,
            startDate: input.startDate,
            dueDate: input.dueDate,
            status:
                existing.status === "IN_PROGRESS"
                    ? "IN_PROGRESS"
                    : participants.length > 0
                        ? "ASSIGNED"
                        : "AVAILABLE",
            updatedAt: now,
        };

        tasks[index] = updated;
        saveTasks(tasks);

        return updated;
    },

    pickup(id: string, user: ParticipantProfile): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.status !== "AVAILABLE") {
            throw new Error("This task is not available for pickup.");
        }

        if (task.participants.some((p) => p.userId === user.id)) {
            throw new Error("You are already assigned to this task.");
        }

        const participant = createParticipants(
            [user],
            task.checklistTemplate
        )[0];

        if (!participant) {
            throw new Error("Unable to create participant.");
        }

        task.participants.push(participant);
        task.status = "ASSIGNED";
        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return task;
    },

    joinAsCreator(id: string, creator: ParticipantProfile): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.createdBy !== creator.id) {
            throw new Error("Only the task creator can join automatically.");
        }
        if (["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status)) {
            throw new Error("You cannot join this task in its current status.");
        }
        if (task.participants.some((participant) => participant.userId === creator.id)) {
            throw new Error("You are already a participant in this task.");
        }

        const participant = createParticipants([creator], task.checklistTemplate)[0];
        if (!participant) throw new Error("Unable to add the task creator.");

        task.participants.push(participant);
        if (task.status === "AVAILABLE") task.status = "ASSIGNED";
        task.updatedAt = new Date().toISOString();
        saveTasks(tasks);
        return task;
    },

    requestToJoin(id: string, user: ParticipantProfile): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status)) {
            throw new Error("This task is not accepting join requests.");
        }

        if (task.participants.some((participant) => participant.userId === user.id)) {
            throw new Error("You are already a participant in this task.");
        }

        const joinRequests = task.joinRequests ?? [];
        const existingRequest = joinRequests.find((request) => request.userId === user.id);

        if (existingRequest?.status === "PENDING") {
            throw new Error("Your request to join this task is already pending.");
        }

        if (existingRequest?.status === "APPROVED") {
            throw new Error("Your request has already been approved.");
        }

        const now = new Date().toISOString();
        const request: TaskJoinRequest = {
            id: `JOIN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            userId: user.id,
            userName: user.name,
            role: user.role,
            status: "PENDING",
            requestedAt: now,
        };

        task.joinRequests = [...joinRequests.filter((item) => item.userId !== user.id), request];
        task.updatedAt = now;
        saveTasks(tasks);
        return task;
    },

    reviewJoinRequest(
        id: string,
        requestId: string,
        reviewer: ParticipantProfile,
        decision: "APPROVED" | "REJECTED",
        comment = ""
    ): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.createdBy !== reviewer.id && reviewer.role !== "CEO") {
            throw new Error("Only the task creator or CEO can review join requests.");
        }

        if (["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status)) {
            throw new Error("Join requests cannot be reviewed in this task status.");
        }

        const request = (task.joinRequests ?? []).find((item) => item.id === requestId);
        if (!request || request.status !== "PENDING") {
            throw new Error("Pending join request not found.");
        }

        const now = new Date().toISOString();
        request.status = decision;
        request.reviewedAt = now;
        request.reviewedBy = reviewer.id;
        request.reviewedByName = reviewer.name;
        request.reviewComment = comment.trim() || undefined;

        if (decision === "APPROVED") {
            if (task.participants.some((participant) => participant.userId === request.userId)) {
                throw new Error("This user is already a participant.");
            }

            const participant = createParticipants(
                [{ id: request.userId, name: request.userName, role: request.role }],
                task.checklistTemplate
            )[0];

            if (!participant) {
                throw new Error("Unable to add the approved participant.");
            }

            task.participants.push(participant);
            if (task.status === "AVAILABLE") task.status = "ASSIGNED";
        }

        task.updatedAt = now;
        saveTasks(tasks);
        return task;
    },

    addSharedChecklistItem(
        id: string,
        creatorId: string,
        title: string,
        required = true
    ): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.createdBy !== creatorId) {
            throw new Error("Only the task creator can add shared checklist items.");
        }
        if (["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status)) {
            throw new Error("Shared checklist items cannot be added in this task status.");
        }

        const cleanTitle = title.trim();
        if (!cleanTitle) throw new Error("Checklist item title is required.");
        if (cleanTitle.length > 200) throw new Error("Checklist item cannot exceed 200 characters.");

        const now = new Date().toISOString();
        const template = {
            id: `CHK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            title: cleanTitle,
            required,
        };

        task.checklistTemplate.push(template);

        // The shared task item appears in every participant's checklist,
        // while completion remains individual to each participant.
        task.participants = task.participants.map((participant) => ({
            ...participant,
            checklist: [
                ...participant.checklist,
                { templateId: template.id, completed: false },
            ],
        }));

        task.updatedAt = now;
        saveTasks(tasks);
        return task;
    },

    addPersonalChecklistItem(
        id: string,
        userId: string,
        title: string
    ): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (["COMPLETED", "CANCELLED", "IN_REVIEW"].includes(task.status)) {
            throw new Error("Checklist items cannot be added in this task status.");
        }

        const participant = task.participants.find((item) => item.userId === userId);
        if (!participant) throw new Error("Only task participants can add personal checklist items.");
        if (["SUBMITTED", "APPROVED"].includes(participant.status)) {
            throw new Error("You have already submitted your work.");
        }

        const cleanTitle = title.trim();
        if (!cleanTitle) throw new Error("Checklist item title is required.");
        if (cleanTitle.length > 200) throw new Error("Checklist item cannot exceed 200 characters.");

        const now = new Date().toISOString();
        participant.checklist.push({
            templateId: `PERSONAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            title: cleanTitle,
            required: true,
            isPersonal: true,
            completed: false,
        });
        participant.status = "IN_PROGRESS";
        task.status = "IN_PROGRESS";
        task.updatedAt = now;
        saveTasks(tasks);
        return task;
    },

    updateChecklistItem(
        id: string,
        userId: string,
        templateId: string,
        completed: boolean
    ): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (
            task.status === "COMPLETED" ||
            task.status === "CANCELLED" ||
            task.status === "IN_REVIEW"
        ) {
            throw new Error("Checklist cannot be changed in this task status.");
        }

        const participant = task.participants.find(
            (item) => item.userId === userId
        );

        if (!participant) {
            throw new Error("You are not a participant in this task.");
        }

        if (
            participant.status === "SUBMITTED" ||
            participant.status === "APPROVED"
        ) {
            throw new Error("Your checklist has already been submitted.");
        }

        const checklistItem = participant.checklist.find(
            (item) => item.templateId === templateId
        );

        if (!checklistItem) {
            throw new Error("Checklist item not found.");
        }

        checklistItem.completed = completed;
        checklistItem.completedAt = completed
            ? new Date().toISOString()
            : undefined;

        participant.status = "IN_PROGRESS";
        task.status = "IN_PROGRESS";
        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return task;
    },

    submitParticipantWork(id: string, userId: string): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (
            task.status === "COMPLETED" ||
            task.status === "CANCELLED" ||
            task.status === "IN_REVIEW"
        ) {
            throw new Error("This task is not accepting submissions.");
        }

        const participant = task.participants.find(
            (item) => item.userId === userId
        );

        if (!participant) {
            throw new Error("You are not a participant in this task.");
        }

        if (
            participant.status === "SUBMITTED" ||
            participant.status === "APPROVED"
        ) {
            throw new Error("Your work has already been submitted.");
        }

        const incompleteTemplateItems = task.checklistTemplate.filter(
            (template) =>
                template.required &&
                !participant.checklist.some(
                    (item) => item.templateId === template.id && item.completed
                )
        );
        const incompletePersonalItems = participant.checklist.filter(
            (item) => item.isPersonal && item.required !== false && !item.completed
        );

        if (incompleteTemplateItems.length > 0 || incompletePersonalItems.length > 0) {
            throw new Error("Complete all required checklist items first.");
        }

        participant.status = "SUBMITTED";
        participant.submittedAt = new Date().toISOString();

        const allRequiredParticipantsSubmitted =
            task.participants.every(
                (item) =>
                    item.status === "SUBMITTED" ||
                    item.status === "APPROVED"
            );

        task.status = allRequiredParticipantsSubmitted
            ? "IN_REVIEW"
            : "IN_PROGRESS";

        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return task;
    },

    review(
        id: string,
        reviewer: ParticipantProfile,
        decision: "APPROVED" | "CHANGES_REQUESTED",
        comment: string
    ): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (reviewer.role !== "MANAGER" && reviewer.role !== "CEO") {
            throw new Error("Only a manager or CEO can review task completion.");
        }

        if (task.status !== "IN_REVIEW") {
            throw new Error("This task is not ready for review.");
        }

        if (!comment.trim()) {
            throw new Error("A review comment is required.");
        }

        const now = new Date().toISOString();

        if (decision === "APPROVED") {
            task.participants = task.participants.map((participant) => ({
                ...participant,
                status: "APPROVED",
                reviewComment: comment.trim(),
            }));

            task.status = "COMPLETED";
            task.reviewerId = reviewer.id;
            task.reviewerName = reviewer.name;
            task.reviewedAt = now;
            task.reviewComment = comment.trim();
        } else {
            task.participants = task.participants.map((participant) =>
                participant.status === "SUBMITTED"
                    ? {
                        ...participant,
                        status: "CHANGES_REQUESTED",
                        reviewComment: comment.trim(),
                    }
                    : participant
            );

            task.status = "IN_PROGRESS";
            task.reviewerId = reviewer.id;
            task.reviewerName = reviewer.name;
            task.reviewedAt = now;
            task.reviewComment = comment.trim();
        }

        task.updatedAt = now;
        saveTasks(tasks);

        return task;
    },

    cancel(id: string): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.status === "COMPLETED" || task.status === "CANCELLED") {
            throw new Error("This task cannot be cancelled in its current status.");
        }

        // Preserve the exact workflow state so reactivation resumes where it stopped.
        task.cancelledFromStatus = task.status;
        task.status = "CANCELLED";
        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return task;
    },

    reactivate(id: string): Task {
        const tasks = readTasks();
        const task = getTaskOrThrow(tasks, id);

        if (task.status !== "CANCELLED") {
            throw new Error("Only cancelled tasks can be reactivated.");
        }

        // Older localStorage records may not have cancelledFromStatus.
        // Infer a safe workflow state without discarding participant progress.
        const inferredStatus: Exclude<Task["status"], "CANCELLED" | "COMPLETED"> =
            task.participants.length === 0
                ? "AVAILABLE"
                : task.participants.every(
                    (participant) =>
                        participant.status === "SUBMITTED" ||
                        participant.status === "APPROVED"
                )
                    ? "IN_REVIEW"
                    : task.participants.some(
                        (participant) =>
                            participant.status === "IN_PROGRESS" ||
                            participant.status === "CHANGES_REQUESTED" ||
                            participant.checklist.some((item) => item.completed)
                    )
                        ? "IN_PROGRESS"
                        : "ASSIGNED";

        const restoredStatus = task.cancelledFromStatus ?? inferredStatus;
        task.status = restoredStatus;
        delete task.cancelledFromStatus;
        task.updatedAt = new Date().toISOString();

        saveTasks(tasks);
        return task;
    },
};
