
import { createContext } from "react";
import type { Dispatch } from "react";
import type { AppAction, AppState } from "./appTypes";

export interface AppContextType {
    state: AppState;
    dispatch: Dispatch<AppAction>;
}

export const AppContext =
    createContext<AppContextType | null>(null);
