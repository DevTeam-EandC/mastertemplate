using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.Models
{
    public class Position
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Description { get; set; }

        public Guid DepartmentId { get; set; }

        public Department? Department { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;
    }
}
