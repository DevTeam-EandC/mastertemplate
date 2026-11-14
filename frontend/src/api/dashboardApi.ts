
import api from "./api";
import type { DashboardSummaryResponse } from "./dashboard.types";

export async function getDashboardSummary(
    departmentId: string,
    positionId: string
): Promise<DashboardSummaryResponse> {
    const response = await api.get<DashboardSummaryResponse>(
        "/Dashboard/summary",
        {
            params: {
                departmentId,
                positionId,
            },
        }
    );

    return response.data;
}
