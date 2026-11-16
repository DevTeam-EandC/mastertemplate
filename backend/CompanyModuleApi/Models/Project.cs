using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.Models;

// One project for a client (a building or quotation). A client can have many projects.
public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ClientId { get; set; }

    public Client? Client { get; set; }

    [Required, MaxLength(150)]
    public string BuildingType { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ProjectType { get; set; } = ClientProfileOptions.ProjectTypePrivate;

    [Required]
    public Guid SalesOfficerUserId { get; set; }

    public ApplicationUser? SalesOfficerUser { get; set; }

    [Required, MaxLength(100)]
    public string TypeOfUnit { get; set; } = ClientProfileOptions.DefaultTypeOfUnit;

    [Required, MaxLength(50)]
    public string QuotationType { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? SpecialInstructions { get; set; }

    // Quantity of elevators. Must match the number of ElevatorUnit rows.
    public int NumberOfElevators { get; set; }

    public ICollection<ElevatorUnit> Elevators { get; set; } = new List<ElevatorUnit>();

    public bool IsSentToDesign { get; set; }

    public DateTime? SentToDesignAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
