import DashboardLayout from "../../../components/DashboardLayout";
import DashboardHome from "../../../components/DashboardHome";

export default function Dashboard() {
    return (
        <DashboardLayout department="Purchasing" position="PurchasingHead">
            <DashboardHome
                title="Purchasing Head Dashboard"
                description="Monitor purchase requests, supplier activity, and purchasing team tasks."
                cards={[
                    { key: "purchaseRequests", title: "Purchase Requests" },
                    { key: "pendingApprovals", title: "Pending Approvals" },
                    { key: "activeSuppliers", title: "Active Suppliers" },
                    { key: "purchaseOrders", title: "Purchase Orders" },
                ]}
            />
        </DashboardLayout>
    );
}
