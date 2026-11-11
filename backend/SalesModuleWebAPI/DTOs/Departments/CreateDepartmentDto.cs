using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Departments
{
    public class CreateDepartmentDto
    {
        [Required]
        [StringLength(20, MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-z0-9-]+$")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}
