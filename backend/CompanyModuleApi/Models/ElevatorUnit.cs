using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.Models;

// One elevator inside a project. Captured per elevator, so each
// unit can have its own type, capacity and stops.
public class ElevatorUnit
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ProjectId { get; set; }

    public Project? Project { get; set; }

    // 1-based position inside the profile, shown in the UI as "Elevator 1".
    public int SequenceNumber { get; set; }

    [Required, MaxLength(100)]
    public string ElevatorType { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string RatedCapacity { get; set; } = string.Empty;

    public int NumberOfFloors { get; set; }

    public int NumberOfStops { get; set; }

    public int NumberOfOpenings { get; set; }

    [Required, MaxLength(100)]
    public string MachineRoomType { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string TypeOfDoor { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ElevatorControlSystem { get; set; } = string.Empty;

    public bool ShaftExisting { get; set; }
}
