
import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Sales" position="SalesOfficer">
            <DashboardHome
                title="Sales Officer Dashboard"
                description="Manage daily sales activities and customer follow-ups."
                cards={[
                    { title: "My Activities", value: 0 },
                    { title: "Customer Follow-ups", value: 0 },
                    { title: "Sales Records", value: 0 },
                    { title: "Pending Tasks", value: 0 },
                ]}
            />
        </DashboardLayout>
    );
}
