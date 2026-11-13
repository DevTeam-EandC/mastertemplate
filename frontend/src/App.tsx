
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { dashboardRoutes } from "./config/dashboardRoutes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {dashboardRoutes.map((route) => {
                    const Dashboard = route.component;

                    return (
                        <Route
                            key={route.key}
                            path={`/${route.path}/dashboard`}
                            element={<Dashboard />}
                        />
                    );
                })}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/Sales/AccountManager/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={<div className="p-10 text-center">Page not found</div>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
