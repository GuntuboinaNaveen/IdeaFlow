
export type IdeaStatus =
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "ACCEPTED"
    | "REJECTED"
    | "CONVERTED_TO_TASK";

export type IdeaCategory =
    | "PROCESS_IMPROVEMENT"
    | "PRODUCT"
    | "TECHNOLOGY"
    | "COST_SAVING"
    | "CUSTOMER_EXPERIENCE"
    | "OTHER";

export type IdeaPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Idea {
    id: string;
    title: string;
    description: string;
    category: IdeaCategory;
    priority: IdeaPriority;
    status: IdeaStatus;

    createdBy: string;
    createdByName: string;
    createdByRole: string;

    createdAt: string;
    updatedAt: string;

    reviewedBy?: string;
    reviewedAt?: string;
    reviewComment?: string;

    convertedTaskId?: string;
}

export interface CreateIdeaInput {
    title: string;
    description: string;
    category: IdeaCategory;
    priority: IdeaPriority;
}

export interface UpdateIdeaInput {
    title: string;
    description: string;
    category: IdeaCategory;
    priority: IdeaPriority;
}
