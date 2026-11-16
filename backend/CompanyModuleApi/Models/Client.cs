using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.Models;

// A client owned by one Account Manager. One client can have many projects.
public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Set from the logged-in Account Manager on the server, never from the client.
    [Required]
    public Guid AccountManagerUserId { get; set; }

    public ApplicationUser? AccountManagerUser { get; set; }

    [Required, MaxLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LeadSource { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ReferralBy { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
