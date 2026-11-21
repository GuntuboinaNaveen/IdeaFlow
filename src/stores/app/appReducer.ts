
import type { AppAction, AppState } from "./appTypes";

export const initialAppState: AppState = {
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
};

export function appReducer(
    state: AppState,
    action: AppAction
): AppState {
    switch (action.type) {
        case "TOGGLE_SIDEBAR":
            return {
                ...state,
                sidebarCollapsed: !state.sidebarCollapsed,
            };

        case "TOGGLE_MOBILE_SIDEBAR":
            return {
                ...state,
                mobileSidebarOpen: !state.mobileSidebarOpen,
            };

        case "CLOSE_MOBILE_SIDEBAR":
            return {
                ...state,
                mobileSidebarOpen: false,
            };

        default:
            return state;
    }
}
