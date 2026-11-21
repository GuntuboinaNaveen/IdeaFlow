import { AuthProvider } from "../stores/auth/AuthProvider";
import { AppProvider } from "../stores/app/AppProvider";
import { AppRouter } from "./router";

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <AppRouter />
            </AppProvider>
        </AuthProvider>
    );
}

export default App;