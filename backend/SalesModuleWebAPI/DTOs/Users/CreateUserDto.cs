using System.ComponentModel.DataAnnotations;
using SalesModuleWebAPI.DTOs.UserAssignments;

namespace SalesModuleWebAPI.DTOs.Users
{
    public class CreateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        public List<string> Roles { get; set; } = new();

        public List<UserAssignmentItemDto> Assignments { get; set; }
            = new();
    }
}
