import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ClientsProvider } from "./context/ClientsContext";
import { RfqFormProvider } from "./context/RfqFormContext";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import SalesDashboard from "./pages/SalesDashboard";
import NewClient from "./pages/NewClient";
import ProjectOverview from "./pages/ProjectOverview";
import ClientOverview from "./pages/ClientOverview";

export default function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => sessionStorage.getItem("elevate-user") || "");

    function login(email) {
        sessionStorage.setItem("elevate-user", email);
        setUser(email);
    }
    function logout() {
        sessionStorage.removeItem("elevate-user");
        setUser("");
        navigate("/");
    }

    if (!user) return <Login onLogin={login} />;

    return (
        <ClientsProvider>
            <RfqFormProvider>
                <Routes>
                    <Route element={<AppLayout user={user} onLogout={logout} />}>
                        <Route index element={<SalesDashboard />} />
                        <Route path="new-client" element={<NewClient />} />
                        <Route path="client-overview" element={<ClientOverview />} />
                        <Route path="project-overview" element={<ProjectOverview />} />
                    </Route>
                </Routes>
            </RfqFormProvider>
        </ClientsProvider>
    );
}
