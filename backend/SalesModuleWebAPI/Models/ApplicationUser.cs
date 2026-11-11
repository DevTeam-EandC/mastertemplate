using Microsoft.AspNetCore.Identity;

namespace SalesModuleWebAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public Guid? DepartmentId { get; set; }

        public Department? Department { get; set; }

        public Guid? PositionId { get; set; }

        public Position? Position { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;
    }
}
