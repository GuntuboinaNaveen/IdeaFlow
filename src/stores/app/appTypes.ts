
export interface AppState {
    sidebarCollapsed: boolean;
    mobileSidebarOpen: boolean;
}

export type AppAction =
    | { type: "TOGGLE_SIDEBAR" }
    | { type: "TOGGLE_MOBILE_SIDEBAR" }
    | { type: "CLOSE_MOBILE_SIDEBAR" };
