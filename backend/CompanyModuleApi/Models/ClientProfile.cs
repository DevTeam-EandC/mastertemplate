using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.Models;

// One client profile captured by an Account Manager.
// Once sent, Design Specialists can read it as a reference.
public class ClientProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Client information.
    [Required, MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    // Client project information.
    [Required, MaxLength(150)]
    public string BuildingType { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ProjectType { get; set; } = ClientProfileOptions.ProjectTypePrivate;

    [Required]
    public Guid SalesOfficerUserId { get; set; }

    public ApplicationUser? SalesOfficerUser { get; set; }

    // Set from the logged-in Account Manager on the server, never from the client.
    [Required]
    public Guid AccountManagerUserId { get; set; }

    public ApplicationUser? AccountManagerUser { get; set; }

    [Required, MaxLength(50)]
    public string LeadSource { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string TypeOfUnit { get; set; } = ClientProfileOptions.DefaultTypeOfUnit;

    [MaxLength(200)]
    public string? ReferralBy { get; set; }

    [MaxLength(2000)]
    public string? SpecialInstructions { get; set; }

    [Required, MaxLength(50)]
    public string QuotationType { get; set; } = string.Empty;

    // Quantity of elevators. Must match the number of ElevatorUnit rows.
    public int NumberOfElevators { get; set; }

    public ICollection<ElevatorUnit> Elevators { get; set; } = new List<ElevatorUnit>();

    public bool IsSentToDesign { get; set; }

    public DateTime? SentToDesignAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
