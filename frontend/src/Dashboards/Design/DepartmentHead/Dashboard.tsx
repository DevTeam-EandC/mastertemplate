
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Design" position="DepartmentHead">
            <DashboardHome
                title="Design Department Head Dashboard"
                description="Monitor design employees, projects, and department tasks."
                cards={[
                    { key: "designEmployees", title: "Design Employees" },
                    { key: "designProjects", title: "Design Projects" },
                    { key: "pendingApprovals", title: "Pending Approvals" },
                    { key: "departmentTasks", title: "Department Tasks" },
                ]}
            />
        </DashboardLayout>
    );
}
