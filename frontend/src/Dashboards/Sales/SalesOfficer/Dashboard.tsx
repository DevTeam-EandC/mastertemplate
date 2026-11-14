
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Sales" position="SalesOfficer">
            <DashboardHome
                title="Sales Officer Dashboard"
                description="Manage daily sales activities and customer follow-ups."
                cards={[
                    { key: "myActivities", title: "My Activities" },
                    { key: "customerFollowUps", title: "Customer Follow-ups" },
                    { key: "salesRecords", title: "Sales Records" },
                    { key: "pendingTasks", title: "Pending Tasks" },
                ]}
            />
        </DashboardLayout>
    );
}
