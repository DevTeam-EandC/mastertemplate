
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="IT" position="ITLead">
            <DashboardHome
                title="IT Lead Dashboard"
                description="Manage technical tasks and IT team activities."
                cards={[
                    { key: "teamTasks", title: "Team Tasks" },
                    { key: "technicalRequests", title: "Technical Requests" },
                    { key: "systemIssues", title: "System Issues" },
                    { key: "pendingAssignments", title: "Pending Assignments" },
                ]}
            />
        </DashboardLayout>
    );
}
