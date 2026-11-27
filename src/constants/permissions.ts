
export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW_ORGANIZATION: "dashboard:view_organization",
    DASHBOARD_VIEW_TEAM: "dashboard:view_team",
    DASHBOARD_VIEW_PERSONAL: "dashboard:view_personal",

    // Ideas
    IDEA_VIEW: "idea:view",
    IDEA_CREATE: "idea:create",
    IDEA_UPDATE: "idea:update",
    IDEA_DELETE: "idea:delete",
    IDEA_CONVERT_TO_TASK: "idea:convert_to_task",
    IDEA_REVIEW: "IDEA_REVIEW",

    // Tasks
    TASK_VIEW_ALL: "task:view_all",
    TASK_CREATE: "task:create",
    TASK_UPDATE: "task:update",
    TASK_DELETE: "task:delete",
    TASK_ASSIGN: "task:assign",
    TASK_PICKUP: "task:pickup",
    TASK_CANCEL: "task:cancel",
    TASK_REACTIVATE: "task:reactivate",

    // Checklist
    CHECKLIST_CREATE: "checklist:create",
    CHECKLIST_UPDATE: "checklist:update",
    CHECKLIST_COMPLETE: "checklist:complete",

    // Collaboration
    COMMENT_VIEW: "comment:view",
    COMMENT_CREATE: "comment:create",
    COMMENT_UPDATE_OWN: "comment:update_own",
    COMMENT_DELETE_OWN: "comment:delete_own",

    // Reviews
    REVIEW_VIEW: "review:view",
    REVIEW_CREATE: "review:create",
    REVIEW_APPROVE: "review:approve",
    REVIEW_REQUEST_CHANGES: "review:request_changes",

    // Employees
    USER_VIEW: "user:view",
    USER_MANAGE: "user:manage",

    // Reports
    REPORT_VIEW: "report:view",


} as const;

export type Permission =
    (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
