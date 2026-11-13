
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Design" position="DepartmentHead">
            <DashboardHome
                title="Design Department Head Dashboard"
                description="Monitor design employees, projects, and department tasks."
                cards={[
                    { title: "Design Employees", value: 0 },
                    { title: "Design Projects", value: 0 },
                    { title: "Pending Approvals", value: 0 },
                    { title: "Department Tasks", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
