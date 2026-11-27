
export type TaskStatus =
    | "AVAILABLE"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "COMPLETED"
    | "CANCELLED";

export type ParticipantStatus =
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "CHANGES_REQUESTED"
    | "APPROVED";

export type ChecklistStatus = "PENDING" | "COMPLETED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";



export interface TaskChecklistTemplate {
    id: string;
    title: string;
    description?: string;
    required: boolean;
}

export interface ParticipantChecklistItem {
    /** Template ID for task-defined checklist items, or a generated ID for personal items. */
    templateId: string;
    completed: boolean;
    completedAt?: string;
    /** Present only for participant-created personal checklist items. */
    title?: string;
    required?: boolean;
    isPersonal?: boolean;
}

export type TaskJoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TaskJoinRequest {
    id: string;
    userId: string;
    userName: string;
    role: string;
    status: TaskJoinRequestStatus;
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewedByName?: string;
    reviewComment?: string;
}

export interface TaskParticipant {
    userId: string;
    userName: string;
    role: string;
    status: ParticipantStatus;
    checklist: ParticipantChecklistItem[];
    assignedAt: string;
    submittedAt?: string;
    reviewComment?: string;
}


export interface TaskReviewSnapshot {
    reviewerId?: string;
    reviewerName?: string;
    reviewedAt?: string;
    reviewComment?: string;
}

export interface TaskReactivationEvent {
    id: string;
    reactivatedBy: string;
    reactivatedByName: string;
    reactivatedAt: string;
    reason: string;
    previousStatus: TaskStatus;
    previousReviewerId?: string;
    previousReviewerName?: string;
    previousReviewedAt?: string;
    previousReviewComment?: string;
    participantSnapshot: Array<{
        userId: string;
        userName: string;
        status: ParticipantStatus;
        submittedAt?: string;
        reviewComment?: string;
    }>;
    addedChecklistItemIds: string[];
    previousReview?: TaskReviewSnapshot;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    /** Status to restore when a cancelled task is reactivated. */
    cancelledFromStatus?: Exclude<TaskStatus, "CANCELLED" | "COMPLETED">;

    createdBy: string;
    createdByName: string;

    sourceIdeaId?: string;

    participants: TaskParticipant[];
    /** Optional for backward compatibility with tasks created before join requests existed. */
    joinRequests?: TaskJoinRequest[];
    /** Audit trail for completed/cancelled task reactivation cycles. */
    reactivationHistory?: TaskReactivationEvent[];
    checklistTemplate: TaskChecklistTemplate[];

    startDate?: string;
    dueDate?: string;

    reviewerId?: string;
    reviewerName?: string;
    reviewedAt?: string;
    reviewComment?: string;

    createdAt: string;
    updatedAt: string;

}

export interface CreateTaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    participantIds: string[];
    checklistTemplate: Array<{
        title: string;
        description?: string;
        required: boolean;
    }>;
    startDate?: string;
    dueDate?: string;
    sourceIdeaId?: string;
}

export interface UpdateTaskInput {
    title: string;
    description: string;
    priority: TaskPriority;
    participantIds: string[];
    checklistTemplate: TaskChecklistTemplate[];
    startDate?: string;
    dueDate?: string;
}
