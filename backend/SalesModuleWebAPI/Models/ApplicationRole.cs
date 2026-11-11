using Microsoft.AspNetCore.Identity;

namespace SalesModuleWebAPI.Models
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public string? Description { get; set; }
    }
}
