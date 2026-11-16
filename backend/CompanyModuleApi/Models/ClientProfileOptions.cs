namespace CompanyModuleApi.Models;

// Lookup values for the client profile form.
// The frontend reads these from GET api/ClientProfiles/options,
// so this file is the single source of truth for allowed values.
public static class ClientProfileOptions
{
    public const string SalesDepartmentCode = "SALES";
    public const string SalesOfficerPosition = "Sales Officer";
    public const string AccountManagerPosition = "Account Manager";

    public const string DesignDepartmentCode = "DESIGN";
    public const string DesignSpecialistPosition = "Design Specialist";

    public const string ProjectTypePrivate = "Private";
    public const string DefaultTypeOfUnit = "New Unit Without Inspection";

    public const int MaxElevators = 50;
    public const int MaxFloors = 200;
    public const int MaxOpenings = 400;

    public static readonly string[] LeadSources =
        ["Viber", "Email", "B2B", "Ads", "Social Media"];

    public static readonly string[] QuotationTypes =
        ["For Reference", "For Site Inspection"];

    public static readonly string[] DoorTypes =
        ["Through", "90 Degree"];

    public static readonly string[] ControlSystems =
        ["Simplex", "Group"];

    // PLACEHOLDER: the elevator type and machine room type lists were not
    // supplied with the brief. Replace these with the confirmed values.
    public static readonly string[] ElevatorTypes =
        ["Passenger", "Freight", "Hospital", "Residential"];

    public static readonly string[] MachineRoomTypes =
        ["Machine Room", "Machine Room-less"];
}
