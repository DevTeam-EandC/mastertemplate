using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.DTOs.ClientProfiles;

public class ElevatorUnitDto
{
    [Required, MaxLength(100)]
    public string ElevatorType { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string RatedCapacity { get; set; } = string.Empty;

    [Range(1, 200)]
    public int NumberOfFloors { get; set; }

    [Range(1, 200)]
    public int NumberOfStops { get; set; }

    [Range(1, 400)]
    public int NumberOfOpenings { get; set; }

    [Required, MaxLength(100)]
    public string MachineRoomType { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string TypeOfDoor { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ElevatorControlSystem { get; set; } = string.Empty;

    public bool ShaftExisting { get; set; }
}

public class SaveClientProfileDto
{
    // Client information.
    [Required, MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    // Client project information.
    [Required, MaxLength(150)]
    public string BuildingType { get; set; } = string.Empty;

    [Required]
    public Guid SalesOfficerUserId { get; set; }

    [Required, MaxLength(50)]
    public string LeadSource { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ReferralBy { get; set; }

    [MaxLength(2000)]
    public string? SpecialInstructions { get; set; }

    [Required, MaxLength(50)]
    public string QuotationType { get; set; } = string.Empty;

    // Quantity of elevators. Must equal Elevators.Count.
    [Range(1, 50)]
    public int NumberOfElevators { get; set; }

    [Required]
    public List<ElevatorUnitDto> Elevators { get; set; } = new();
}

public class ClientProfileOptionsDto
{
    public List<SalesOfficerOptionDto> SalesOfficers { get; set; } = new();
    public IReadOnlyList<string> LeadSources { get; set; } = Array.Empty<string>();
    public IReadOnlyList<string> QuotationTypes { get; set; } = Array.Empty<string>();
    public IReadOnlyList<string> DoorTypes { get; set; } = Array.Empty<string>();
    public IReadOnlyList<string> ControlSystems { get; set; } = Array.Empty<string>();
    public IReadOnlyList<string> ElevatorTypes { get; set; } = Array.Empty<string>();
    public IReadOnlyList<string> MachineRoomTypes { get; set; } = Array.Empty<string>();
    public string ProjectType { get; set; } = string.Empty;
    public string DefaultTypeOfUnit { get; set; } = string.Empty;
}

public class SalesOfficerOptionDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
}

public class ClientProfileResponseDto
{
    public Guid Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string BuildingType { get; set; } = string.Empty;
    public string ProjectType { get; set; } = string.Empty;
    public Guid SalesOfficerUserId { get; set; }
    public string SalesOfficerName { get; set; } = string.Empty;
    public Guid AccountManagerUserId { get; set; }
    public string AccountManagerName { get; set; } = string.Empty;
    public string LeadSource { get; set; } = string.Empty;
    public string TypeOfUnit { get; set; } = string.Empty;
    public string? ReferralBy { get; set; }
    public string? SpecialInstructions { get; set; }
    public string QuotationType { get; set; } = string.Empty;
    public int NumberOfElevators { get; set; }
    public bool IsSentToDesign { get; set; }
    public DateTime? SentToDesignAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public List<ElevatorUnitDto> Elevators { get; set; } = new();
}
