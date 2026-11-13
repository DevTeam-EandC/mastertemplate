
import DashboardLayout from "./../../../components/DashboardLayout";
import DashboardHome from "./../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Sales" position="AccountManager">
            <DashboardHome
                title="Account Manager Dashboard"
                description="Manage customer accounts and sales activities."
                cards={[
                    { title: "My Customers", value: 0 },
                    { title: "Active Accounts", value: 0 },
                    { title: "Pending Quotations", value: 0 },
                    { title: "Sales Activities", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
