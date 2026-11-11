namespace SalesModuleWebAPI.DTOs.Users
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public Guid? DepartmentId { get; set; }

        public string? DepartmentCode { get; set; }

        public string? DepartmentName { get; set; }

        public Guid? PositionId { get; set; }

        public string? PositionName { get; set; }

        public List<string> Roles { get; set; } = new();

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
