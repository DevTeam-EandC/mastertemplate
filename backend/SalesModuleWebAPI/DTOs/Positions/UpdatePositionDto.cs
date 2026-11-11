using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Positions
{
    public class UpdatePositionDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        [Required]
        public Guid DepartmentId { get; set; }

        public bool IsActive { get; set; }
    }
}
