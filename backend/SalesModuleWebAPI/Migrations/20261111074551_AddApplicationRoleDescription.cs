using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesModuleWebAPI.Migrations;

/// <inheritdoc />
public partial class _20261111074551_AddApplicationRoleDescription : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "AspNetRoles",
            type: "text",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Description",
            table: "AspNetRoles");
    }
}
