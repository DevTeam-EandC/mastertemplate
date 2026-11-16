using CompanyModuleApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace CompanyModuleApi.Data
{
    public class ApplicationDbContext :
       IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        public DbSet<Department> Departments => Set<Department>();

        public DbSet<Position> Positions => Set<Position>();

        public DbSet<UserDepartmentPosition> UserDepartmentPositions
            => Set<UserDepartmentPosition>();

        public DbSet<Client> Clients => Set<Client>();

        public DbSet<Project> Projects => Set<Project>();

        public DbSet<ElevatorUnit> ElevatorUnits => Set<ElevatorUnit>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Department>()
    .HasIndex(d => d.Name)
    .IsUnique()
    .HasAnnotation("Npgsql:IndexMethod", "btree");

            builder.Entity<Department>()
                .Property(d => d.Name)
                .UseCollation("und-x-icu");

            builder.Entity<Position>()
                .HasIndex(p => new { p.DepartmentId, p.Name })
                .IsUnique();

            builder.Entity<Position>()
                .HasOne(p => p.Department)
                .WithMany(d => d.Positions)
                .HasForeignKey(p => p.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.TokenHash)
                    .IsRequired()
                    .HasMaxLength(64);

                entity.HasIndex(x => x.TokenHash)
                    .IsUnique();

                entity.HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            builder.Entity<Client>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.AccountManagerUser)
                    .WithMany()
                    .HasForeignKey(x => x.AccountManagerUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // One client record per email for each Account Manager.
                entity.HasIndex(x => new { x.AccountManagerUserId, x.EmailAddress })
                    .IsUnique();
            });

            builder.Entity<Project>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.Client)
                    .WithMany(c => c.Projects)
                    .HasForeignKey(x => x.ClientId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.SalesOfficerUser)
                    .WithMany()
                    .HasForeignKey(x => x.SalesOfficerUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => x.ClientId);
                entity.HasIndex(x => x.IsSentToDesign);
            });

            builder.Entity<ElevatorUnit>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.Project)
                    .WithMany(p => p.Elevators)
                    .HasForeignKey(x => x.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(x => new { x.ProjectId, x.SequenceNumber })
                    .IsUnique();
            });

            builder.Entity<UserDepartmentPosition>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne(x => x.User)
                    .WithMany(u => u.DepartmentAssignments)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(x => x.Department)
                    .WithMany()
                    .HasForeignKey(x => x.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Position)
                    .WithMany()
                    .HasForeignKey(x => x.PositionId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(x => new
                {
                    x.UserId,
                    x.DepartmentId,
                    x.PositionId
                }).IsUnique();
            });
        }

    }
}
