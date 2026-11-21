
import { useReducer, type ReactNode } from "react";
import { AppContext } from "./AppContext";
import { appReducer, initialAppState } from "./appReducer";

export function AppProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, dispatch] = useReducer(
        appReducer,
        initialAppState
    );

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}
