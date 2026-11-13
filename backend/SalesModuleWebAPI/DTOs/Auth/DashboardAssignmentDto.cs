
namespace SalesModuleWebAPI.DTOs.Auth
{
    public class DashboardAssignmentDto
    {
        public Guid DepartmentId { get; set; }

        public string DepartmentCode { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public Guid PositionId { get; set; }

        public string PositionName { get; set; } = string.Empty;

        public string DashboardKey { get; set; } = string.Empty;

        public bool IsPrimary { get; set; }
    }
}
