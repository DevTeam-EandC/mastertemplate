using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Users
{
    public class CreateUserDto : Controller
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        public Guid? DepartmentId { get; set; }

        public Guid? PositionId { get; set; }

        public List<string> Roles { get; set; } = new();
    }
}
