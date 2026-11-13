
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="IT" position="DepartmentHead">
            <DashboardHome
                title="IT Department Head Dashboard"
                description="Monitor IT operations, employees, and requests."
                cards={[
                    { title: "IT Employees", value: 0 },
                    { title: "IT Requests", value: 0 },
                    { title: "Pending Tasks", value: 0 },
                    { title: "Equipment Records", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
