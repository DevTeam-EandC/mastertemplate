using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.Models
{
    public class UserDepartmentPosition
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public ApplicationUser? User { get; set; }

        [Required]
        public Guid DepartmentId { get; set; }

        public Department? Department { get; set; }

        [Required]
        public Guid PositionId { get; set; }

        public Position? Position { get; set; }

        public bool IsPrimary { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
