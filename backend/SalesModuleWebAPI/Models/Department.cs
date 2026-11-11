using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.Models
{
    public class Department
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;

        public ICollection<Position> Positions { get; set; }
            = new List<Position>();
    }
}
