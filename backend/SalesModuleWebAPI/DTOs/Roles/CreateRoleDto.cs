using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Roles
{
    public class CreateRoleDto
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-z0-9 _-]+$")]
        public string Name { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }
    }
}
