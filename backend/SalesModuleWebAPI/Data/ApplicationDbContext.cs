
using Microsoft.EntityFrameworkCore;

namespace CompanyWorkflow.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Database tables will be registered here as we create the models.
}
