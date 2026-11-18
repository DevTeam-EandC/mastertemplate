import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Accounting" position="AccountingHead">
            <DashboardHome
                title="Accounting Head Dashboard"
                description="Manage accounting operations, financial records, budgets, and departmental reports."
                cards={[
                    { key: "financialRecords", title: "Financial Records" },
                    { key: "budgets", title: "Budgets" },
                    { key: "pendingPayments", title: "Pending Payments" },
                    { key: "financialReports", title: "Financial Reports" },
                ]}
            />
        </DashboardLayout>
    );
}
