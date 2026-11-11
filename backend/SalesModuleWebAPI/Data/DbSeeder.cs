
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SalesModuleWebAPI.Models;

namespace SalesModuleWebAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(
            IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var db = scope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

            var roleManager = scope.ServiceProvider
                .GetRequiredService<RoleManager<ApplicationRole>>();

            await db.Database.MigrateAsync();

            // 1. Create IT Department
            var department = await db.Departments
                .FirstOrDefaultAsync(d => d.Name == "IT Department");

            if (department == null)
            {
                department = new Department
                {
                    Name = "IT Department",
                    Description = "Information Technology Department"
                };

                db.Departments.Add(department);
                await db.SaveChangesAsync();
            }

            // 2. Create Positions
            string[] positions =
            {
                "System Administrator",
                "IT Officer"
            };

            foreach (var name in positions)
            {
                bool exists = await db.Positions.AnyAsync(p =>
                    p.Name == name &&
                    p.DepartmentId == department.Id);

                if (!exists)
                {
                    db.Positions.Add(new Position
                    {
                        Name = name,
                        DepartmentId = department.Id
                    });
                }
            }

            await db.SaveChangesAsync();

            // 3. Create Roles
            var roles = new[]
            {
                new ApplicationRole
                {
                    Name = "System Admin",
                    Description = "Full system access and configuration."
                },
                new ApplicationRole
                {
                    Name = "Administrator",
                    Description = "Manage users and operational records."
                },
                new ApplicationRole
                {
                    Name = "Manager",
                    Description = "Manage assigned department operations."
                },
                new ApplicationRole
                {
                    Name = "Staff",
                    Description = "Standard employee access."
                },
                new ApplicationRole
                {
                    Name = "User",
                    Description = "Basic system access."
                }
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name!))
                {
                    await roleManager.CreateAsync(role);
                }
            }
        }
    }
}
