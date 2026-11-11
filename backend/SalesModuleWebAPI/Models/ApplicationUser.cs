using Microsoft.AspNetCore.Identity;

namespace SalesModuleWebAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserDepartmentPosition> DepartmentAssignments
        { get; set; } = new List<UserDepartmentPosition>();
    }
}
