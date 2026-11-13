
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="IT" position="ITLead">
            <DashboardHome
                title="IT Lead Dashboard"
                description="Manage technical tasks and IT team activities."
                cards={[
                    { title: "Team Tasks", value: 0 },
                    { title: "Technical Requests", value: 0 },
                    { title: "System Issues", value: 0 },
                    { title: "Pending Assignments", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
