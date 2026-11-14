
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Models;

namespace SalesModuleWebAPI.Data;

public static class DbSeeder
{
    // ==========================================
    // MAIN DATABASE SEEDER
    // ==========================================
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        // Apply pending EF Core migrations.
        await db.Database.MigrateAsync();
    }

    // ==========================================
    // SEED ALL DEVELOPMENT DATA
    // ==========================================
    public static async Task SeedSampleUsersAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        using var scope = services.CreateScope();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<ApplicationRole>>();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var password = configuration["SampleUsers:Password"];

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "SampleUsers:Password is missing from configuration.");
        }

        // 1. Seed departments.
        await SeedDepartmentsAsync(db);

        // 2. Seed positions.
        await SeedPositionsAsync(db);

        // 3. Seed Identity roles.
        await EnsureRoleAsync(roleManager, "System Admin");
        await EnsureRoleAsync(roleManager, "Employee");

        // 4. Seed users.
        await CreateUserAsync(
            userManager, db, password,
            "Admin", "User",
            "admin@company.local",
            "System Admin",
            []);

        // SALES
        await CreateUserAsync(
            userManager, db, password,
            "Maria", "Santos",
            "maria.sales@company.local",
            "Employee",
            [new("SALES", "Account Manager", true)]);

        await CreateUserAsync(
            userManager, db, password,
            "Pedro", "Reyes",
            "pedro.sales@company.local",
            "Employee",
            [new("SALES", "Sales Officer", true)]);

        // DESIGN
        await CreateUserAsync(
            userManager, db, password,
            "Ana", "Cruz",
            "ana.design@company.local",
            "Employee",
            [new("DESIGN", "Department Head", true)]);

        await CreateUserAsync(
            userManager, db, password,
            "Carlo", "Garcia",
            "carlo.design@company.local",
            "Employee",
            [new("DESIGN", "Design Specialist", true)]);

        // IT
        await CreateUserAsync(
            userManager, db, password,
            "Mark", "Dela Cruz",
            "mark.it@company.local",
            "Employee",
            [new("IT", "Department Head", true)]);

        await CreateUserAsync(
            userManager, db, password,
            "James", "Tan",
            "james.it@company.local",
            "Employee",
            [new("IT", "IT Lead", true)]);

        // MULTI-DEPARTMENT EMPLOYEE
        await CreateUserAsync(
            userManager, db, password,
            "John", "Dela Cruz",
            "john@company.local",
            "Employee",
            [
                new("SALES", "Account Manager", false),
                new("DESIGN", "Department Head", false),
                new("IT", "Department Head", true)
            ]);
    }

    // ==========================================
    // SEED DEPARTMENTS
    // ==========================================
    private static async Task SeedDepartmentsAsync(
        ApplicationDbContext db)
    {
        var departments = new[]
        {
            new DepartmentSeed("SALES", "Sales"),
            new DepartmentSeed("DESIGN", "Design"),
            new DepartmentSeed("IT", "Information Technology")
        };

        foreach (var item in departments)
        {
            var department = await db.Departments
                .FirstOrDefaultAsync(d => d.Code == item.Code);

            if (department == null)
            {
                db.Departments.Add(new Department
                {
                    Code = item.Code,
                    Name = item.Name,
                    IsActive = true
                });
            }
            else if (!department.IsActive)
            {
                department.IsActive = true;
            }
        }

        await db.SaveChangesAsync();
    }

    // ==========================================
    // SEED POSITIONS
    // ==========================================
    private static async Task SeedPositionsAsync(
        ApplicationDbContext db)
    {
        var positions = new[]
        {
            new PositionSeed("SALES", "Account Manager"),
            new PositionSeed("SALES", "Sales Officer"),

            new PositionSeed("DESIGN", "Department Head"),
            new PositionSeed("DESIGN", "Design Specialist"),

            new PositionSeed("IT", "Department Head"),
            new PositionSeed("IT", "IT Lead")
        };

        foreach (var item in positions)
        {
            var department = await db.Departments
                .FirstOrDefaultAsync(d =>
                    d.Code == item.DepartmentCode &&
                    d.IsActive);

            if (department == null)
            {
                throw new InvalidOperationException(
                    $"Department '{item.DepartmentCode}' was not found.");
            }

            var position = await db.Positions
                .FirstOrDefaultAsync(p =>
                    p.Name == item.PositionName &&
                    p.DepartmentId == department.Id);

            if (position == null)
            {
                db.Positions.Add(new Position
                {
                    Name = item.PositionName,
                    DepartmentId = department.Id,
                    IsActive = true
                });
            }
            else if (!position.IsActive)
            {
                position.IsActive = true;
            }
        }

        await db.SaveChangesAsync();
    }

    // ==========================================
    // ENSURE IDENTITY ROLE EXISTS
    // ==========================================
    private static async Task EnsureRoleAsync(
        RoleManager<ApplicationRole> roleManager,
        string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
            return;

        var result = await roleManager.CreateAsync(
            new ApplicationRole
            {
                Name = roleName,
                Description = $"{roleName} role"
            });

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Could not create role '{roleName}': " +
                string.Join("; ",
                    result.Errors.Select(e => e.Description)));
        }
    }

    // ==========================================
    // CREATE USER AND ASSIGN DEPARTMENT/POSITION
    // ==========================================
    private static async Task CreateUserAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext db,
        string password,
        string firstName,
        string lastName,
        string email,
        string role,
        List<SeedAssignment> assignments)
    {
        // Avoid duplicate accounts.
        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser != null)
            return;

        // Validate all positions before creating the user.
        var resolvedPositions = new List<Position>();

        foreach (var item in assignments)
        {
            var position = await db.Positions
                .Include(p => p.Department)
                .FirstOrDefaultAsync(p =>
                    p.Name == item.PositionName &&
                    p.Department != null &&
                    p.Department.Code == item.DepartmentCode &&
                    p.IsActive &&
                    p.Department.IsActive);

            if (position == null)
            {
                throw new InvalidOperationException(
                    $"Position '{item.PositionName}' in department " +
                    $"'{item.DepartmentCode}' was not found or is inactive.");
            }

            resolvedPositions.Add(position);
        }

        // Create user.
        var user = new ApplicationUser
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            UserName = email,
            EmailConfirmed = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Create Identity user.
        var createResult = await userManager.CreateAsync(
            user, password);

        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(
                $"Could not create user '{email}': " +
                string.Join("; ",
                    createResult.Errors.Select(e => e.Description)));
        }

        // Assign Identity role.
        var roleResult = await userManager.AddToRoleAsync(
            user, role);

        if (!roleResult.Succeeded)
        {
            await userManager.DeleteAsync(user);

            throw new InvalidOperationException(
                $"Could not assign role '{role}' to '{email}': " +
                string.Join("; ",
                    roleResult.Errors.Select(e => e.Description)));
        }

        // Assign department and position records.
        await using var transaction =
            await db.Database.BeginTransactionAsync();

        try
        {
            for (var i = 0; i < assignments.Count; i++)
            {
                var item = assignments[i];
                var position = resolvedPositions[i];

                db.UserDepartmentPositions.Add(
                    new UserDepartmentPosition
                    {
                        UserId = user.Id,
                        DepartmentId = position.DepartmentId,
                        PositionId = position.Id,
                        IsPrimary = item.IsPrimary,
                        IsActive = true,
                        AssignedAtUtc = DateTime.UtcNow
                    });
            }

            await db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();

            // Remove the user if assignment creation fails.
            await userManager.DeleteAsync(user);

            throw;
        }
    }

    // ==========================================
    // SEED MODELS
    // ==========================================
    private record DepartmentSeed(
        string Code,
        string Name);

    private record PositionSeed(
        string DepartmentCode,
        string PositionName);

    private record SeedAssignment(
        string DepartmentCode,
        string PositionName,
        bool IsPrimary);
}
