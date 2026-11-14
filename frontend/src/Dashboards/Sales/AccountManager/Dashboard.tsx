
import DashboardLayout from "./../../../components/DashboardLayout";
import DashboardHome from "./../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <DashboardHome
                title="Account Manager Dashboard"
                description="Manage customer accounts and sales activities."
                cards={[
                    { key: "myCustomers", title: "My Customers" },
                    { key: "activeAccounts", title: "Active Accounts" },
                    { key: "pendingQuotations", title: "Pending Quotations" },
                    { key: "salesActivities", title: "Sales Activities" },
                ]}
            />
        </DashboardLayout>
    );
}
