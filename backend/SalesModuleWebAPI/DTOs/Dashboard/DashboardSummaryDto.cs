
using SalesModuleWebAPI.DTOs.Dashboard;

namespace SalesModuleWebAPI.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public Dictionary<string, int> Metrics { get; set; } = new();

    public List<DashboardActivityDto> RecentActivities { get; set; } = new();
}
