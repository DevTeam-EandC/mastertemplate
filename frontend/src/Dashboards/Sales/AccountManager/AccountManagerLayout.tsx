
import { Outlet } from "react-router-dom";
import AccountManagerSidebar from "../../../components/sidebars/AccountManagerSidebar";

export default function AccountManagerLayout() {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <AccountManagerSidebar />

            <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden p-6">
                <Outlet />
            </main>
        </div>
    );
}
