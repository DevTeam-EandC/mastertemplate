namespace SalesModuleWebAPI.DTOs.UserAssignments
{
    public class UserDepartmentPositionDto
    {
        public Guid Id { get; set; }

        public Guid DepartmentId { get; set; }

        public string DepartmentCode { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;

        public Guid PositionId { get; set; }

        public string PositionName { get; set; } = string.Empty;

        public bool IsPrimary { get; set; }

        public bool IsActive { get; set; }

        public DateTime AssignedAtUtc { get; set; }
    }
}
