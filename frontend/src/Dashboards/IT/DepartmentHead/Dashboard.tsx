
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="IT" position="DepartmentHead">
            <DashboardHome
                title="IT Department Head Dashboard"
                description="Monitor IT operations, employees, and requests."
                cards={[
                    { key: "itEmployees", title: "IT Employees" },
                    { key: "itRequests", title: "IT Requests" },
                    { key: "pendingTasks", title: "Pending Tasks" },
                    { key: "equipmentRecords", title: "Equipment Records" },
                ]}
            />
        </DashboardLayout>
    );
}
