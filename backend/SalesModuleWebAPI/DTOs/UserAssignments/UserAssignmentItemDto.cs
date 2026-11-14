using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.UserAssignments
{
    public class UserAssignmentItemDto
    {
        [Required]
        public Guid DepartmentId { get; set; }

        [Required]
        public Guid PositionId { get; set; }

        public bool IsPrimary { get; set; }
    }
}
