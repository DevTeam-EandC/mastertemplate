using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Departments
{
    public class UpdateDepartmentDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}
