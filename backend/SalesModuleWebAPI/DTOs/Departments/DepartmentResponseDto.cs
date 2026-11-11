namespace SalesModuleWebAPI.DTOs.Departments
{
    public class DepartmentResponseDto
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public int PositionCount { get; set; }
    }
}
