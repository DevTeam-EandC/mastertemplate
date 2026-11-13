
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Design" position="DesignSpecialist">
            <DashboardHome
                title="Design Specialist Dashboard"
                description="Manage assigned design projects and tasks."
                cards={[
                    { title: "My Projects", value: 0 },
                    { title: "My Tasks", value: 0 },
                    { title: "Pending Revisions", value: 0 },
                    { title: "Completed Designs", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
