
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Design" position="DesignSpecialist">
            <DashboardHome
                title="Design Specialist Dashboard"
                description="Manage assigned design projects and tasks."
                cards={[
                    { key: "myProjects", title: "My Projects" },
                    { key: "myTasks", title: "My Tasks" },
                    { key: "pendingRevisions", title: "Pending Revisions" },
                    { key: "completedDesigns", title: "Completed Designs" },
                ]}
            />
        </DashboardLayout>
    );
}
