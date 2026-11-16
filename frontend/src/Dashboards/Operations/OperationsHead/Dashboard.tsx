import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Operations" position="OperationsHead">
            <DashboardHome
                title="Operations Head Dashboard"
                description="Monitor operation requests, approvals, and active operational work."
                cards={[
                    { key: "operationRequests", title: "Operation Requests" },
                    { key: "pendingApprovals", title: "Pending Approvals" },
                    { key: "activeOperations", title: "Active Operations" },
                    { key: "operationalIssues", title: "Operational Issues" },
                ]}
            />
        </DashboardLayout>
    );
}
