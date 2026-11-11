using SalesModuleWebAPI.DTOs.UserAssignments;

namespace SalesModuleWebAPI.DTOs.Users
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;


        public List<UserDepartmentPositionDto> DepartmentAssignments
        { get; set; } = new();


        public List<string> Roles { get; set; } = new();

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
